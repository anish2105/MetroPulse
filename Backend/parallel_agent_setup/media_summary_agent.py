import os
import asyncio
import warnings
from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.adk.tools import google_search
from google.genai import types
import mimetypes
from typing import List, Dict, Union
from prompts import media_prompts
from utils import get_media_type, get_mime_type, read_file_as_bytes, create_media_content

load_dotenv()
warnings.filterwarnings("ignore")

AGENT_MODEL = "gemini-2.0-flash-exp"
APP_NAME = "media_summary_agent"
USER_ID = "user_1"
SESSION_ID = "session_001"

# def get_media_type(file_path: str) -> str:
#     """Determine if file is image or video"""
#     mime_type, _ = mimetypes.guess_type(file_path)
#     if mime_type:
#         if mime_type.startswith('image/'):
#             return 'image'
#         elif mime_type.startswith('video/'):
#             return 'video'
#     return 'unknown'

# def get_mime_type(file_path: str) -> str:
#     """Get MIME type for the file"""
#     mime_type, _ = mimetypes.guess_type(file_path)
#     return mime_type or 'application/octet-stream'

# def read_file_as_bytes(file_path: str) -> bytes:
#     """Read file as bytes"""
#     with open(file_path, 'rb') as f:
#         return f.read()

def create_media_content(media_files: List[Union[str, Dict[str, Union[str, bytes]]]], analysis_prompt: str) -> types.Content:
    """Create content with media files and analysis prompt"""
    parts = [types.Part(text=analysis_prompt)]

    for item in media_files:
        # Case 1: item is already a dict with mime_type and data
        if isinstance(item, dict) and 'mime_type' in item and 'data' in item:
            parts.append(types.Part(inline_data=types.Blob(
                mime_type=item['mime_type'],
                data=item['data']
            )))
        # Case 2: item is a file path string
        elif isinstance(item, str):
            if not os.path.exists(item):
                print(f"Warning: File {item} not found, skipping...")
                continue

            mime_type = get_mime_type(item)
            file_data = read_file_as_bytes(item)

            parts.append(types.Part(inline_data=types.Blob(
                mime_type=mime_type,
                data=file_data
            )))
        else:
            print(f"Warning: Unsupported media item format: {item}")

    return types.Content(role='user', parts=parts)

async def analyze_media_async(media_files: list, system_prompt: str, analysis_prompt: str) -> str:
    """Analyze media files using Google ADK without function tools"""

    media_agent = Agent(
        name="media_analysis_agent",
        model=AGENT_MODEL,
        description="Expert agent for analyzing images and videos to extract comprehensive event information and provide detailed summaries.",
        instruction=system_prompt,
        tools=[google_search] if system_prompt and "search" in system_prompt.lower() else [],
    )

    session_service = InMemorySessionService()

    runner = Runner(
        agent=media_agent,
        app_name=APP_NAME,
        session_service=session_service
    )

    await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=SESSION_ID
    )

    content = create_media_content(media_files, analysis_prompt)
    final_response_text = "Agent did not produce a final response."

    async for event in runner.run_async(user_id=USER_ID, session_id=SESSION_ID, new_message=content):
        if event.is_final_response():
            if event.content and event.content.parts:
                final_response_text = event.content.parts[0].text
            elif event.actions and event.actions.escalate:
                final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
            break

    return final_response_text

async def analyze_media_files(media_files: list, system_prompt: str, analysis_prompt: str):
    """Sync wrapper for media analysis"""
    response = await analyze_media_async(media_files, system_prompt, analysis_prompt)
    return response
