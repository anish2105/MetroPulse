import os
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
import mimetypes
from typing import List, Optional
from google.genai import types

# Import your agent
from user_report_agent.agent import EventSummaryAgent

load_dotenv()

app = FastAPI(title="Event Summary API")
event_agent = EventSummaryAgent()

class EventResponse(BaseModel):
    success: bool
    summary: Optional[str] = None
    error: Optional[str] = None

def create_media_content(media_files: List[UploadFile], text_prompt: str) -> types.Content:
    """Create content with media files and text prompt"""
    parts = [types.Part(text=text_prompt)]
    
    for file in media_files:
        if file.filename:
            mime_type, _ = mimetypes.guess_type(file.filename)
            if not mime_type:
                mime_type = 'application/octet-stream'
            
            file_data = file.file.read()
            file.file.seek(0)  # Reset file pointer
            
            inline_data = types.Blob(mime_type=mime_type, data=file_data)
            parts.append(types.Part(inline_data=inline_data))
    
    return types.Content(role='user', parts=parts)

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "Event Summary API"}

@app.post("/process-event", response_model=EventResponse)
async def process_event(
    event_name: str = Form(...),
    event_description: str = Form(...),
    event_location: str = Form(...),
    media_files: List[UploadFile] = File(default=[])
):
    try:
        # Create analysis prompt
        prompt = f"""
        Event Name: {event_name}
        Event Description: {event_description}
        Event Location: {event_location}
        
        Please analyze this event information and any provided media to create a comprehensive summary.
        """
        
        # Process with or without media
        if media_files and any(f.filename for f in media_files):
            content = create_media_content(media_files, prompt)
            result = await asyncio.to_thread(event_agent.get_agent().run, str(content))
        else:
            result = await asyncio.to_thread(event_agent.get_agent().run, prompt)
        
        return EventResponse(success=True, summary=str(result))
        
    except Exception as e:
        return EventResponse(success=False, error=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)