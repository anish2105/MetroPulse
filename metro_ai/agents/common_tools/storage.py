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
        """
        try:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            filename = f"city_data/{city.lower().replace(' ', '_')}_{timestamp}.json"
            content_bytes = city_data_json.encode('utf-8')

            # --- THE FINAL, DOCUMENTATION-COMPLIANT METHOD NAME ---
            saved_artifact = self.artifact_service.save(
                name=filename,
                content=content_bytes
                # content_type is not a parameter for .save() according to the docs
            )
            # ----------------------------------------------------

            success_message = f"Successfully saved city information for {city} to {saved_artifact.uri}"
            logger.info(success_message)
            return success_message
        except Exception as e:
            error_message = f"Error: Could not save data to GCS. Reason: {e}"
            logger.error(f"Failed to save artifact to GCS for city {city}. Error: {e}", exc_info=True)
            return error_message