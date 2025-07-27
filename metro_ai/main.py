# main.py
import os
import asyncio
import logging
from contextlib import asynccontextmanager
import json

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
# --- ADD THIS IMPORT ---
from fastapi.middleware.cors import CORSMiddleware
# -----------------------

from dotenv import load_dotenv

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.artifacts import GcsArtifactService
from google.genai import types
from agents.common_tools.schemas import LocationData
from agents.orchestrator_agent.agent import create_metro_pulse_agent

# Only load .env for local development
if "K_SERVICE" not in os.environ:
    print("Running locally, loading .env file...")
    load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LocationInfoRequest(BaseModel):
    location: str
    # You had this in the previous version, it's good practice to keep it
    location_type: str = "city" 

app_state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup... Initializing ADK Runner.")
    
    # The libraries will now automatically pick up the environment variables
    # set by the deploy.sh script. No explicit init call is needed.
    
    BUCKET = os.getenv("GOOGLE_CLOUD_STAGING_BUCKET")
    if not BUCKET:
        raise ValueError("FATAL: GOOGLE_CLOUD_STAGING_BUCKET environment variable not set.")
    
    bucket_name = BUCKET[5:] if BUCKET.startswith("gs://") else BUCKET
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
    
    app_state["runner"] = runner
    app_state["session_service"] = session_service
    logger.info("ADK Runner initialized successfully.")
    
    yield
    
    logger.info("Application shutdown.")
    app_state.clear()

app = FastAPI(lifespan=lifespan)

# --- ADD THIS MIDDLEWARE CONFIGURATION ---
# This must be done after the `app = FastAPI()` line.
# It allows web pages from any origin to call your API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
# ----------------------------------------


@app.post("/get-location-info",  response_model=LocationData)
async def get_location_info(request: LocationInfoRequest):
    location_name = request.location
    location_type = request.location_type # Capture this from the request
    logger.info(f"Received request for {location_type}: {location_name}")

    runner = app_state.get("runner")
    session_service = app_state.get("session_service")
    if not runner or not session_service:
        raise HTTPException(status_code=500, detail="Server is not initialized properly.")

    user_id = f"api_user_{location_name.lower().replace(' ', '_')}"
    session_id = f"api_session_{location_name.lower().replace(' ', '_')}_{os.urandom(8).hex()}"

    try:
        # Pass both location and type to the agent's state
        session = await session_service.create_session(
            app_name="MetroPulseApp", user_id=user_id, session_id=session_id, 
            state={"location": location_name, "location_type": location_type}
        )
        
        content = types.Content(role="user", parts=[types.Part(text=f"Get info for {location_name}")])

        final_message_str = "Agent did not produce a final response."
        async for event in runner.run_async(
            user_id=user_id, session_id=session.id, new_message=content
        ):
            if event.is_final_response() and event.content and event.content.parts:
                final_message_str = event.content.parts[0].text
        
        response_data = json.loads(final_message_str)

        if isinstance(response_data, dict) and response_data.get("status") == "error":
            logger.error(f"Agent pipeline failed for {location_name}: {response_data.get('message')}")
            raise HTTPException(status_code=500, detail=response_data.get("message"))

        logger.info(f"Successfully processed request for {location_name}.")
        return response_data

    except json.JSONDecodeError:
        logger.error(f"Failed to parse the final agent response: {final_message_str}")
        raise HTTPException(status_code=500, detail="Agent returned a malformed non-JSON response.")
    except Exception as e:
        logger.error(f"An error occurred while processing request for {location_name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")

@app.get("/")
def read_root(): return {"status": "MetroPulse API is running"}