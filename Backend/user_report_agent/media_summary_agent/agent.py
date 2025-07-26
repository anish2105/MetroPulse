#media_summary_output

from google.adk import Agent
from google.adk.tools import google_search

from . import prompt

MODEL = "gemini-2.5-flash"

media_summary_agent = Agent(
    model=MODEL,
    name="media_summary_agent",
    instruction=prompt.media_summary_prompt,
    output_key="media_summary_output",
    tools=[google_search],
)