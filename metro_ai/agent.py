from google.adk.agents import ParallelAgent
from .subagents.movie_agent.agent import movie_agent
from .subagents.restaurant_agent.agent import restaurant_agent
from .subagents.concert_agent.agent import concert_agent

parallel_agent = ParallelAgent(
    name="CityInfoParallelAgent",
    description="Runs movie, restaurant, and concert agents concurrently.",
    sub_agents=[movie_agent, restaurant_agent, concert_agent]
)
