# agents/concert_agent/agent.py
from google.adk.agents import LlmAgent
from google.adk.tools import google_search

concert_agent = LlmAgent(
    name="ConcertAgent",
    model="gemini-2.0-flash",
    description="Fetch upcoming concerts in the given city.",
    instruction=(
      "For the city {city}, search for upcoming concerts. "
      "Return a single JSON object with a 'city' key and a 'concerts' key. "
      "Each concert must have: name, date (YYYY-MM-DD), venue, and description."
    ),
    tools=[google_search],
    output_key="concert_info"
)