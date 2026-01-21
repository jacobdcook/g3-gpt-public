# cli.py
import os
import fitz  # PyMuPDF
import uuid
import json
import requests
from datetime import datetime, timezone
from fastapi import FastAPI, File, Form, UploadFile, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pinecone import ServerlessSpec, Pinecone
from dotenv import load_dotenv
from pydantic import SecretStr
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from typing import List
from time import localtime, strftime
import jwt

# Pinecone index name
index_name = "senior-project"

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://csus-sleep-cravers.netlify.app",  # Development URL
    # Add the base URL of your production app
]

BACKEND_BASE_URL = "http://localhost:3001"

# Initialize FastAPI
app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://csus-sleep-cravers.netlify.app",  # Development URL
        # Add the base URL of your production app
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Pinecone
pinecone_api_key = os.getenv("PINECONE_API_KEY")
if not pinecone_api_key:
    raise ValueError("Pinecone API key not found in environment variables")

pinecone_client = Pinecone(api_key=pinecone_api_key)

# Initialize LangChain
openai_api_key = os.getenv("OPENAI_API_KEY")
llm_inactive = not openai_api_key

llmChat = ChatOpenAI(
    model="gpt-4",
    temperature=0.3,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    api_key=SecretStr(openai_api_key),
)


@app.on_event("startup")
async def startup_event():
    try:
        index = pinecone_client.Index(index_name)
        print(f"✅ Connected to Pinecone index '{index_name}'.")
    except Exception as e:
        pinecone_client.create_index(
            name=index_name,
            dimension=1024,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        index = pinecone_client.Index(index_name)
        print(f"✅ Created and connected to Pinecone index '{index_name}'.")


def get_user_roles_from_token(id_token):
    """
    Fetch and decode the Azure AD access token, returning a list of roles.
    """
    try:
        token = jwt.decode(
            str.encode(id_token),
            options={
                "verify_signature": False,
                "verify_aud": False,
                "verify_iss": False,
            },
        )

        # Decode roles from the token
        roles = token.get("roles", [])
        if roles:
            print("Roles decoded successfully:", roles)
        else:
            print("No roles found in the token.")

        return roles
    except Exception as e:
        print(f"Error getting user roles: {e}")
        return []


@app.post("/api/auth/callback")
async def handle_auth_code(request: Request):
    """
    Handle the auth_code sent by the frontend and exchange it for tokens.
    """
    try:
        data = await request.json()
        auth_code = data.get("code")
        if not auth_code:
            raise HTTPException(status_code=400, detail="Authorization code is missing")

        # Exchange auth_code for tokens
        access_token = exchange_auth_code(auth_code)
        roles = decode_roles_from_token(access_token)

        return {"access_token": access_token, "roles": roles}
    except Exception as e:
        print(f"Error handling auth code: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), fileRoles: str = Form(...)):
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads", exist_ok=True)
        temp_file_path = os.path.join("uploads", file.filename)

        # Write uploaded file to disk
        content = await file.read()
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(content)

        # Get file metadata
        size_kb = round(os.path.getsize(temp_file_path) / 1024, 2)
        upload_date = datetime.now(timezone.utc).isoformat()

        # Extract text from PDF/text file
        doc = fitz.open(temp_file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()

        # Create chunks with unique IDs
        data = [
            {"id": str(uuid.uuid4()), "text": s}
            for s in split_text(text, chunk_size=500, chunk_overlap=1)
        ]

        # Generate embeddings
        embeddings = pinecone_client.inference.embed(
            model="multilingual-e5-large",
            inputs=[d["text"] for d in data],
            parameters={"input_type": "passage", "truncate": "END"},
        )

        # Create vectors with metadata
        vectors = []
        for d, e in zip(data, embeddings):
            vectors.append(
                {
                    "id": d["id"],
                    "values": e["values"],
                    "metadata": {
                        "text": d["text"],
                        "filename": file.filename,
                        "roles": json.loads(fileRoles),
                        "size_kb": size_kb,
                        "upload_date": upload_date,
                    },
                }
            )

        # Upload to Pinecone
        index = pinecone_client.Index(index_name)
        index.upsert(vectors=vectors)

        backend_url = BACKEND_BASE_URL or "http://localhost:3001"

        print(f"✅ Uploaded '{file.filename}' with roles: {json.loads(fileRoles)}")

        return {
            "name": file.filename,
            "url": f"{backend_url}/uploads/{file.filename}",
            "size_kb": size_kb,
            "upload_date": upload_date,
            "roles": json.loads(fileRoles),
        }
    except Exception as e:
        print(f"❌ Error uploading file '{file.filename}': {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


def split_text(text, chunk_size=500, chunk_overlap=1):
    chunks = []
    text_length = len(text)
    for i in range(0, text_length, chunk_size - chunk_overlap):
        end_index = min(i + chunk_size, text_length)
        chunk = text[i:end_index]
        chunks.append(chunk)
    return chunks


@app.post("/api/delete")
async def delete_document(
    request: Request,  # , user_roles: List[str] = Depends(get_user_roles_from_token)
):
    try:
        data = await request.json()
        filename = data.get("filename")
        if not filename:
            return JSONResponse(
                status_code=400, content={"error": "Filename is required."}
            )

        print(f"🔍 Attempting to delete document '{filename}'")

        # Delete vectors from Pinecone
        index = pinecone_client.Index(index_name)
        res = index.query(
            vector=[0] * 1024,
            top_k=1000,
            include_metadata=True,
            filter={"filename": {"$eq": filename}},
        )

        ids_to_delete = [match["id"] for match in res["matches"]]

        if ids_to_delete:
            index.delete(ids=ids_to_delete)
            print(f"✅ Deleted vectors with IDs: {ids_to_delete}")
        else:
            print(f"⚠️ No vectors found for filename '{filename}'.")

        # Delete physical file
        file_path = os.path.join("uploads", filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"✅ Deleted file '{file_path}'.")
        else:
            print(f"⚠️ File '{file_path}' does not exist.")

        return {"message": f"Document '{filename}' deleted successfully."}
    except Exception as e:
        print(f"❌ Error deleting document '{filename}': {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/get-documents")
async def get_documents_by_role(
    request: Request,
):
    try:
        data = await request.json()
        id_token = data.get("idToken")
        user_roles = get_user_roles_from_token(id_token)

        print(f"🔍 Fetching documents for roles: {user_roles}")
        index = pinecone_client.Index(index_name)
        role_filter = {"roles": {"$in": user_roles}}

        res = index.query(
            vector=[0] * 1024,  # Dummy vector for metadata-only query
            top_k=1000,
            include_metadata=True,
            filter=role_filter,
        )

        documents = []
        seen_filenames = set()
        for match in res["matches"]:
            filename = match["metadata"]["filename"]
            if filename not in seen_filenames:
                seen_filenames.add(filename)
                documents.append(
                    {
                        "name": filename,
                        "url": f"{BACKEND_BASE_URL or 'http://localhost:3001'}/uploads/{filename}",
                        "size_kb": match["metadata"].get("size_kb", "Unknown"),
                        "upload_date": match["metadata"].get("upload_date", "Unknown"),
                        "roles": match["metadata"].get("roles", []),
                    }
                )

        print(f"✅ Retrieved {len(documents)} documents for roles: {user_roles}")
        return {"documents": documents}
    except Exception as e:
        print(f"❌ Error fetching documents for roles {user_roles}: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# async def handle_query(request: Request):
@app.get("/api/check-file-uploaded/{filename}")
async def handle_query(filename: str):
    try:
        print(f"🔍 Checking if file '{filename}' exists")

        if not filename:
            return JSONResponse(
                status_code=400, content={"error": "Filename is required."}
            )

        file_path = os.path.join("uploads", filename)
        if os.path.exists(file_path):
            print(f"✔️ Found file '{filename}' in the uploads directory.")
            return JSONResponse(status_code=200, content={"exists": True})
        else:
            index = pinecone_client.Index(index_name)
            res = index.query(
                vector=[0.0] * 1024,
                top_k=1,
                filter={"filename": {"$eq": filename}},
            )

            if not res["matches"]:
                print(f"✖️  File '{filename}' has not been uploaded.")
                return JSONResponse(status_code=200, content={"exists": False})
            else:
                print(f"✔️ Found file '{filename}' in the vector database.")
                return JSONResponse(status_code=200, content={"exists": True})

    except Exception as e:
        print(f"❌ Error checking if file '{filename}' exists: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/user-query")
async def handle_query(request: Request):
    try:
        if not llm_inactive:
            print("🔍 Received query from user")
            data = await request.json()
            id_token = data.get("idToken")
            curr_user_roles = get_user_roles_from_token(id_token)

            print(f"✔️ Received query from user with roles: {curr_user_roles}")

            query = data.get("query")

            # Get context and check role access
            context, role_matched = get_context(query, curr_user_roles)
            print(f"Context: {context[:200]}...")  # Debug log first 200 chars
            print(f"Role matched: {role_matched}")

            messages = [(m[0], m[1]) for m in json.loads(data.get("messages"))]
            messages.insert(
                0,
                (
                    "system",
                    "You are a highly specialized assistant that can only refer to the provided context. You are friendly and engage in casual conversation, but you do not speculate or provide information that is not present in the provided context.",
                ),
            )

            messages.append(
                (
                    "human",
                    """
                Do not say the word "context". Do not say any phrase like "Based on the provided information"

                Your name is G3-GPT. Act friendly, and engage in conversation. However, when it comes to requests about information, you are an assistant with limited knowledge. I will provide you that knowledge, followed by my request. Respond to the request based only around what is given as your knowledge. 
                
                If the request is a question about something specific and cannot be answered based on the knowledge section, present any relevant information from the knowledge, but do not make anything up, and do not address the fact that you were given knowledge. In this case respond in a natural way, but do not make anything up.

                # Your knowledge
                {context}

                # Request
                {query}
                """,
                ),
            )

            prompt = ChatPromptTemplate(messages=messages)
            prompt_value = prompt.invoke(
                {
                    "context": context,
                    "query": data.get("query"),
                }
            )

            ai_msg = await llmChat.ainvoke(prompt_value)

            return {"response": ai_msg.content}
        else:
            return {
                "response": "It looks like I can't connect to the AI. Please try again later."
            }
    except Exception as e:
        print(f"❌ Error handling user query: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})


def get_context(query, curr_user_roles, predefined_res=None):
    if not curr_user_roles:
        return "@NO_KNOWLEDGE@", False

    index = pinecone_client.Index(index_name)
    query_vec = pinecone_client.inference.embed(
        model="multilingual-e5-large",
        inputs=[query],
        parameters={"input_type": "passage", "truncate": "END"},
    )

    TOP_K = 10
    MIN_SCORE = 0.7

    res = (
        index.query(
            vector=query_vec[0]["values"],
            top_k=TOP_K,
            include_metadata=True,
        )
        if predefined_res is None
        else predefined_res
    )

    print(f"🔍 Pinecone query result: {res}")

    context = ""
    role_matched = False

    for match in res["matches"]:

        has_role = any(
            [True for role in curr_user_roles if role in match["metadata"]["roles"]]
        )

        if match["score"] >= MIN_SCORE and has_role:
            context += match["metadata"]["text"] + "\n"
            role_matched = True

    if role_matched:
        print(
            f"✅ Constructed context from Pinecone matches for role '{curr_user_roles}'."
        )
    else:
        print("⚠️ No relevant context found. Returning '@NO_KNOWLEDGE@'.")

    return context if context else "@NO_KNOWLEDGE@", role_matched
