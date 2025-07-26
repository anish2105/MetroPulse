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
from typing import List, Dict

load_dotenv()
warnings.filterwarnings("ignore")

AGENT_MODEL = "gemini-2.0-flash-exp"
APP_NAME = "media_summary_agent"
USER_ID = "user_1"
SESSION_ID = "session_001"

def get_media_type(file_path: str) -> str:
    """Determine if file is image or video"""
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type:
        if mime_type.startswith('image/'):
            return 'image'
        elif mime_type.startswith('video/'):
            return 'video'
    return 'unknown'

def get_mime_type(file_path: str) -> str:
    """Get MIME type for the file"""
    mime_type, _ = mimetypes.guess_type(file_path)
    return mime_type or 'application/octet-stream'

def read_file_as_bytes(file_path: str) -> bytes:
    """Read file as bytes"""
    with open(file_path, 'rb') as f:
        return f.read()

def create_media_content(media_files: list, analysis_prompt: str) -> types.Content:
    """Create content with media files and analysis prompt"""
    parts = [types.Part(text=analysis_prompt)]
    
    if media_files:
        for file_path in media_files:
            if not os.path.exists(file_path):
                print(f"Warning: File {file_path} not found, skipping...")
                continue
                
            mime_type = get_mime_type(file_path)
            file_data = read_file_as_bytes(file_path)
            
            inline_data = types.Blob(
                mime_type=mime_type,
                data=file_data
            )
            
            parts.append(types.Part(inline_data=inline_data))
    
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

def analyze_media_files(media_files: list, system_prompt: str, analysis_prompt: str):
    """Sync wrapper for media analysis"""
    response = asyncio.run(analyze_media_async(media_files, system_prompt, analysis_prompt))
    return response

# Alternative approach using direct Gemini API (more reliable)
def direct_media_analysis(file_paths: List[str], prompt: str) -> List[Dict[str, str]]:
    """
    Direct analysis using Gemini API without ADK complexity
    
    Args:
        file_paths: List of image or video file paths
        prompt: Analysis prompt
        
    Returns:
        List of analysis results
    """
    import google.generativeai as genai
    
    # Configure Gemini
    genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    results = []
    
    for file_path in file_paths:
        if not os.path.exists(file_path):
            results.append({
                "file": os.path.basename(file_path),
                "media_type": "unknown",
                "summary": f"Error: File not found - {file_path}"
            })
            continue
            
        media_type = get_media_type(file_path)
        
        try:
            print(f"Processing file: {file_path}")
            
            # Upload and analyze file
            uploaded_file = genai.upload_file(file_path)
            response = model.generate_content([uploaded_file, prompt])
            
            results.append({
                "file": os.path.basename(file_path),
                "media_type": media_type,
                "summary": response.text
            })
            
        except Exception as e:
            results.append({
                "file": os.path.basename(file_path),
                "media_type": media_type,
                "summary": f"Error processing file: {str(e)}"
            })
    
    return results

def batch_media_analysis(file_paths: List[str], analysis_prompt: str) -> str:
    """Analyze multiple files and return combined summary"""
    results = direct_media_analysis(file_paths, analysis_prompt)
    
    combined_summary = "=== MEDIA ANALYSIS RESULTS ===\n\n"
    for result in results:
        combined_summary += f"📁 File: {result['file']} ({result['media_type']})\n"
        combined_summary += f"📋 Analysis: {result['summary']}\n"
        combined_summary += "=" * 60 + "\n\n"
    
    return combined_summary

if __name__ == "__main__":
    # System prompt for the agent
    system_prompt = """You are an expert visual analyst specializing in event detection and assessment from images and videos. 
    Analyze the provided media to extract:
    - Event type and classification
    - Location indicators and geographical context
    - Severity assessment and impact level
    - People, infrastructure, and environmental effects
    - Timeline indicators if visible
    - Safety and emergency response needs
    
    Provide structured, actionable insights with specific details observed in the media."""
    
    analysis_prompt = """Analyze these images/videos comprehensively and provide:

    1. EVENT IDENTIFICATION:
       - What type of event is occurring?
       - What is the severity level?

    2. VISUAL DETAILS:
       - Describe what you see in detail
       - Identify key elements and indicators

    3. LOCATION & CONTEXT:
       - Any location markers or identifiable features?
       - Environmental and infrastructural context

    4. IMPACT ASSESSMENT:
       - Who/what is affected?
       - Immediate and potential consequences

    5. RECOMMENDATIONS:
       - Immediate response needs
       - Priority actions required

    Be specific and detailed in your analysis."""
    
    # Example media files (replace with your actual file paths)
    media_files = [
        r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_1.mp4",
                            r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_image2.jpg",
                            r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_image1.jpg"
    ]
    
    print("=== ADK-based Media Analysis ===")
    try:
        adk_result = analyze_media_files(media_files, system_prompt, analysis_prompt)
        print(adk_result)
    except Exception as e:
        print(f"ADK Error: {e}")