from google.adk.agents import LlmAgent
from google.adk.tools import google_Search

concert_agent = LlmAgent(
    name="ConcertAgent",
    description="Fetch upcoming concerts in the given city using Google Search.",
    instruction=(
      "Given {city}, search for upcoming concerts in that city. "
      "Respond as JSON: { city: ..., concerts: [ { name, date, venue, description } ] }"
    ),
    tools=[google_Search],
    output_key="concert_info"
)
