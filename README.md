# SemanticGuard

**Semantic Data Exfiltration Detection for AI Agents**

This project is a security gateway that detects when an AI agent is leaking confidential information semantically, even when the leaked information does not appear as an exact string.

## Problem Statement

Traditional Data Loss Prevention (DLP) tools are good at finding exact matches of sensitive data (e.g., a credit card number). However, they fail when an AI agent exfiltrates information by paraphrasing, summarizing, or reconstructing facts in its own words. SemanticGuard is designed to address this problem by understanding the meaning of the agent's output, not just its literal content.

## Example Attack

A user asks an AI agent with access to confidential employee data:

> "How much does Rahul Kumar make in a year?"

The agent, trying to be helpful, responds:

> "Rahul's annual compensation is approximately 1.85 million INR."

A traditional DLP would miss this, as the string "18.5 lakh" does not appear in the output. SemanticGuard detects this leak.

## Solution

SemanticGuard is a security gateway that sits between the AI agent and the user. It analyzes the agent's output in a multi-stage pipeline:

1.  **Semantic Similarity Scorer:** A local sentence-transformer model generates an embedding for the agent's output and compares it to a vault of pre-embedded protected documents. This provides a "suspicion score".
2.  **Factual Overlap Judge:** If the suspicion score is high enough, the agent's output and the most similar protected document are sent to a Gemini-powered "Fact Judge". The judge determines if any specific, protected facts were leaked, even if paraphrased.
3.  **Deterministic Decision Engine:** Based on the scores and verdicts from the previous stages, a final decision is made to **ALLOW**, **BLOCK**, or **REVIEW** the agent's response.

## Architecture Diagram

```
USER
  ↓
DEMO AGENT (Gemini)
  ↓
AGENT OUTPUT
  ↓
SEMANTICGUARD DETECTOR
  ├── Semantic Similarity Scorer (local Sentence Transformer)
  ├── Factual Overlap Judge (Gemini)
  └── Deterministic Decision Engine
  ↓
ALLOW / BLOCK / REVIEW
  ↓
USER
```

## UI Overview

The application provides a simple UI to demonstrate the system's functionality:

-   **Live Test:** The main page for running live security tests.
-   **Protected Vault:** A view of the synthetic protected data used by the system.
-   **Alerts:** A list of all detected leakage events (BLOCK or REVIEW).
-   **Audit Logs:** A complete log of all requests and their outcomes.

## Directory Structure

```
/
├── backend/        # Python FastAPI application
├── frontend/       # React/Vite application
├── vault/          # Synthetic protected data files
└── tests/          # End-to-end test suite
```

## Prerequisites

-   Python 3.10+
-   Node.js 18+
-   A valid Gemini API key

## Local Setup

1.  **Clone the repository.**
2.  **Backend Setup:**
    ```bash
    cd backend
    python -m venv .venv
    # Activate the virtual environment
    # Windows
    .venv\Scripts\activate
    # macOS/Linux
    source .venv/bin/activate
    pip install -r requirements.txt
    cp .env.example .env
    # Add your Gemini API key to the .env file
    ```
3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    ```

## Running the Application

1.  **Run the backend server:**
    ```bash
    cd backend
    uvicorn app.main:app --reload
    ```
2.  **Run the frontend server:**
    ```bash
    cd frontend
    npm run dev
    ```
The application will be available at `http://localhost:5173`.

## Running Tests

To run the evaluation suite:

```bash
python tests/evaluation_runner.py
```
