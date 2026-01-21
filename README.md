<!-- Markdown Cheatsheet:
https://www.markdownguide.org/cheat-sheet/ -->

![Logo](https://raw.githubusercontent.com/jacobdcook/g3-gpt-public/main/readme-img/G3_4-crop.png)

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

![Login](https://raw.githubusercontent.com/jacobdcook/g3-gpt-public/main/readme-img/mock-chat.png)

### Design

![Workflow Diagram](https://raw.githubusercontent.com/jacobdcook/g3-gpt-public/main/readme-img/project-workflow-diagram.jpg)

### Implementation

Login Page
- Description: A clean and secure login interface integrated with Microsoft Azure Authentication.
- Purpose: Ensures secure access for authenticated users.
<img width="1241" alt="Screenshot 2024-12-01 at 8 02 47 PM" src="https://raw.githubusercontent.com/jacobdcook/g3-gpt-public/main/readme-img/login.png">

Chat Interface
- Description: The AI-powered chat interface enables users to query and retrieve document-related information in real time.
- Purpose: Acts as the primary interaction point for document retrieval.
<img width="1292" alt="Screenshot 2024-12-01 at 8 04 52 PM" src="https://raw.githubusercontent.com/jacobdcook/g3-gpt-public/main/readme-img/architecture-diagram.png">

Document Management Interface
- Description: Enables managers to upload, manage, and organize documents for retrieval.
- Purpose: Simplifies document maintenance while ensuring security.
<img src="https://raw.githubusercontent.com/jacobdcook/g3-gpt-public/main/readme-img/MyDocumentspage.png" width="1292">


### Team Members (Contributors)
- CJBrian Nocon                         cnocon@csus.edu
- Giselle Ortiz-Gutierrez               gisellevictoriaorti@csus.edu
- Prabhash Venkat Paila                 prabhashvenkatpaila@csus.edu
- Jacob Cook                            jacobcook@csus.edu
- Nicolas Hibbs                         nhibbs@csus.edu
- Muhammad Khawailad Khan               muhammadkhawailadkh@csus.edu
- Danny Mendiola                        danielmendiola@csus.edu
- Trang Tran                            trangtran@csus.edu         

### Timeline
August - October:

Week 1-2: Project Initiation

- Goals Defined:
 - Decided on the core purpose of the project (integrating document-based AI queries with seamless user interaction).
- Team Collaboration:
  - Assigned roles to team members (frontend, backend, API integration, etc.).
- Technology Stack Finalized:
  - Selected React, Node.js, Pinecone, Langchain, Azure Authentication, and OpenAI for the project.
- Setup:
  - Created the project repository on GitHub.
- Set up development environments for frontend and backend.
- Initial scaffolding of React app and Node.js backend.

Week 3-4: Initial Development

Frontend:
- Designed the basic layout with React, including navigation and placeholder components.
- Created pages for login, home, and user management.

Backend:
- Integrated Node.js with Azure Authentication API for user management.
- Built basic routes and API structure.

Database:
- Configured Pinecone for storing and querying vector embeddings.

Testing:
- Conducted initial unit tests on individual components and API endpoints.

October

Week 1-2: Feature Expansion

Frontend:
- Implemented login and registration pages using Microsoft Azure Authentication.
- Designed dynamic routing with React Router DOM.
- Created components for chat interactions and document management.

Backend:
- Connected backend to OpenAI’s API for processing user queries.
- Integrated Langchain for language processing tasks like summarization and translations.

Testing:
- Verified backend API responses using Postman.
- Debugged integration issues between the frontend and backend.

Week 3-4: Core Functionality Development

Frontend:
- Completed chat functionality with real-time user query handling.
- Added visual enhancements (responsive design, dialog boxes for logout, etc.).
- Integrated document upload and management pages.

Backend:
- Enhanced Pinecone integration for similarity searches with document embeddings.
- Optimized API request/response flow for performance.

Deployment Preparation:
- Set up Netlify for frontend deployment and Heroku for backend hosting.
- Configured environment variables for secure deployment.

Team Collaboration:
- Daily stand-ups to discuss blockers and progress.

November

Week 1-2: Final Integration and Polishing

Frontend:
- Debugged layout inconsistencies.
- Added dialog boxes for logout and confirmation prompts.
- Implemented role-based access control (e.g., Admin vs. User views).

Backend:
- Finalized API integrations for Langchain and Pinecone.
- Enhanced error handling and logging mechanisms.

Testing:
- Conducted integration testing to ensure seamless interaction between frontend and backend.
- Debugged and resolved edge cases (e.g., API timeouts, incorrect responses).

Deployment:
- Deployed the frontend on Netlify and the backend on Heroku.
- Verified deployments with live user testing.

Week 3-4: Project Finalization

Documentation:
- Created a comprehensive README with deployment instructions, testing details, and screenshots.
- Documented the maintenance manual, system test report, and user manual.

Final Testing:
- Performed regression testing to ensure no features broke after new additions.
- Stress-tested APIs for high query loads.

Presentation Preparation:
- Created slides and finalized the project demo.
- Prepared for Q&A with detailed knowledge of the implementation.


## Testing

We implemented a combination of manual and automated testing methods to ensure the reliability and robustness of the application:

- Unit Tests: Verified the functionality of individual components like APIs, user authentication, and document uploads.
- Integration Tests: Assessed interactions between multiple components, ensuring APIs, the database, and front-end elements work seamlessly.
- User Acceptance Testing (UAT): Conducted by team members simulating end-user scenarios to validate that the application meets the client’s requirements.

- Frontend: Browser Developer Tools for runtime logs and manual testing of UI interactions.
- Backend: Logs were examined using the terminal during local development and Heroku logs post-deployment.
- Netlify and Heroku Logs: Debugged errors in deploy builds or application execution.
- Automated Testing Frameworks: Used tools like Selenium and unit testing suites to automate regression testing.
Key Test Scenarios

- Login with Azure SSO for both admin and non-admin roles.
- Access control tests ensuring proper routing based on user roles.
- Database interactions: document uploads, retrieval, and error handling during uploads.
- API integrations with Pinecone, Langchain, and OpenAI for prompt handling and response generation.

### Automated Tests:
Run the automated tests using the following command:
  - npm test
Ensure all tests pass to validate the application's integrity.


## Deployment

Deployment Stack

Frontend: Deployed using Netlify for seamless CI/CD from the GitHub repository.
Backend: Deployed using Heroku, leveraging its integration with GitHub and support for Python buildpacks.
Database: Pinecone, a cloud-based vector database, connected to the backend.
Setup Process

Frontend Deployment (Netlify):
- Connect the GitHub repository to Netlify.
- Set up the build command and base directory:
- Build Command: CI=false npm run build
- Base Directory: g3gpt/build
- Deploy the application and add the Netlify URL to Azure’s redirect URIs.


### Frontend Deployment (Netlify):

Clone the Repository:
- Open a terminal and execute the following command:
    - git clone https://github.com/trangt202/G3-GPT.git

Navigate to the Frontend Directory:
- Change the directory to the frontend:
    - cd frontend 

Install Dependencies:
- Ensure all necessary packages are installed by running:
    - npm install

Build the Frontend for Production:
- Generate a production-ready build using:
    - npm run build
- This creates an optimized build folder containing the static assets.

Deploy on Netlify:
- Log in to your Netlify account.
- Create a new site by selecting the build folder as the deploy directory.
- Configure build settings (if needed):
- Build Command: npm run build

Publish Directory: build
Click Deploy Site to publish your frontend application.

### Backend Deployment (Heroku):
Heroku is used to deploy the backend, offering a managed environment for running Node.js applications.

Backend Deployment (Heroku):
- Configure the Heroku app with required buildpacks (Python).
- Add environment variables like OPENAI_API_KEY and PINECONE_API_KEY.
- Connect the GitHub repository for continuous integration and deployment.
- Deploy the backend branch manually or via automatic GitHub triggers.

Database Configuration (Pinecone):
- Set up the index on the Pinecone dashboard with:
    - Dimensions: 1024
    - Metric: Cosine
- Update the backend configuration file (cli.py) to reference the Pinecone index and API keys.


Clone the Repository:
- Use the following command to clone the repository:
    - git clone https://github.com/your-repo-link

Navigate to the Backend Directory:
- Change to the backend folder:
    - cd backend

Install Dependencies:
- Run the following to install all necessary packages:
    - npm install

Prepare Your Heroku Environment:
- Create a new app on the Heroku dashboard or use the Heroku CLI:
    - heroku create your-app-name

Set Up Environment Variables:
- Add your environment variables for APIs (e.g., Azure, Pinecone, Langchain, and OpenAI) using the Heroku dashboard or CLI:
    - heroku config:set API_KEY=your-api-key
    - heroku config:set AZURE_TENANT_ID=your-tenant-id
    - heroku config:set OPENAI_API_KEY=your-openai-key
- Ensure all required variables from .env are added.

Deploy the Backend:
- Initialize a Heroku Git repository:
    - heroku git:remote -a your-app-name

- Deploy the backend to Heroku:
    - git add .
    - git commit -m "Initial Heroku deployment"
    - git push heroku main


Run sanity checks on the deployed application:
- Test login functionality for Azure SSO.
- Validate API responses by uploading and querying documents.
- Conduct end-to-end tests to simulate real user behavior.

