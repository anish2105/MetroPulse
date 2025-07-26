# agents/final_processor_agent.py
import json
import logging
import re
from datetime import datetime
from google.adk.agents import BaseAgent, LlmAgent
from google.adk.runners import InvocationContext
from google.adk.events import Event
from google.adk.artifacts import GcsArtifactService
from google.genai import types # This is already imported, we'll use it more
from pydantic import ValidationError
from .common_tools.schemas import CityData

logger = logging.getLogger(__name__)

# Helper functions remain the same
def _extract_json(text: str) -> str:
    if not text or not isinstance(text, str): return "{}"
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match: return match.group(0)
    return "{}"

def _clean_restaurant_ratings(restaurant_list: list) -> list:
    if not isinstance(restaurant_list, list): return []
    for restaurant in restaurant_list:
        rating = restaurant.get("rating")
        if rating is not None:
            try: restaurant["rating"] = float(rating)
            except (ValueError, TypeError): restaurant["rating"] = None
        else: restaurant["rating"] = None
    return restaurant_list

class FinalProcessorAgent(BaseAgent):
    artifact_service: GcsArtifactService
    corrector_agent: LlmAgent
    class Config:
        arbitrary_types_allowed = True

    async def _run_async_impl(self, ctx: InvocationContext):
        logger.info(f"[{self.name}] Starting final processing...")
        final_message = ""
        
        # This whole block is correct and doesn't need changes
        movies_str = ctx.session.state.get("movies_info", '{}')
        restaurants_str = ctx.session.state.get("restaurant_info", '{}')
        concerts_str = ctx.session.state.get("concert_info", '{}')
        city = ctx.session.state.get("city", "unknown_city")
        current_movies_data = json.loads(_extract_json(movies_str))
        current_restaurants_data = json.loads(_extract_json(restaurants_str))
        current_concerts_data = json.loads(_extract_json(concerts_str))
        MAX_RETRIES = 3
        for attempt in range(MAX_RETRIES):
            logger.info(f"[{self.name}] Validation attempt {attempt + 1}/{MAX_RETRIES}...")
            try:
                combined_data = { "city": city, "movies": current_movies_data.get("movies", []), "restaurants": { "veg_restaurants": current_restaurants_data.get("veg_restaurants", []), "nonveg_restaurants": current_restaurants_data.get("nonveg_restaurants", []) }, "concerts": current_concerts_data.get("concerts", []) }
                combined_data["restaurants"]["veg_restaurants"] = _clean_restaurant_ratings(combined_data["restaurants"]["veg_restaurants"])
                combined_data["restaurants"]["nonveg_restaurants"] = _clean_restaurant_ratings(combined_data["restaurants"]["nonveg_restaurants"])
                validated_data = CityData.model_validate(combined_data)
                final_json_string = validated_data.model_dump_json(indent=2)
                logger.info(f"[{self.name}] Data validation successful!")
                
                timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                filename = f"city_data/{city.lower().replace(' ', '_')}_{timestamp}.json"
                
                # --- THE FINAL, DEFINITIVE FIX ---
                # 1. Encode the string to bytes
                json_bytes = final_json_string.encode('utf-8')
                # 2. Wrap the bytes in the correct Part/Blob structure
                artifact_to_save = types.Part(inline_data=types.Blob(
                    mime_type="application/json",
                    data=json_bytes
                ))
                # 3. Pass the structured object to the 'artifact' parameter
                revision_id = await self.artifact_service.save_artifact(
                    app_name=ctx.app_name, user_id=ctx.user_id, session_id=ctx.session.id,
                    filename=filename, artifact=artifact_to_save
                )
                # ---------------------------------
                
                final_message = f"Success! Data for {city} was saved to GCS as '{filename}' (Revision ID: {revision_id})."
                break 

            except ValidationError as e:
                logger.warning(f"[{self.name}] Validation failed on attempt {attempt + 1}. Error: {e}")
                if attempt < MAX_RETRIES - 1:
                    logger.info(f"[{self.name}] Invoking CorrectorAgent...")
                    ctx.session.state["flawed_data"] = json.dumps(combined_data)
                    ctx.session.state["validation_error"] = str(e)
                    async for _ in self.corrector_agent.run_async(ctx): pass
                    corrected_str = ctx.session.state.get("corrected_data", '{}')
                    corrected_json = json.loads(_extract_json(corrected_str))
                    current_movies_data = corrected_json.get("movies", current_movies_data)
                    current_restaurants_data = corrected_json.get("restaurants", current_restaurants_data)
                    current_concerts_data = corrected_json.get("concerts", current_concerts_data)
                else:
                    final_message = f"ERROR: Failed to validate data after {MAX_RETRIES} attempts. Final error: {e}"
                    logger.error(f"[{self.name}] {final_message}")

            except Exception as e:
                final_message = f"ERROR: An unexpected error occurred. Details: {e}"
                logger.error(f"[{self.name}] {final_message}", exc_info=True)
                break 

        final_content = types.Content(role="model", parts=[types.Part(text=final_message)])
        yield Event(author=self.name, content=final_content)