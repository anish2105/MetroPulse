import os

import uvicorn
from google.adk.cli.fast_api import get_fast_api_app

AGENT_DIR = os.path.join(os.path.dirname(__file__), "metro_agent")
SESSION_SERVICE_URI = os.environ.get("SESSION_SERVICE_URI", "sqlite:///./sessions.db")
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
SERVE_WEB_INTERFACE = True

app = get_fast_api_app(
    agents_dir=AGENT_DIR,
    session_service_uri=SESSION_SERVICE_URI,
    allow_origins=ALLOWED_ORIGINS,
    web=SERVE_WEB_INTERFACE,
)

@app.get("/healthz")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))