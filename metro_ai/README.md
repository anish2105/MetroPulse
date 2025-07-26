# MetroPulse AI: Real-Time City Information Agent

MetroPulse AI is a sophisticated, cloud-native agentic workflow built with the Google Agent Development Kit (ADK). Given a city name, it concurrently fetches real-time information on movie showtimes, restaurants, and concerts, validates the data, and archives it in Google Cloud Storage.

This project serves as a powerful demonstration of building resilient, production-ready AI systems that can handle the inconsistencies of real-world data.

## Key Features

-   **Concurrent Data Fetching:** Utilizes a `ParallelAgent` to gather information for movies, restaurants, and concerts simultaneously, ensuring rapid response times.
-   **Robust Python-First Data Validation:** Leverages Pydantic schemas for strict, deterministic validation of the data structure and types *before* storage, ensuring data integrity.
-   **Intelligent Self-Healing Capability:** Implements a fallback "Corrector Agent" within a retry loop. If the initial data fails validation, a powerful LLM is invoked specifically to fix the data based on the precise validation error, making the pipeline resilient to LLM inconsistencies.
-   **Cloud-Native & Serverless:** Packaged as a Docker container and deployed on Google Cloud Run, providing a scalable, secure, and cost-effective FastAPI endpoint.
-   **Pure Python Final Processing:** A custom `BaseAgent` handles all final validation, data cleaning, and storage logic in deterministic Python, using LLMs only when necessary for specialized tasks.

## System Architecture

The application follows a sequential pipeline that orchestrates a parallel data-gathering step followed by a robust, custom processing step.

```mermaid
sequenceDiagram
    participant User
    participant Cloud Run (FastAPI)
    participant Parallel Agents
    participant FinalProcessor (Python Agent)
    participant Corrector (LLM Agent)
    participant GCS

    User->>+Cloud Run (FastAPI): POST /get-city-info (city: "Bengaluru")
    Cloud Run (FastAPI)->>+Parallel Agents: Run(city)
    Parallel Agents-->>-Cloud Run (FastAPI): Return raw JSON strings (movies, restaurants, concerts)
    Cloud Run (FastAPI)->>+FinalProcessor (Python Agent): Execute with raw data
    loop Max 3 Attempts
        FinalProcessor (Python Agent)->>FinalProcessor (Python Agent): 1. Validate data with Pydantic
        alt Validation Succeeds
            FinalProcessor (Python Agent)->>+GCS: Save validated JSON
            GCS-->>-FinalProcessor (Python Agent): Success
            break
        else Validation Fails
            FinalProcessor (Python Agent)->>+Corrector (LLM Agent): "Fix this data using this error message"
            Corrector (LLM Agent)-->>-FinalProcessor (Python Agent): Return corrected JSON string
        end
    end
    FinalProcessor (Python Agent)-->>-Cloud Run (FastAPI): Return final status message
    Cloud Run (FastAPI)-->>-User: {"response": "Success! Data saved to gs://..."}
```

## Project Structure

```
metro_ai/
├── agents/
│   ├── common_tools/
│   │   ├── __init__.py
│   │   ├── schemas.py          # Central Pydantic models for data validation.
│   │   └── data_handler.py     #  custom tool tos ave artifact in gcs.
│   ├── concert_agent/
│   │   └── agent.py            # Simple LLM agent to fetch concert data.
│   ├── movie_agent/
│   │   └── agent.py            # Simple LLM agent to fetch movie data.
│   ├── restaurant_agent/
│   │   └── agent.py            # Simple LLM agent to fetch restaurant data.
│   ├── corrector_agent.py         # The specialist LLM agent for self-healing.
│   ├── final_processor_agent.py # The custom Python agent for validation and storage.
│   └── orchestrator_agent/
│       └── agent.py            # Defines the master SequentialAgent pipeline.
├── .env                        # Local environment variables (DO NOT COMMIT).
├── .gcloudignore               # Files to ignore during gcloud deployment.
├── .dockerignore               # Files to ignore during Docker build (IMPORTANT for security).
├── Dockerfile                  # Instructions for building the container image.
├── main.py                     # The FastAPI server application.
├── requirements.txt            # Project dependencies.
├── setup_gcp.sh                # One-time script to configure GCP project permissions.
└── deploy.sh                   # Script to build and deploy the application to Cloud Run.
```

## Google Cloud Setup (One-Time)

Before deploying, you need to configure your Google Cloud project.

1.  **Enable APIs:** Ensure the following APIs are enabled in your GCP project:
    -   Cloud Run API
    -   Vertex AI API
    -   Cloud Storage API
    -   Cloud Build API
    -   Artifact Registry API (often enabled with Cloud Build)

2.  **Create a GCS Bucket:** Create a new Google Cloud Storage bucket to store the output artifacts.

3.  **Configure `.env` file:** Create a `.env` file in the root of the project with your specific configuration:
    ```env
    # Vertex backend config
    GOOGLE_CLOUD_LOCATION=us-central1
    GOOGLE_CLOUD_STAGING_BUCKET=gs://your-bucket-name-here
    GOOGLE_CLOUD_PROJECT=your-gcp-project-id-here

    # Optional: If you have GOOGLE_APPLICATION_CREDENTIALS set for local dev, it will be used.
    ```

4.  **Run the Setup Script:** Make the script executable and run it once to grant the necessary IAM permissions to the Cloud Run service account.
    ```bash
    chmod +x setup_gcp.sh
    ./setup_gcp.sh
    ```

## Local Development & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd metro_ai
    ```
2.  **Create a Python virtual environment:**
    ```bash
    python -m venv .venv
    source .venv/bin/activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Authenticate gcloud (for local runs):**
    ```bash
    gcloud auth application-default login
    ```
5.  **Run the FastAPI server locally:**
    ```bash
    uvicorn main:app --reload
    ```    The server will be available at `http://127.0.0.1:8000`.

## Deployment to Google Cloud Run

The entire deployment process is automated with a single script.

1.  **Ensure your `.env` file is correct.** The script reads from this file to configure the deployment.
2.  **Make the script executable:**
    ```bash
    chmod +x deploy.sh
    ```
3.  **Run the deployment:**
    ```bash
    ./deploy.sh
    ```
    The script will build the container image using Cloud Build and deploy it to a new service on Cloud Run. It will output the final service URL upon completion.

## API Usage

You can interact with the deployed API using any HTTP client.

### Sample Request (`curl`)

Replace `<your-service-url>` with the URL provided after deployment.

```bash
curl -X POST "<your-service-url>/get-city-info" \
-H "Content-Type: application/json" \
-d '{"city": "Bengaluru"}'
```

### Sample Success Response

```json
{
  "response": "Success! Data for Bengaluru was saved to GCS as 'city_data/bengaluru_20250727_013000.json' (Revision ID: 0)."
}
```

### Sample Failure Response (after retries)

```json
{
  "response": "ERROR: Failed to validate data after 3 attempts. Final error: <Pydantic validation error details>"
}
```