# Quickstart: Backend setup for RAG

## Set up your LLM

During development, we're using a model from OpenAI -- the applicability of these directions may vary based on your choice of LLM

Go to [platform.openai.com](https://platform.openai.com) and log in or create an account.

In the top nav bar, click 🔵*Dashboard*, then 🟡*API keys* in the sidebar.

_Optional:_ If you don't want to use the default project, you can create a new project under 🟢*Default project* in the top navigation bar

![Image](/readme-img/rag/openai-findkeybtn.png)

Verify your account if prompted, and create a new secret key. Give it a name, and make sure the project is the one you want to work in. Customize permissions as needed, in development we select All

![Image](/readme-img/rag/openai-genkey.png)

**Important:** before closing the next screen, copy your key and immediately save it to your environment:

![Image](/readme-img/rag/openai-savekey.png)

```bash
# backend/sample-pinecone/.env
OPENAI_API_KEY=paste-here
```

To use your API key you need to fund your OpenAI account with at least $5, which you can do by clicking your profile picture > _Your profile_ > _Billing_ in the side bar.

## Set up your vector database

### API key

Similar to the above process, in your vector database provider (we use Pinecone) generate your API key and save it to your `.env` file alongside your LLM key

```bash
# backend/sample-pinecone/.env
OPENAI_API_KEY=your-key-here
PINECONE_API_KEY=your-key-here
```

### Embeddings

An **index** is where all of our vectors and associated data (embeddings) will be stored.

Before creating the index in your vector database, it's important to know the `dimension` and `metric` of your chosen **embedding model**, and to provide them at the create stage.

![Image](/readme-img/rag/new-index.png)

Pinecone provides a list of popular embedding models with their `dimension` and `metric` under "Setup by model" (see above). In development, we're using `multilingual-e5-large` because it allows us to use Pinecone's built-in solution for generating embeddings.

![Image](/readme-img/rag/embedding-models.png)

Other embedding models are likely to provide their own embedding functions, which would need to be reflected in `cli.py` `upload_file()` and `get_context()`

Enter your `dimensions` and `metric`, and make sure your index name matches the name of the `index_name` value at the top of `sample-pinecone/cli.py`. During development, we're using "senior-project"

![Image](/readme-img/rag/new-index2.png)

## Uploading documents to the Vector Database

Assuming you have set up your LLM, Vector Database, and local environment, you are now ready to embed data and upload to the VDB.

Start the application frontend:

```bash
# Install dependencies if needed
#   working directory: g3-gpt/g3gpt/
npm install

# Start the frontend
# Working directory: g3-gpt/g3gpt/
npm start
```

And in a separate terminal, start the backend (using `uvicorn`)

```bash
# Install dependencies if needed
#   working directory: g3-gpt/backend/sample-pinecone
pip install -r requirements.txt
cd ..

# Start the
#   working directory: g3-gpt/backend
#   --reload is useful for development, likely not desired for production
uvicorn sample-pinecone.cli:app --reload --port 3001
```

Currently the easiest way to upload a document is using the "+" button:

![Image](/readme-img/rag/upload-doc.png)

This will generate the document's embeddings and upload them to the vector database.

[Supported file formats](https://pymupdf.readthedocs.io/en/latest/how-to-open-a-file.html) are currently: `pdf, txt, svg, epub, xps, mobi, fb2, cbz`. Mainly text-based documents are recommended, as things like images are filtered out of the upload

### Room for improvement (10/13/24)

We are uploading only the text of the documents (with PyMuPdf's `get_text()`). We could optimize this further by also filtering out parts of the text that don't say anything, like separators or empty lines.

Since the app will be using a central VDB, we need to be more careful about what documents are uploaded -- e.g. no duplicate documents. This will require a rework of how we upload data, probably disabling the upload button for some users or delegating it only to the admin screen

In addition to providing text content in the vector metadata, we're also providing the filename. This could be useful for when we need to link the retrieved data to its original document, assuming the filenames never change in our storage solution. There may be other methods that would be more reliable. Since each document will upload many vectors, we want to avoid ever needing to update these identifiers in the VDB after the original upload.

## Retrieval Augmented Generation

The prompt fed to the LLM by the backend (`cli.py`) has been tailored to encourage a response strictly based on context retrieved from the vector database, or if no suitable context is found, an "I don't know" response.

Inherent to the nature of both LLMs and data vectorization, this behavior will not 100% reliable. That said, results have been encouraging so far. Here is an example on a dataset with information mostly pertaining to game engines, with a couple articles thrown in about car engines, and one about game theory.

![Image](/readme-img/rag/rag.png)
