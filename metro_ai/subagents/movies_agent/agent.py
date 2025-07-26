from google.adk.agents import LlmAgent
from google.adk.tools import google_Search

movie_agent = LlmAgent(
    name="MovieAgent",
    description="Fetch movie showtimes in the city",
    instruction=(
        "Given {city}, search online for today's movie showtimes in that city. "
        "Return JSON: { city: ..., movies: [ "
        "{ name, genre, language, certificate, description, locations_available: {theatre: [showtimes]} } ] }"
    ),
    tools=[google_Search],
    output_key="movies_info"
)