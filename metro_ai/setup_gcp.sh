#!/bin/bash
set -e

echo "[INFO] Starting one-time GCP project setup..."

# 1. --- Load Environment Variables ---
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "[ERROR] .env file not found!"
  exit 1
fi

# 2. --- Validate and Set Variables ---
PROJECT_ID=$GOOGLE_CLOUD_PROJECT
if [ -z "$PROJECT_ID" ]; then
  echo "[ERROR] GOOGLE_CLOUD_PROJECT is not set in your .env file. Exiting."
  exit 1
fi

echo "[INFO] Project ID: $PROJECT_ID"

# 3. --- Set gcloud CLI Project ---
echo "[INFO] Setting gcloud config to project: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# 4. --- Authorize the Cloud Run Service Account ---
echo "[INFO] Granting required IAM permissions to the default Cloud Run service account..."
SERVICE_ACCOUNT="$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')-compute@developer.gserviceaccount.com"

# Grant permission to invoke Vertex AI models
echo "[INFO] Granting AI Platform User role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/aiplatform.user" \
    --condition=None > /dev/null

# Grant permission to write to GCS buckets
echo "[INFO] Granting Storage Object Creator role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/storage.objectCreator" \
    --condition=None > /dev/null

echo "[SUCCESS] One-time project setup is complete."