# from fastapi import FastAPI, File, UploadFile, Form
# from fastapi.responses import JSONResponse
# from typing import Optional
# import json

# from overall_summary import get_overall_summary
# from event_summary_agent import get_event_summary
# from media_summary_agent import analyze_media_files
# from prompts import event_summary_prompt, media_prompts, merge_summary

# app = FastAPI()
# from typing import List, Optional
# from pydantic import BaseModel
# from fastapi import FastAPI
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],  # or ["*"] to allow all origins (not recommended for production)
#     allow_credentials=True,
#     allow_methods=["*"],  # allow all HTTP methods like POST, GET, etc.
#     allow_headers=["*"],  # allow all headers
# )


# # MEDIA SCHEMA
# class MediaFile(BaseModel):
#     name: str
#     type: str
#     mimeType: str
#     size: int
#     bytes: List[int]

# class MediaFileWrapper(BaseModel):
#     files: List[MediaFile]

# class EventData(BaseModel):
#     event_name: str
#     event_description: str
#     event_location: str
#     created_at: str
#     media_file: MediaFileWrapper

# # Health check route
# @app.get("/")
# async def root():
#     return {"status": "OK", "message": "FastAPI server is running."}

# @app.post("/summarize_event/")
# async def summarize_event(event: EventData):
#     try:
#         # Prompts for event and media
#         event_system_prompt, event_user_prompt = event_summary_prompt(
#             event.event_name, event.event_description, event.event_location
#         )
#         media_system_prompt, media_user_prompt = media_prompts()

#         # Get event summary
#         event_summary_result = get_event_summary(event_user_prompt, event_system_prompt)

#         # Handle media summary
#         media_summary_result = ""
#         if event.media_file and event.media_file.files:
#             media_summary_result = analyze_media_files(
#                 event.media_file.dict(), media_system_prompt, media_user_prompt
#             )

#         # Merge summaries
#         merger_system_prompt, merger_user_prompt = merge_summary(event_summary_result, media_summary_result)
#         merger_summary_result = get_overall_summary(merger_user_prompt, merger_system_prompt)
#         summary_json = json.loads(merger_summary_result)
#         return summary_json
#         # # Try parsing as JSON
#         # try:
#         #     summary_json = json.loads(merger_summary_result)
#         #     return summary_json
#         # except json.JSONDecodeError:
#         #     # Retry once
#         #     merger_summary_result_retry = get_overall_summary(merger_user_prompt, merger_system_prompt)
#         #     try:
#         #         summary_json_retry = json.loads(merger_summary_result_retry)
#         #         return summary_json_retry
#         #     except json.JSONDecodeError:
#         #         return JSONResponse(
#         #             status_code=500,
#         #             content={
#         #                 "error": "Final merged summary is not valid JSON even after retry.",
#         #                 "raw_output": merger_summary_result_retry
#         #             }
#         #         )

#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json

from overall_summary import get_overall_summary
from event_summary_agent import get_event_summary
from prompts import event_summary_prompt, merge_summary

# Initialize FastAPI app
app = FastAPI()

# CORS middleware for local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class EventRequest(BaseModel):
    event_name: str
    event_description: str
    event_location: str
    # created_at : str
    

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
            event.event_name, event.event_description, event.event_location
        )

        # Get event summary (awaited)
        event_summary_result = await get_event_summary(event_user_prompt, event_system_prompt)

        # Merge with empty media summary
        media_summary_result = ""
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
