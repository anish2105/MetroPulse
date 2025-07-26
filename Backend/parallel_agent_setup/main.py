from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from typing import Optional
import json

from overall_summary import get_overall_summary
from event_summary_agent import get_event_summary
from media_summary_agent import analyze_media_files
from prompts import event_summary_prompt, media_prompts, merge_summary

app = FastAPI()

@app.post("/summarize_event/")
async def summarize_event(
    event_name: str = Form(...),
    event_description: str = Form(...),
    event_location: str = Form(...),
    created_at: str = Form(...),
    media_file: Optional[UploadFile] = File(None)
):
    try:
        # Prompts for event and media
        event_system_prompt, event_user_prompt = event_summary_prompt(event_name, event_description, event_location)
        media_system_prompt, media_user_prompt = media_prompts()

        # Get event summary
        event_summary_result = get_event_summary(event_user_prompt, event_system_prompt)

        # Get media summary if media provided
        media_summary_result = ""
        if media_file is not None:
            media_bytes = await media_file.read()
            media_summary_result = analyze_media_files(media_bytes, media_system_prompt, media_user_prompt)

        # Merge summaries
        merger_system_prompt, merger_user_prompt = merge_summary(event_summary_result, media_summary_result)
        merger_summary_result = get_overall_summary(merger_user_prompt, merger_system_prompt)

        # Try parsing as JSON
        try:
            summary_json = json.loads(merger_summary_result)
            return summary_json
        except json.JSONDecodeError:
            # Retry once
            merger_summary_result_retry = get_overall_summary(merger_user_prompt, merger_system_prompt)
            try:
                summary_json_retry = json.loads(merger_summary_result_retry)
                return summary_json_retry
            except json.JSONDecodeError:
                return JSONResponse(
                    status_code=500,
                    content={"error": "Final merged summary is not valid JSON even after retry.", "raw_output": merger_summary_result_retry}
                )

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
