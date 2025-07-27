# agents/corrector_agent.py
from google.adk.agents import LlmAgent

corrector_agent = LlmAgent(
    name="CorrectorAgent",
    model="gemini-2.0-flash", # A powerful model is needed for this reasoning task
    description="Fixes a flawed JSON object based on a Pydantic validation error.",
    instruction=(
        "You are a data correction expert. You will be given a flawed JSON string "
        "and a specific Pydantic validation error message. Your ONLY task is to "
        "fix the JSON string so that it complies with the error message.\n"
        "Do not add, remove, or hallucinate new information. Only correct the "
        "structure and data types based on the error provided.\n"
        "Return ONLY the corrected, raw JSON string, without any markdown or commentary.\n\n"
        "Flawed JSON: {flawed_data}\n\n"
        "Validation Error to Fix: {validation_error}"
    ),
    output_key="corrected_data" # The corrected JSON string
)