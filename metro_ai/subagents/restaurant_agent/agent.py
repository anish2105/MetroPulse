from google.adk.agents import LlmAgent
from google.adk.tools import google_Search

restaurant_agent = LlmAgent(
    name="RestaurantAgent",
    description="Fetch vegetarian and non‑vegetarian restaurants via Google Search in the given city.",
    instruction=(
      "Given {city}, search for top veg restaurants and also top non‑veg restaurants. "
      "Return JSON: { city: ..., veg_restaurants: [ { name, cuisine, rating, address } ], "
      "nonveg_restaurants: [ { name, cuisine, rating, address } ] }"
    ),
    tools=[google_Search],
    output_key="restaurant_info"
)
