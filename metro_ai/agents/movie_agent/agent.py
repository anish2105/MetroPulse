# agents/movie_agent/agent.py
from google.adk.agents import LlmAgent
from google.adk.tools import google_search

movie_agent = LlmAgent(
    name="MovieAgent",
    model="gemini-2.0-flash",
    description="Fetches movie showtimes in the city",
    instruction=(
        "Given {city}, search online for today's movie showtimes. "
        "Return a single JSON object with a 'city' key and a 'movies' key containing a list of movies. "
        "Each movie must have: name, genre, language, certificate, description, and locations_available (a dictionary of theaters and showtimes)."
    ),
    tools=[google_search],
    output_key="movies_info" # The raw JSON string will be stored here
)