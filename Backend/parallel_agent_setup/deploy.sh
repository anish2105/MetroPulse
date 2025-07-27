#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# ----------------------------
# CONFIGURATION
# ----------------------------
SERVICE_NAME="multimodal-event-summarizer"
REGION="us-east1"
PROJECT_ID=$(gcloud config get-value project 2> /dev/null)

# ----------------------------
# ENVIRONMENT CHECKS
# ----------------------------

echo "🔍 Checking gcloud authentication..."
if ! gcloud auth list --format="value(account)" | grep -q "@"; then
  echo "❌ No authenticated gcloud account found. Run: gcloud auth login"
  exit 1
fi

echo "🔍 Checking if project is set..."
if [ -z "$PROJECT_ID" ]; then
  echo "❌ No GCP project is set. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi
echo "📌 Using project: $PROJECT_ID"

echo "🌐 Setting region to $REGION..."
gcloud config set run/region $REGION

echo "✅ Enabling required services..."
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# ----------------------------
# DEPLOYMENT
# ----------------------------

echo "🚀 Deploying $SERVICE_NAME to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated

echo "✅ Deployment complete!"
