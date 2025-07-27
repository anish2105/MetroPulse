# agents/orchestrator_agent/agent.py
from google.adk.agents import ParallelAgent, SequentialAgent
from agents.movie_agent.agent import movie_agent
from agents.restaurant_agent.agent import restaurant_agent
from agents.concert_agent.agent import concert_agent
from agents.final_processor_agent import FinalProcessorAgent
from agents.corrector_agent import corrector_agent # <-- Import the new corrector

def create_metro_pulse_agent(artifact_service):
    """
    Creates the main agent workflow with a Python-first, LLM-fallback processor.
    """
    # STEP 1: Gather data concurrently.
    parallel_data_gatherer = ParallelAgent(
        name="ParallelLocationDataGatherer",
        sub_agents=[movie_agent, restaurant_agent, concert_agent],
    )

    # STEP 2: The final processing step, now with the corrector injected.
    final_processor = FinalProcessorAgent(
        name="FinalProcessorAgent",
        artifact_service=artifact_service,
        corrector_agent=corrector_agent # <-- Inject the dependency
    )

    # The root agent that runs the two steps in order.
    root_agent = SequentialAgent(
        name="MetroPulsePipeline",
        sub_agents=[
            parallel_data_gatherer,
            final_processor
        ],
        description="Gathers location data, then validates and saves it using a custom Python agent with an LLM repair loop."
    )

    return root_agent