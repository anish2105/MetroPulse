# agents/movie_agent/agent.py
from google.adk.agents import LlmAgent
from google.adk.tools import google_search

movie_agent = LlmAgent(
    name="MovieAgent",
    model="gemini-2.0-flash",
    description="Fetches movie showtimes in the city",
    instruction = (
        "Given the city name '{city}', search online for today's and next 7 days movie showtimes in that city. "
        "Return a single JSON object with the following structure:\n\n"
        "{\n"
        "  'city': str,  # The name of the city you searched\n"
        "  'movies': [\n"
        "    {\n"
        "      'name': str,  # The full name of the movie\n"
        "      'genre': str,  # The genre(s) of the movie\n"
        "      'language': str,  # The primary language of the movie\n"
        "      'certificate': str,  # The certification rating (e.g., U, UA, A)\n"
        "      'description': str,  # A brief description of the movie\n"
        "      'locations_available': {\n"
        "        'Theater Name 1': ['HH:MM', 'HH:MM'],\n"
        "        'Theater Name 2': ['HH:MM']\n"
        "        // Add more theaters as needed\n"
        "      }\n"
        "    },\n"
        "    // Add more movies as needed\n"
        "  ]\n"
        "}\n\n"
        "Ensure all fields are filled accurately based on today's listings for the city."
    ),

    tools=[google_search],
    output_key="movies_info" # The raw JSON string will be stored here
)