# agents/common_tools/storage.py
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class GcsStorageTool:
    """A tool for saving artifacts to Google Cloud Storage."""

    def __init__(self, artifact_service):
        if artifact_service is None:
            raise ValueError("GcsStorageTool requires an artifact_service.")
        self.artifact_service = artifact_service

    def save_json(self, city: str, city_data_json: str) -> str:
        """
        Saves the provided JSON string to a file in Google Cloud Storage.

        Args:
            city: The name of the city, used for generating the filename.
            city_data_json: A string containing the JSON data for the city.

        Returns:
            A confirmation message with the GCS URI of the saved file.
        """
        try:
            # Generate a unique filename
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            filename = f"city_data/{city.lower().replace(' ', '_')}_{timestamp}.json"

            # The content must be saved as bytes
            content_bytes = city_data_json.encode('utf-8')

            # Use the artifact service to save the file
            saved_artifact = self.artifact_service.save(
                name=filename,
                content=content_bytes,
                content_type="application/json"
            )
            logger.info(f"Successfully saved artifact to GCS: {saved_artifact.uri}")
            return f"Successfully saved city information for {city} to {saved_artifact.uri}"
        except Exception as e:
            logger.error(f"Failed to save artifact to GCS for city {city}. Error: {e}")
            return f"Error: Could not save data to GCS. Reason: {e}"