import os
import asyncio
import warnings
from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.adk.tools import google_search
from google.genai import types
from prompt import event_summary_prompt
from pydantic import BaseModel, Field
from utils import convert_response_to_json

load_dotenv()
warnings.filterwarnings("ignore")

AGENT_MODEL= "gemini-2.5-flash"

APP_NAME = "summary_agent"
USER_ID = "user_1"
SESSION_ID = "session_001"

class EventSummaryOutput(BaseModel):
    Location: str = Field(description="Location of the event")
    Eventtype: str = Field(description="Classified event type")
    Eventname: str = Field(description="Paraphrased and apt name for the event")
    EventSummarize: str = Field(description="Final summary of the event, incorporating the classified type and any additional relevant information from the search results")

async def get_summary_async(query: str , prompt:str) -> str:
    """Main function that sets up the agent, session, and runs the query."""
    
    weather_agent = Agent(
        name="event_summary_agent",
        model=AGENT_MODEL, 
        description="Provides summary for user events and creates a report about the event.",
        instruction=prompt,
        tools=[google_search], 
    )

    session_service = InMemorySessionService()

    runner = Runner(
        agent=weather_agent, 
        app_name=APP_NAME,   
        session_service=session_service 
    )

    await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=SESSION_ID
    )

    content = types.Content(role='user', parts=[types.Part(text=query)])
    final_response_text = "Agent did not produce a final response."

    async for event in runner.run_async(user_id=USER_ID, session_id=SESSION_ID, new_message=content):
        if event.is_final_response():
            if event.content and event.content.parts:
                final_response_text = event.content.parts[0].text
            elif event.actions and event.actions.escalate:
                final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
            break 
    return final_response_text


def get_event_summary(query: str, prompt :str):
    """Sync wrapper for terminal or external call."""
    response = asyncio.run(get_summary_async(query,prompt))
    return response


if __name__ == "__main__":
    event_name =  "WATER_LOGGING"
    event_description = "Rainwater accumulated on roads, hard to drive. Locals wading through knee-deep water."
    event_location = "Koramangala 5th Block"
    system_prompt, user_prompt = event_summary_prompt(event_name, event_description, event_location)
    query = user_prompt
    prompt = system_prompt
    event_summary = get_event_summary(query,prompt)
    parsed_event_summary = convert_response_to_json(event_summary)
    print(parsed_event_summary)
