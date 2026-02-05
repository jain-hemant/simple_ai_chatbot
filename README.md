# Spur Chat Agent

A full‑stack AI customer support chat agent built for the Spur
Engineering take‑home assignment.\
The application simulates a real‑time chat widget where an AI assistant
helps users with shipping, returns, and general support queries using
Google Gemini.

The project focuses on clean architecture, minimal setup, and practical
engineering decisions rather than over‑engineering. It is designed to be
easy to run locally while still reflecting production‑ready structure
and scalability considerations.

------------------------------------------------------------------------

## Technology Stack

### Backend

-   Node.js
-   Express
-   TypeScript
-   PostgreSQL
-   Raw SQL (no ORM)

### Frontend

-   React
-   Vite
-   Tailwind CSS

### AI

-   Google Gemini (gemini-2.5-flash)

------------------------------------------------------------------------

## Running the Project Locally

### Prerequisites

You will need:

-   Node.js (v16 or higher)
-   PostgreSQL database (local or hosted such as NeonDB)
-   Google Gemini API key

Get an API key from: https://aistudio.google.com/app/apikey

------------------------------------------------------------------------

## Backend Setup

### Step 1 --- Navigate to server directory

``` bash
cd server
```

### Step 2 --- Install dependencies

``` bash
npm install
```

### Step 3 --- Create environment file

Create:

    server/.env

Add:

``` env
DATABASE_URL="postgres://user:password@hostname:5432/dbname?sslmode=require"
GEMINI_API_KEY="your_api_key_here"
PORT=5000
```

### Step 4 --- Start development server

``` bash
npm run dev
```

Expected output:

    Database tables initialized successfully
    Server running on http://localhost:5000

------------------------------------------------------------------------

## Frontend Setup

Open a new terminal.

### Step 1 --- Navigate to client directory

``` bash
cd client
```

### Step 2 --- Install dependencies

``` bash
npm install
```

### Step 3 --- Start Vite server

``` bash
npm run dev
```

Then open:

    http://localhost:5173

------------------------------------------------------------------------

## Database Design

The database uses two primary tables:

-   conversations
-   messages

Tables are automatically created when the server starts. No manual
migrations or seeds are required.

Schema logic is defined in:

    src/models/schema.ts

Domain knowledge (shipping, returns, store policies) is injected through
the system prompt rather than database seeding for faster setup and
reliability.

------------------------------------------------------------------------

## Architecture Overview

### Backend Structure

    server/
      controllers/
      services/
      models/
      middleware/
      src/

### Responsibilities

controllers\
Handle request validation and routing logic.

services\
Contain business logic and integrations. The Gemini API integration
lives here.

models\
Use raw SQL queries for persistence to keep the system lightweight.

middleware\
Global error handling to prevent crashes and ensure consistent
responses.

------------------------------------------------------------------------

### Frontend Structure

Key concepts:

Proxy configuration\
`vite.config.js` forwards `/api` calls to the backend to avoid CORS
issues.

Session management\
A UUID is stored in localStorage to maintain chat history across reloads
without requiring authentication.

------------------------------------------------------------------------

## LLM Implementation

Provider\
Google Gemini (gemini-1.5-flash) chosen for speed and cost efficiency.

Prompt strategy

-   System prompt defines store policies to prevent hallucinations\
-   Last 10 messages are sent as context to maintain conversation
    continuity\
-   Output token limit set to 300 to keep responses concise

------------------------------------------------------------------------

## Features

-   Real-time chat interface
-   AI-generated responses
-   Conversation persistence
-   Automatic database initialization
-   Clean modular architecture
-   Minimal configuration setup

------------------------------------------------------------------------

## Trade-offs and Design Decisions

Guest mode only\
Authentication was intentionally skipped to prioritize core chat
functionality within the time constraint.

Raw SQL instead of ORM\
Reduces complexity and overhead for a small project.

Prompt-based knowledge\
Simpler and more reliable than maintaining policy data in a database for
this use case.

------------------------------------------------------------------------

