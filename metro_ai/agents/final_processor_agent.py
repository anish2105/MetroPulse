# agents/final_processor_agent.py
import json
import logging
import re
from datetime import datetime
from google.adk.agents import BaseAgent
from google.adk.runners import InvocationContext
from google.adk.events import Event
from google.adk.artifacts import GcsArtifactService
from google.genai import types
from pydantic import ValidationError
from .common_tools.schemas import CityData

logger = logging.getLogger(__name__)

def _extract_json(text: str) -> str:
    """Extracts a JSON object from a string, even if it's wrapped in markdown."""
    if not text or not isinstance(text, str):
        return "{}"
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return match.group(0)
    return "{}"

def _clean_restaurant_ratings(restaurant_list: list) -> list:
    """
    Iterates through a list of restaurants and cleans the 'rating' field.
    Converts valid numbers to float and everything else to None.
    """
    if not isinstance(restaurant_list, list):
        return []
    for restaurant in restaurant_list:
        rating = restaurant.get("rating")
        if rating is not None:
            try:
                # Try to convert the rating to a float
                restaurant["rating"] = float(rating)
            except (ValueError, TypeError):
                # If it fails (e.g., it's a string), set it to None
                restaurant["rating"] = None
        else:
            restaurant["rating"] = None
    return restaurant_list

class FinalProcessorAgent(BaseAgent):
    """
    A custom, non-LLM agent that performs the final steps in pure Python.
    """
    artifact_service: GcsArtifactService
    class Config:
        arbitrary_types_allowed = True

    async def _run_async_impl(self, ctx: InvocationContext):
        logger.info(f"[{self.name}] Starting final processing...")
        final_message = ""
        try:
            movies_info_str = ctx.session.state.get("movies_info", '{}')
            restaurant_info_str = ctx.session.state.get("restaurant_info", '{}')
            concert_info_str = ctx.session.state.get("concert_info", '{}')
            city = ctx.session.state.get("city", "unknown_city")

            movies_data = json.loads(_extract_json(movies_info_str))
            restaurant_data = json.loads(_extract_json(restaurant_info_str))
            concert_data = json.loads(_extract_json(concert_info_str))

            combined_data = { "city": city, "movies": movies_data.get("movies", []), "restaurants": { "veg_restaurants": restaurant_data.get("veg_restaurants", []), "nonveg_restaurants": restaurant_data.get("nonveg_restaurants", []) }, "concerts": concert_data.get("concerts", []) }
            
            # --- THE FINAL FIX: Clean the data before validation ---
            combined_data["restaurants"]["veg_restaurants"] = _clean_restaurant_ratings(
                combined_data["restaurants"]["veg_restaurants"]
            )
            combined_data["restaurants"]["nonveg_restaurants"] = _clean_restaurant_ratings(
                combined_data["restaurants"]["nonveg_restaurants"]
            )
            # --------------------------------------------------------

            validated_data = CityData.model_validate(combined_data)
            final_json_string = validated_data.model_dump_json(indent=2)
            logger.info(f"[{self.name}] Data validation successful.")

            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            filename = f"city_data/{city.lower().replace(' ', '_')}_{timestamp}.json"
            
            revision_id = await self.artifact_service.save_artifact(
                app_name=ctx.app_name, user_id=ctx.user_id, session_id=ctx.session.id,
                filename=filename, artifact=final_json_string.encode('utf-8')
            )
            
            final_message = f"Success! Data for {city} was saved to GCS as '{filename}' (Revision ID: {revision_id})."
            logger.info(f"[{self.name}] {final_message}")

        except (ValidationError, json.JSONDecodeError) as e:
            final_message = f"ERROR: Failed to process agent outputs. Data may be malformed. Details: {e}"
            logger.error(f"[{self.name}] {final_message}")
        except Exception as e:
            final_message = f"ERROR: An unexpected error occurred in the final processing step. Details: {e}"
            logger.error(f"[{self.name}] {final_message}", exc_info=True)
        
        final_content = types.Content(role="model", parts=[types.Part(text=final_message)])
        yield Event(author=self.name, content=final_content)