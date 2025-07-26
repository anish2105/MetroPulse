# agents/common_tools/data_handler.py
import json
import logging
from datetime import datetime
from pydantic import ValidationError
from .schemas import CityData # Import our master Pydantic schema

logger = logging.getLogger(__name__)

class DataHandlerTool:
    """
    A powerful Python tool that handles data validation and storage.
    It does not use an LLM for validation, it uses Pydantic directly.
    """
    def __init__(self, artifact_service):
        if artifact_service is None:
            raise ValueError("DataHandlerTool requires an artifact_service.")
        self.artifact_service = artifact_service

    def validate_and_save(
        self,
        city: str,
        movies_info_str: str,
        restaurant_info_str: str,
        concert_info_str: str
    ) -> str:
        """
        Takes raw JSON strings from other agents, validates them against the
        master Pydantic schema, and saves the result to GCS.
        """
        logger.info("Starting data validation and save process.")
        try:
            # 1. Parse the raw JSON strings into Python dictionaries
            movies_data = json.loads(movies_info_str)
            restaurant_data = json.loads(restaurant_info_str)
            concert_data = json.loads(concert_info_str)

            # 2. Combine them into the structure our Pydantic model expects
            combined_data = {
                "city": city,
                "movies": movies_data.get("movies", []),
                "restaurants": {
                    "veg_restaurants": restaurant_data.get("veg_restaurants", []),
                    "nonveg_restaurants": restaurant_data.get("nonveg_restaurants", [])
                },
                "concerts": concert_data.get("concerts", [])
            }

            # 3. Validate the data using Pydantic
            validated_data = CityData.model_validate(combined_data)
            logger.info("Pydantic validation successful.")

            # 4. Serialize the *validated* data back to a clean JSON string
            final_json_string = validated_data.model_dump_json(indent=2)

        except json.JSONDecodeError as e:
            error_msg = f"CRITICAL: Failed to parse JSON from an agent. Error: {e}"
            logger.error(error_msg)
            return error_msg
        except ValidationError as e:
            error_msg = f"CRITICAL: Pydantic validation failed. The data from the agents did not match the required schema. Error: {e}"
            logger.error(error_msg)
            return error_msg
        except Exception as e:
            error_msg = f"An unexpected error occurred during data processing: {e}"
            logger.error(error_msg, exc_info=True)
            return error_msg

        # 5. Save the final, validated JSON string to GCS
        try:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            filename = f"city_data/{city.lower().replace(' ', '_')}_{timestamp}.json"
            content_bytes = final_json_string.encode('utf-8')

            # Using the correct .save() method as per the documentation
            saved_artifact = self.artifact_service.save(
                name=filename,
                content=content_bytes
            )
            success_message = f"Successfully validated and saved city information for {city} to {saved_artifact.uri}"
            logger.info(success_message)
            return success_message
        except Exception as e:
            error_msg = f"Error during GCS save operation: {e}"
            logger.error(error_msg, exc_info=True)
            return error_msg