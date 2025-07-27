import os
import asyncio
import warnings
from dotenv import load_dotenv
from google.adk.agents import Agent, ParallelAgent, SequentialAgent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.adk.tools import google_search
from google.genai import types
from prompt import event_summary_prompt
from pydantic import BaseModel, Field
from utils import convert_response_to_json
import mimetypes
from typing import List, Dict
import json

load_dotenv()
warnings.filterwarnings("ignore")

AGENT_MODEL = "gemini-2.5-flash"
APP_NAME = "parallel_event_pipeline"
USER_ID = "user_1"
SESSION_ID = "session_001"

class EventSummaryOutput(BaseModel):
    Location: str = Field(description="Location of the event")
    Eventtype: str = Field(description="Classified event type")
    Eventname: str = Field(description="Paraphrased and apt name for the event")
    EventSummarize: str = Field(description="Final summary of the event")

# Helper functions for media processing
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

# Event Summary Agent (Text-based)
def create_event_summary_agent():
    """Create the text-based event summary agent"""
    return Agent(
        name="event_summary_agent",
        model=AGENT_MODEL,
        description="Analyzes event descriptions and creates structured summaries with location, type, and impact assessment.",
        instruction="""You are an expert event analyst. Analyze the provided event information and create a structured summary that includes:
        - Event location and geographical context
        - Event type classification
        - Event name (descriptive and concise)
        - Comprehensive event summary with impact assessment
        
        Use web search to gather additional context about the location and similar events.
        Provide actionable insights and safety recommendations.""",
        tools=[google_search],
    )

# Media Analysis Agent (Visual-based)
def create_media_analysis_agent():
    """Create the media analysis agent"""
    media_analysis_prompt = """You are an expert visual analyst specializing in event detection from images and videos. 
    Analyze the provided media to extract:
    - Visual evidence of the event type and severity
    - Location indicators and geographical context from visual cues
    - Impact on people, infrastructure, and environment
    - Timeline indicators if visible
    - Safety and emergency response needs
    
    Provide detailed observations and actionable insights based on visual evidence."""
    
    return Agent(
        name="media_analysis_agent",
        model="gemini-2.0-flash-exp", 
        description="Analyzes images and videos to extract comprehensive event information and visual evidence.",
        instruction=media_analysis_prompt,
        tools=[google_search],
    )

# Merger Agent
def create_merger_agent():
    """Create the agent that combines text and media analysis"""
    merger_prompt = """You are an expert event synthesizer. Your task is to combine multiple sources of information about an event:

    1. TEXT-BASED ANALYSIS: Structured event summary from text descriptions
    2. VISUAL ANALYSIS: Observations and evidence from images/videos
    3. WEB RESEARCH: Additional context from search results

    Create a comprehensive, unified event summary that includes:

    **EVENT OVERVIEW:**
    - Event type and classification
    - Location with specific details
    - Severity assessment based on all available evidence

    **SITUATION ANALYSIS:**
    - Current conditions (from both text and visual evidence)
    - Impact on people, traffic, infrastructure
    - Duration and timeline indicators

    **ACTIONABLE RECOMMENDATIONS:**
    - Immediate safety measures
    - Alternative routes or solutions
    - Emergency contacts if needed
    - Preventive measures

    **KEY INSIGHTS:**
    - Critical information for decision-making
    - Risk assessment
    - Expected developments

    Use web search to verify information and gather real-time updates about the situation.
    Provide a single, clean, actionable summary suitable for emergency response or public advisories.
    
    Format the response as a structured summary with clear sections and bullet points for easy reading."""
    
    return Agent(
        name="merger_agent",
        model=AGENT_MODEL,
        description="Synthesizes multiple information sources to create comprehensive event summaries with actionable recommendations.",
        instruction=merger_prompt,
        tools=[google_search],
    )

async def run_parallel_event_analysis(event_name: str, event_description: str, event_location: str, media_files: list = None) -> str:
    """Main function to run parallel event analysis pipeline"""
    
    # Create individual agents
    event_summary_agent = create_event_summary_agent()
    media_analysis_agent = create_media_analysis_agent()
    merger_agent = create_merger_agent()
    
    # Create parallel agent for running event summary and media analysis
    parallel_research_agent = ParallelAgent(
        name="parallel_summary_agent",
        sub_agents=[event_summary_agent, media_analysis_agent],
        description="Runs text-based event analysis and media analysis in parallel to gather comprehensive information."
    )
    
    # Create sequential pipeline
    sequential_pipeline_agent = SequentialAgent(
        name="merger_pipeline",
        sub_agents=[parallel_research_agent, merger_agent],
        description="Coordinates parallel research and synthesizes the results into a unified event summary."
    )
    
    # Setup session
    session_service = InMemorySessionService()
    runner = Runner(
        agent=sequential_pipeline_agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=SESSION_ID
    )
    
    # Prepare content for both agents
    system_prompt, user_prompt = event_summary_prompt(event_name, event_description, event_location)
    
    # Create combined prompt that includes both text and media analysis instructions
    combined_prompt = f"""
    TASK: Analyze this event using both text description and visual media (if provided).
    
    TEXT ANALYSIS REQUIRED:
    {user_prompt}
    
    MEDIA ANALYSIS REQUIRED (if media files are provided):
    Analyze the provided images/videos for:
    1. Visual confirmation of the event type
    2. Severity assessment from visual evidence  
    3. Location verification and additional context
    4. Impact on people and infrastructure
    5. Any emergency response needs visible
    
    EVENT DETAILS:
    - Event Name: {event_name}
    - Description: {event_description}
    - Location: {event_location}
    """
    
    # Create content with both text and media
    if media_files and len(media_files) > 0:
        content = create_media_content(media_files, combined_prompt)
    else:
        content = types.Content(role='user', parts=[types.Part(text=combined_prompt)])
    
    final_response_text = "Pipeline did not produce a final response."
    
    # Run the pipeline
    async for event in runner.run_async(user_id=USER_ID, session_id=SESSION_ID, new_message=content):
        if event.is_final_response():
            if event.content and event.content.parts:
                final_response_text = event.content.parts[0].text
            elif event.actions and event.actions.escalate:
                final_response_text = f"Pipeline escalated: {event.error_message or 'No specific message.'}"
            break
    
    return final_response_text

def get_comprehensive_event_analysis(event_name: str, event_description: str, event_location: str, media_files: list = None):
    """Sync wrapper for the comprehensive event analysis"""
    response = asyncio.run(run_parallel_event_analysis(event_name, event_description, event_location, media_files))
    return response

if __name__ == "__main__":
    # Example usage
    event_name = "WATER_LOGGING"
    event_description = "Rainwater accumulated on roads, hard to drive. Locals wading through knee-deep water."
    event_location = "Koramangala 5th Block"
    
    # Media files (replace with actual paths)
    media_files = [
        r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_1.mp4",
        r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_image2.jpg",
        r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_image1.jpg"
    ]
    
    print("=== Comprehensive Event Analysis Pipeline ===")
    print(f"Event: {event_name}")
    print(f"Location: {event_location}")
    print(f"Media files: {len(media_files) if media_files else 0} files")
    print("\nRunning parallel analysis...")
    
    try:
        comprehensive_summary = get_comprehensive_event_analysis(
            event_name=event_name,
            event_description=event_description,
            event_location=event_location,
            media_files=media_files
        )
        
        print("\n" + "="*80)
        print("COMPREHENSIVE EVENT SUMMARY")
        print("="*80)
        print(comprehensive_summary)
        
    except Exception as e:
        print(f"Pipeline Error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*80)
    print("Analysis Complete")