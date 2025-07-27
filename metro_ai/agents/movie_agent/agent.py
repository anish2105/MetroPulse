# agents/movie_agent/agent.py
from google.adk.agents import LlmAgent
from google.adk.tools import google_search

movie_agent = LlmAgent(
    name="MovieAgent",
    model="gemini-2.0-flash",
    description="Fetches movie showtimes in the location",
    instruction = (
        "You are an expert film and psychology analyst. "
        "Given a location name '{location}' and its type (e.g., 'location' or 'hyperlocal area'), "
        "search online for movie showtimes for today and the next 7 days in that specific location.\n"
        "You MUST return a single JSON string. For each movie you find, you must:\n"
        " **Infer the `compatible_mbti`:** Based on the movie's genre, themes, and description, deduce a list of 2-4 Myers-Briggs Type Indicator (MBTI) personality types that would most likely enjoy the movie. For example, a complex sci-fi thriller might appeal to INTJ or INTP; a heartfelt drama to INFJ or ENFP.\n" 
        "Return a single JSON object with the following structure:\n\n"
        "{\n"
        "  'location': str,  # The name of the location you searched\n"
        "  'movies': [\n"
        "    {\n"
        "      'name': str,  # The full name of the movie\n"
        "      'genre': str,  # The genre(s) of the movie\n"
        "      'compatible_mbti': List[str] A list of 2-4 Myers-Briggs Type Indicator (MBTI) personality types that would likely enjoy this movie, based on its genre and themes."
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
        "Ensure all fields are filled accurately based on today's listings for the location."
    ),

    tools=[google_search],
    output_key="movies_info" # The raw JSON string will be stored here
)