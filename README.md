# G3-GPT: AI-Driven Document Retrieval

![Logo](/readme-img/G3_4-crop.png)

## Synopsis

Our client are Dan Sadowski and Chris Hepp from [G3 Enterprises](https://www.g3enterprises.com/), a global family-owned company that provides supply chain services to the leaders in the wine industry, including logistics, packaging, processing, and transporting.

### The Problem

Our client digitally keeps a considerable amount of internal information in the form of company documents. Dan noticed that there is no quick and simple way for Internal Systems Users to get access to crucial information from that information base. Our clients want an AI-facilitated application that can provide accurate, relevant responses to employees' questions, honoring the employee's level of access.

### Our Solution
G3-GPT: AI-Driven Document Retrieval
G3-GPT is an intelligent Retrieval-Augmented Generation (RAG) platform designed for efficient and secure access to internal documents. Utilizing advanced AI capabilities, the application acts as a virtual help desk, delivering concise and accurate information tailored to the user's role. This product ensures enhanced productivity and streamlines workflows by reducing the time spent searching for essential data.

## Development

### Planning

Our planning phase consisted of conducting extensive research into RAG and application development, with some pointers from our client. This search led us to the frameworks and AI concepts that we will continue to implement moving forward.

-   ReactJS for the front-end
-   Pinecone and Chroma as options for our vector database
    -   We are currently using Pinecone
-   OpenAIEmbeddings API for vectorizing the data

#### Mockups

We used Lunacy to create a mockup of our product to present to our client

<!-- TODO -->

![Login](/readme-img/mock-chat.png)

### Design

![Workflow Diagram](/readme-img/project-workflow-diagram.jpg)

### Implementation

Login Page
- Description: A clean and secure login interface integrated with Microsoft Azure Authentication.
- Purpose: Ensures secure access for authenticated users.

Chat Interface
- Description: The AI-powered chat interface enables users to query and retrieve document-related information in real time.
- Purpose: Acts as the primary interaction point for document retrieval.

## Tech Stack

- **Frontend:** React.js
- **Backend:** FastAPI (Python)
- **Vector Database:** Pinecone
- **AI/ML:** OpenAI Embeddings API, LangChain
- **Authentication:** Microsoft Azure SSO
- **Deployment:** Heroku

## Features

- Secure role-based access control
- Real-time document retrieval
- AI-powered question answering
- Vector database integration
- Azure SSO authentication

## Senior Capstone Project

This project was developed as part of the Computer Science Senior Capstone at California State University, Sacramento.