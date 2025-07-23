from dotenv import load_dotenv
import os

load_dotenv()
from google.adk.agents import Agent

from metroai.prompt import ROOT_AGENT_INSTRUCTION
from metroai.tools.character_counter import count_characters

root_agent = Agent(
    name="metro_agent",
    model="gemini-2.0-flash-lite",
    description="A Pirate Captain",
    instruction=ROOT_AGENT_INSTRUCTION,
    tools=[count_characters],
)