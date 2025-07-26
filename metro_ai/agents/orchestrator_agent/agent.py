# agents/orchestrator_agent/agent.py
from google.adk.agents import ParallelAgent, SequentialAgent
from agents.movie_agent.agent import movie_agent
from agents.restaurant_agent.agent import restaurant_agent
from agents.concert_agent.agent import concert_agent
from agents.final_processor_agent import FinalProcessorAgent

def create_metro_pulse_agent(artifact_service):
    """
    Creates the main agent workflow.
    """
    parallel_data_gatherer = ParallelAgent(
        name="ParallelCityDataGatherer",
        sub_agents=[movie_agent, restaurant_agent, concert_agent],
    )

    # --- THIS IS THE FIX ---
    # The constructor now takes 'name' and 'artifact_service' as keyword arguments.
    final_processor = FinalProcessorAgent(
        name="FinalProcessorAgent",
        artifact_service=artifact_service
    )
    # ----------------------

    root_agent = SequentialAgent(
        name="MetroPulsePipeline",
        sub_agents=[
            parallel_data_gatherer,
            final_processor
        ],
        description="Gathers city data, then validates and saves it using a custom Python agent."
    )

    return root_agent