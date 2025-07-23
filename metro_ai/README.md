# MetroPulse AI Agent

A Python-based agent for the MetroPulse system, built using Google's Agent Development Kit (ADK) and Vertex AI. This agent is designed to be authenticated via a Google Cloud Service Account.

## Prerequisites

*   Python 3.12+
*   [uv](https://github.com/astral-sh/uv) (Python package manager)
*   Google Cloud Account and Project
*   A Google Cloud Service Account with the following IAM roles:
    *   `Vertex AI User`
    *   `Storage Object Admin` (for the staging bucket)
*   Google Cloud CLI (`gcloud`) installed and configured

## Installation

1.  **Clone the Repository**
    ```bash
    git clone <your-repository-url>
    cd MetroPulse
    ```

2.  **Install `uv`**
    ```bash
    curl -LsSf https://astral.sh/uv/install.sh | sh
    ```

3.  **Create Virtual Environment and Install Dependencies**
    ```bash
    # Create the virtual environment in a .venv directory
    uv venv

    # Install all dependencies from pyproject.toml
    uv sync
    ```

4.  **Activate the Virtual Environment**
    ```bash
    source .venv/bin/activate
    ```

## Configuration

This project uses a Service Account for authentication with Google Cloud.

1.  **Create and Download Service Account Key**
    *   Navigate to the [Service Accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts) in the Google Cloud Console.
    *   Select your service account or create a new one.
    *   Go to the **Keys** tab, click **Add Key**, and choose **Create new key**.
    *   Select **JSON** as the key type and click **Create**. A JSON file will be downloaded to your computer.

2.  **Place the Credentials**
    *   Move the downloaded JSON file into the root of this project and rename it to `credentials.json`.

3.  **IMPORTANT: Secure Your Credentials**
    The `credentials.json` file contains private keys and provides access to your cloud resources. **Never commit it to version control.** The `.gitignore` file in this project should already be configured to ignore `credentials.json`. Verify this line exists:
    ```gitignore
    # .gitignore
    credentials.json
    ```

4.  **Create `.env` File**
    *   Create a file named `.env` in the project root. You can copy the provided `.env.example` as a template.
    *   Populate the `.env` file with your project-specific details. It will be loaded automatically by the deployment scripts.

    ```bash
    # .env
    GOOGLE_GENAI_USE_VERTEXAI=TRUE
    GOOGLE_APPLICATION_CREDENTIALS=credentials.json
    GOOGLE_CLOUD_PROJECT=your-gcp-project-id
    GOOGLE_CLOUD_LOCATION=us-central1
    GOOGLE_CLOUD_STAGING_BUCKET=gs://your-unique-bucket-name
    ```

5.  **Configure `gcloud` CLI and Enable APIs**
    This is still required for deploying and managing services.
    ```bash
    # Log in for CLI access (distinct from the service account)
    gcloud auth login
    gcloud config set project your-gcp-project-id

    # Enable the necessary services for the project
    gcloud services enable aiplatform.googleapis.com cloudbuild.googleapis.com run.googleapis.com
    ```

## Usage

Commands are executed using `uv run`. Ensure your virtual environment is active.

### Local Testing

1.  **Create a Local Session**
    ```bash
    uv run deploy-local --create_session
    ```

2.  **List Local Sessions**
    ```bash
    uv run deploy-local --list_sessions
    ```

3.  **Send a Message to a Local Session**
    ```bash
    uv run deploy-local --send --session_id=<your-session-id> --message="What is the status of the Express line?"
    ```

### Remote Deployment (Google Cloud Run)

1.  **Deploy the Agent**
    ```bash
    uv run deploy-remote --create
    ```

2.  **List Remote Deployments**
    ```bash
    uv run deploy-remote --list
    ```

3.  **Create a Session on a Deployed Agent**
    ```bash
    uv run deploy-remote --create_session --resource_id=<your-resource-id>
    ```

4.  **Send a Message to the Deployed Agent**
    ```bash
    uv run deploy-remote --send --resource_id=<your-resource-id> --session_id=<your-session-id> --message="Any delays at Central station?"
    ```

5.  **Delete a Specific Deployment**
    ```bash
    uv run deploy-remote --delete --resource_id=<your-resource-id>
    ```

6.  **Cleanup ALL Deployments (Use with Caution)**
    ```bash
    uv run deploy-remote --cleanup-all
    ```

## Deploying an Agent to Google Cloud Run

### Prerequisites

- **Google Cloud SDK (`gcloud`)**: Install and authenticate. [Instructions here](https://cloud.google.com/sdk/docs/install).
- **Project Root `Dockerfile.template`**: Ensure a `Dockerfile.template` exists in the project root with the following content:

    ```Dockerfile
    # Use the official ADK base image
    FROM us-docker.pkg.dev/agent-development-kit/adk-images/adk-agent-base:latest

    # Copy the agent-specific code and dependencies
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt

    # The __AGENT_DIR__ placeholder will be replaced by the script
    COPY agents/__AGENT_DIR__ /app/agents/__AGENT_DIR__

    # Set the agent directory environment variable for the ADK
    ENV AGENT_DIR=__AGENT_DIR__

    # Run the agent
    CMD ["adk", "run"]
    ```

---

### Step 1: Set Up Your Environment

Set environment variables for your Google Cloud project:

## Project Structure

```
MetroPulse/
├── deployment/            # Deployment scripts (local.py, remote.py)
├── metro_agent/           # Main agent package
├── .venv/                 # Virtual environment (managed by uv)
├── .env                   # Local environment variables (GIT IGNORED)
├── .env.example           # Template for .env file
├── credentials.json       # Service Account key (GIT IGNORED)
├── pyproject.toml         # Project configuration and dependencies
├── uv.lock                # Pinned dependency versions
└── README.md              # This file
```

## Troubleshooting

1.  **Authentication Errors (`PermissionDenied`):**
    *   Verify the `GOOGLE_APPLICATION_CREDENTIALS` in your `.env` file points to the correct JSON key file.
    *   Ensure the Service Account has the required IAM roles (`Vertex AI User`, `Storage Object Admin`) in your GCP project.
    *   Confirm the correct project ID is set in your `.env` file.

2.  **Deployment Failures:**
    *   Check the Cloud Build and Cloud Run logs in the Google Cloud Console for detailed error messages.
    *   Ensure the staging bucket specified in `GOOGLE_CLOUD_STAGING_BUCKET` exists and the service account has permission to write to it.