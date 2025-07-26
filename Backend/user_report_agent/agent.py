
"""
from google.adk import Agent
from google.adk.tools import google_search
# from prompt import event_summary_prompt
from google.adk.tools.agent_tool import AgentTool
from . import prompt
from .media_summary_agent import media_summary_agent

MODEL = "gemini-2.5-flash"

event_summary_agent = Agent(
    model=MODEL,
    name="event_summary_agent",
    instruction = prompt.event_summary_prompt,
    output_key="Generates unified summary based on user submitted reports and media summary",
    tools=[google_search,
        AgentTool(agent=media_summary_agent)
    ],
)
"""
from google.adk import Agent
from google.adk.tools import google_search
from google.adk.tools.agent_tool import AgentTool
from . import prompt
from .media_summary_agent import media_summary_agent


class EventSummaryAgent:
    def __init__(self):
        self.agent = Agent(
            model="gemini-2.5-flash",
            name="event_summary_agent",
            instruction=prompt.event_summary_prompt,
            tools=[
                google_search,
                AgentTool(agent=media_summary_agent)
            ]
        )

    def get_agent(self):
        return self.agent
