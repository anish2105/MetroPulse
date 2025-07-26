# main.py
import os
import asyncio
import logging
from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.artifacts import GcsArtifactService
from google.genai import types

# Import the new factory function and tool
from agents.orchestrator_agent.agent import create_metro_pulse_agent
from agents.common_tools.storage import GcsStorageTool

# Basic configuration for logging to see success/error messages
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

async def main():
    # --- 1. SETUP SERVICES ---
    BUCKET = os.getenv("GOOGLE_CLOUD_STAGING_BUCKET")
    if not BUCKET:
        raise ValueError("GOOGLE_CLOUD_STAGING_BUCKET environment variable not set.")
    
    logger.info(f"Using GCS bucket: {BUCKET}")
    artifact_service = GcsArtifactService(bucket_name=BUCKET)
    session_service = InMemorySessionService()

    # --- 2. CONSTRUCT THE AGENT WITH DEPENDENCIES ---
    # Instantiate the GCS tool and get its save_json method
    storage_tool = GcsStorageTool(artifact_service=artifact_service).save_json
    
    # Create the agent by passing the configured tool.
    # main.py does not need to know how the agent is built internally.
    metro_pulse_agent = create_metro_pulse_agent(storage_tool=storage_tool)

    # --- 3. CONFIGURE THE RUNNER ---
    runner = Runner(
        app_name="MetroPulseApp",
        agent=metro_pulse_agent,
        session_service=session_service,
        artifact_service=artifact_service,
    )

    # --- 4. RUN THE AGENT ---
    city_name = input("Enter City Name: ").strip()
    if not city_name:
        print("City name cannot be empty.")
        return

    user_id = f"user_{city_name.lower().replace(' ', '_')}"
    session_id = f"session_{city_name.lower().replace(' ', '_')}"

    session = await session_service.create_session(
        app_name="MetroPulseApp",
        user_id=user_id,
        session_id=session_id,
        state={"city": city_name} # State for resolving {city} placeholder
    )

    content = types.Content(role="user", parts=[types.Part(text=city_name)])

    logger.info(f"Running MetroPulse agent for '{city_name}'...")

    # Loop through events and print ONLY the final response
    final_message = ""
    async for event in runner.run_async(
        user_id=user_id,
        session_id=session.id,
        new_message=content
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final_message = event.content.parts[0].text
    
    print("\n--- Agent Run Complete ---")
    print(f"Final Message: {final_message}")
    print("--------------------------")


if __name__ == "__main__":
    # Ensure you have your __init__.py files in place
    # touch agents/__init__.py
    # touch agents/common_tools/__init__.py
    asyncio.run(main())