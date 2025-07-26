

from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json

from media_summary_agent import analyze_media_files
from overall_summary import get_overall_summary
from event_summary_agent import get_event_summary
from prompts import event_summary_prompt, merge_summary, media_prompts

# Initialize FastAPI app
app = FastAPI()

# CORS middleware for local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MediaFileDetail(BaseModel):
    mimeType: str
    bytes: List[int]

class EventRequest(BaseModel):
    event_name: str
    event_description: str
    event_location: str
    media_file: List[MediaFileDetail] = []
    

class EventSumary(BaseModel):
    Location : str
    Eventtype : str
    Eventname : str 
    EventSummary : str

# Health check
@app.get("/")
async def root():
    return {"status": "OK", "message": "FastAPI event summarizer is running."}

# Event summary endpoint
@app.post("/event_summary/")
async def summarize_event(event: EventRequest):
    try:
        # Prepare prompts
        event_system_prompt, event_user_prompt = event_summary_prompt(
            event.event_name, event.event_description, event.event_location,
        )
        
        media_file = event.media_file
        # Get event summary (awaited)
        event_summary_result = await get_event_summary(event_user_prompt, event_system_prompt)

        # Merge with empty media summary
        media_system_pompt, analysis_media_prompt = media_prompts()
        media_summary_result = "No media files provided."
        if media_file:
            media_summary_result = await analyze_media_files(media_file, media_system_pompt, analysis_media_prompt)
        print(media_summary_result)

        merger_system_prompt, merger_user_prompt = merge_summary(
            event_summary_result, media_summary_result
        )

        # Get final summary (awaited)
        merger_summary_result = await get_overall_summary(
            merger_user_prompt, merger_system_prompt
        )

        # Try to parse as JSON
        try:
            summary_json = EventSumary(**merger_summary_result)
            return summary_json
        except json.JSONDecodeError:
            # Retry once
            retry_output = await get_overall_summary(merger_user_prompt, merger_system_prompt)
            try:
                summary_json_retry = EventSumary(**retry_output)
                return summary_json_retry
            except json.JSONDecodeError:
                return JSONResponse(
                    status_code=500,
                    content={
                        "error": "Final merged summary is not valid JSON even after retry.",
                        "raw_output": retry_output,
                    },
                )

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
