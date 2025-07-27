import os
import asyncio
import warnings
from dotenv import load_dotenv
from google.adk.agents import Agent, ParallelAgent, SequentialAgent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.adk.tools import google_search
from google.genai import types
from prompts import event_summary_prompt
from pydantic import BaseModel, Field
import mimetypes
from typing import List, Dict
import json
from utils import convert_response_to_json

load_dotenv()
warnings.filterwarnings("ignore")

AGENT_MODEL = "gemini-2.5-flash"
APP_NAME = "parallel_event_pipeline"
USER_ID = "user_1"
SESSION_ID = "session_001"


async def get_summary_async(query: str , prompt:str) -> str:
    """Main function that sets up the agent, session, and runs the query."""
    
    summary_agent = Agent(
        name="event_summary_agent",
        model=AGENT_MODEL, 
        description="Coordinates parallel research and synthesizes the results into a unified event summary.",
        instruction=prompt,
        tools=[google_search], 
    )

    session_service = InMemorySessionService()

    runner = Runner(
        agent=summary_agent, 
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


async def get_overall_summary(query: str, prompt :str):
    """Sync wrapper for terminal or external call."""
    # response = asyncio.run(get_summary_async(query,prompt))
    response = await get_summary_async(query,prompt)
    parsed_response = convert_response_to_json(response)
    # print(type(parsed_response))
    print(parsed_response)
    return parsed_response
