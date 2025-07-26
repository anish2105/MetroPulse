import os
import asyncio
import warnings
from dotenv import load_dotenv
from pydantic import BaseModel, Field
import mimetypes
from typing import List, Dict
from google.genai import types
import json
from typing import List, Dict, Union

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


import re
import json

def convert_response_to_json(llm_response):
    clean_json_regex = r"```json\s*|\s*```"
    cleaned_json = re.sub(clean_json_regex, '', llm_response, flags=re.MULTILINE)
    parsed_data = json.loads(cleaned_json)
    return parsed_data