# ai-engine-for-excel-and-google-sheet-data-manipulation
An AI engine capable of reading, analyzing, and updating data in an Excel sheet. The sheet contains both structured and unstructured data, and the engine uses LLM for processing unstructured data.

### Folder Structure

    .
    ├── scripts/                #  A folder storing individual scripts for generating structured and unstructured datasets 
    ├── src/
    │ ├── controllers/          # Route handlers and business logic
    │ ├── lib/                  # Utility libraries and shared modules
    │ ├── middleware/           # Custom middleware functions
    │ ├── routes/               # API route definitions
    │ └── index.js              # Application entry point
    └── uploads/                # Uploaded Excel files are stored here
   

###  Scripts for Dataset Generation

This directory "Scripts" contains scripts to generate structured or unstructured excel dataset.

- `generateStructuredDataset.js`: Creates a Structured dataset

    ```bash
    node scripts/generateStructuredDataset.js
- `generateUnStructuredDataset.js`:Creates a Unstructured dataset

    ```bash
    node scripts/generateUnStructuredDataset.js

## Getting Started

### 1. Clone the Repository

    
    git clone https://github.com/abinkrishnapv/ai-engine-for-excel-and-google-sheet-data-manipulation.git
    cd ai-engine-for-excel-and-google-sheet-data-manipulation


### 2. Setup .env

Create a file called .env at the root of your project and add:

    OPENAI_API_KEY=your-openai-api-key
    PORT=3000
    SESSION_SECRET=your-session-secret


### 3. Setup with Docker Compose

Make sure you have **Docker** and **Docker Compose** installed.

Then run:

    docker-compose up --build

 This will:

- Build the Node.js app Docker image.
- Start MongoDB on mongodb:27017
- Start ChromaDB on chromadb:8000
- Expose your Node.js app at http://localhost:3000

## API Endpoints

### 1. /userActions/uploadFile
Endpoint to upload structured or unstructured excel files

### 2.  /userActions/query
Endpoint to provide user input

## Access Swagger API Documentation
The API documentation is accessible via Swagger UI at:

    http://localhost:3000/api-docs

Swagger UI provides an interactive interface to explore and test the API endpoints.

