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

def convert_media_file_details_to_media_files(media_file_details) -> List[Dict[str, Union[str, bytes]]]:
    """
    Convert MediaFileDetail objects to the format expected by create_media_content
    
    Args:
        media_file_details: List of MediaFileDetail objects from FastAPI request
        
    Returns:
        List of dictionaries with 'mime_type' and 'data' keys
    """
    converted_files = []
    
    for media_detail in media_file_details:
        # Convert list of integers back to bytes
        file_bytes = bytes(media_detail.bytes)
        
        converted_file = {
            'mime_type': media_detail.mimeType,
            'data': file_bytes
        }
        converted_files.append(converted_file)
    
    return converted_files

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
    
    # Convert MediaFileDetail objects to expected format if needed
    if media_files and hasattr(media_files[0], 'mimeType') and hasattr(media_files[0], 'bytes'):
        # This is a list of MediaFileDetail objects, convert them
        converted_media_files = convert_media_file_details_to_media_files(media_files)
    else:
        # This is already in the expected format (file paths or dicts)
        converted_media_files = media_files

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

    content = create_media_content(converted_media_files, analysis_prompt)
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
    # print("="*60)
    # print(response)
    return response