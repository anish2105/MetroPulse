# agents/restaurant_agent/agent.py
from google.adk.agents import LlmAgent
from google.adk.tools import google_search

restaurant_agent = LlmAgent(
    name="RestaurantAgent",
    model="gemini-2.0-flash",
    description="Fetches vegetarian and non‑vegetarian restaurants.",
    instruction=(
      "For the location {location}, search for top veg and non-veg restaurants. "
      "Return a single JSON object with keys 'location', 'veg_restaurants', and 'nonveg_restaurants'. "
      "Each restaurant must have: name, cuisine, rating, and address."
    ),
    tools=[google_search],
    output_key="restaurant_info"
)