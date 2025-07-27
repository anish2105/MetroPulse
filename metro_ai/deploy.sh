#!/bin/bash
set -e

echo "[INFO] Starting MetroPulse API deployment script..."

if [ -f .env ]; then
  echo "[INFO] Loading environment variables from .env file for deployment..."
  export $(grep -v '^#' .env | xargs)
else
  echo "[ERROR] .env file not found! Cannot proceed with deployment."
  exit 1
fi

PROJECT_ID=$GOOGLE_CLOUD_PROJECT
REGION=$GOOGLE_CLOUD_LOCATION
GCS_BUCKET=$GOOGLE_CLOUD_STAGING_BUCKET
SERVICE_NAME="metropulse-api"

if [ -z "$PROJECT_ID" ] || [ -z "$REGION" ] || [ -z "$GCS_BUCKET" ]; then
  echo "[ERROR] One or more required variables are not set in your .env file. Exiting."
  exit 1
fi

echo "[INFO] Project ID: $PROJECT_ID"
echo "[INFO] Region: $REGION"

echo "[INFO] Setting gcloud config to project: $PROJECT_ID"
gcloud config set project $PROJECT_ID

echo "[INFO] Granting Cloud Run service account permissions for Vertex AI and GCS..."
SERVICE_ACCOUNT="$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')-compute@developer.gserviceaccount.com"

# Grant permission to invoke Vertex AI models
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/aiplatform.user" \
    --condition=None > /dev/null

# Grant permission to write to GCS buckets
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/storage.objectCreator" \
    --condition=None > /dev/null

echo "[INFO] IAM permissions are set."
echo "[INFO] Starting Cloud Run deployment for service '$SERVICE_NAME'..."

# This command passes all necessary environment variables for the application
# to correctly authenticate and configure itself in the Cloud Run environment.
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_CLOUD_STAGING_BUCKET=$GCS_BUCKET,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_LOCATION=$REGION,GOOGLE_GENAI_USE_VERTEXAI=true" \
  --platform managed

echo "------------------------------------------------------"
echo "[SUCCESS] Deployment complete!"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "Your API is available at: $SERVICE_URL"
echo "------------------------------------------------------"
echo "You can test it with the following command:"
echo "curl -X POST \"$SERVICE_URL/get-location-info\" -H \"Content-Type: application/json\" -d '{\"location\": \"Bengaluru\"}'"