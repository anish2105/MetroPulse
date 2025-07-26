# agents/final_processor_agent.py
import json
import logging
from datetime import datetime
from google.adk.agents import BaseAgent
from google.adk.runners import InvocationContext
from google.adk.events import Event
from google.adk.artifacts import GcsArtifactService
from pydantic import ValidationError # No model_config import
from .common_tools.schemas import CityData

logger = logging.getLogger(__name__)

class FinalProcessorAgent(BaseAgent):
    """
    A custom, non-LLM agent that performs the final steps in pure Python.
    """
    # Declare artifact_service as a Pydantic field.
    artifact_service: GcsArtifactService

    # --- THIS IS THE FIX FOR PYDANTIC v1 ---
    # Use an inner Config class to allow complex types like GcsArtifactService.
    class Config:
        arbitrary_types_allowed = True
    # ----------------------------------------

    async def _run_async_impl(self, ctx: InvocationContext):
        logger.info(f"[{self.name}] Starting final processing...")
        final_message = ""
        try:
            # The rest of the logic is unchanged and correct.
            movies_info_str = ctx.state.get("movies_info", '{}')
            restaurant_info_str = ctx.state.get("restaurant_info", '{}')
            concert_info_str = ctx.state.get("concert_info", '{}')
            city = ctx.state.get("city", "unknown_city")

            movies_data = json.loads(movies_info_str)
            restaurant_data = json.loads(restaurant_info_str)
            concert_data = json.loads(concert_info_str)

            combined_data = {
                "city": city,
                "movies": movies_data.get("movies", []),
                "restaurants": {
                    "veg_restaurants": restaurant_data.get("veg_restaurants", []),
                    "nonveg_restaurants": restaurant_data.get("nonveg_restaurants", [])
                },
                "concerts": concert_data.get("concerts", [])
            }

            validated_data = CityData.model_validate(combined_data)
            final_json_string = validated_data.model_dump_json(indent=2)
            logger.info(f"[{self.name}] Data validation successful.")

            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            filename = f"city_data/{city.lower().replace(' ', '_')}_{timestamp}.json"
            
            saved_artifact = self.artifact_service.save(
                name=filename,
                content=final_json_string.encode('utf-8')
            )
            final_message = f"Successfully validated and saved data to {saved_artifact.uri}"
            logger.info(f"[{self.name}] {final_message}")

        except ValidationError as e:
            final_message = f"ERROR: Data from agents failed Pydantic validation. Details: {e}"
            logger.error(f"[{self.name}] {final_message}")
        except Exception as e:
            final_message = f"ERROR: An unexpected error occurred in the final processing step. Details: {e}"
            logger.error(f"[{self.name}] {final_message}", exc_info=True)
        
        yield Event.create_final_response(agent_name=self.name, content=final_message)