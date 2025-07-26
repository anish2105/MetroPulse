# agents/orchestrator_agent/agent.py
import json
from google.adk.agents import ParallelAgent, SequentialAgent, LlmAgent
from agents.movie_agent.agent import movie_agent
from agents.restaurant_agent.agent import restaurant_agent
from agents.concert_agent.agent import concert_agent
from agents.common_tools.schemas import CityData # <-- Import our master schema

def create_metro_pulse_agent(storage_tool):
    """
    Creates the main agent workflow using the correct 3-step pipeline:
    1. Gather data in parallel.
    2. Validate and structure the combined data with a Pydantic schema.
    3. Save the validated data to GCS.
    """

    # STEP 1: Gather data concurrently. These are the simple agents from above.
    parallel_data_gatherer = ParallelAgent(
        name="ParallelCityDataGatherer",
        sub_agents=[movie_agent, restaurant_agent, concert_agent],
    )

    # STEP 2: Validate the data. This agent has a schema but no tools.
    data_validator = LlmAgent(
        name="DataValidatorAgent",
        model="gemini-2.0-flash",
        description="Combines and validates city data against a master schema.",
        instruction=(
            "You are a data validation expert. You will receive three JSON strings: "
            "'{movies_info}', '{restaurant_info}', and '{concert_info}'.\n"
            "Your job is to:\n"
            "1. Combine the content of these three inputs into a single data structure.\n"
            "2. Ensure this final structure perfectly matches the `CityData` schema provided.\n"
            "3. For the 'restaurants' field, create a dictionary with two keys: 'veg_restaurants' and 'nonveg_restaurants', using the lists from the restaurant_info input.\n"
            "Your output MUST be a single, valid JSON object conforming to the schema."
        ),
        output_schema=CityData,
        output_key="validated_city_data" # The validated Pydantic object is stored here
    )

    # STEP 3: Save the validated data. This agent has a tool but no schema.
    gcs_saver = LlmAgent(
        name="GcsSaverAgent",
        model="gemini-2.0-flash",
        description="Saves the validated data to GCS.",
        instruction=(
            "You will be given a validated JSON object of city data named '{validated_city_data}'.\n"
            "Your only task is to call the `save_json` tool with this data. "
            "You must first convert the entire validated object into a JSON string to pass to the tool. "
            "Extract the city name from the data to pass as the 'city' argument."
        ),
        tools=[storage_tool]
    )

    # The root agent that runs the three steps in order.
    root_agent = SequentialAgent(
        name="MetroPulsePipeline",
        sub_agents=[
            parallel_data_gatherer,
            data_validator,
            gcs_saver
        ],
        description="Gathers, validates, and saves city information."
    )

    return root_agent