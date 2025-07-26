# main.py
import os
import asyncio
import logging
from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.artifacts import GcsArtifactService
from google.genai import types

from agents.orchestrator_agent.agent import create_metro_pulse_agent

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("metropulse.log", mode='w'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

load_dotenv()

async def main():
    BUCKET = os.getenv("GOOGLE_CLOUD_STAGING_BUCKET")
    if not BUCKET:
        raise ValueError("GOOGLE_CLOUD_STAGING_BUCKET environment variable not set.")
    
    # --- THIS IS THE FINAL FIX ---
    # Sanitize the bucket name to remove the 'gs://' prefix if it exists.
    if BUCKET.startswith("gs://"):
        bucket_name = BUCKET[5:]
    else:
        bucket_name = BUCKET
    # -----------------------------
    
    logger.info(f"Using GCS bucket: {bucket_name}")
    
    artifact_service = GcsArtifactService(bucket_name=bucket_name)
    session_service = InMemorySessionService()
    
    metro_pulse_agent = create_metro_pulse_agent(artifact_service=artifact_service)

    runner = Runner(
        app_name="MetroPulseApp",
        agent=metro_pulse_agent,
        session_service=session_service,
        artifact_service=artifact_service,
    )

    city_name = input("Enter City Name: ").strip()
    if not city_name:
        print("City name cannot be empty.")
        return

    user_id = f"user_{city_name.lower().replace(' ', '_')}"
    session_id = f"session_{city_name.lower().replace(' ', '_')}"

    session = await session_service.create_session(
        app_name="MetroPulseApp", user_id=user_id, session_id=session_id, state={"city": city_name}
    )

    content = types.Content(role="user", parts=[types.Part(text=city_name)])
    logger.info(f"Running MetroPulse agent for '{city_name}'...")

    final_message = ""
    async for event in runner.run_async(
        user_id=user_id, session_id=session.id, new_message=content
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final_message = event.content.parts[0].text
    
    print("\n--- Agent Run Complete ---")
    print(f"Final Message: {final_message}")
    print("--------------------------")
    logger.info("Agent run complete.")

if __name__ == "__main__":
    asyncio.run(main())