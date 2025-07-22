# In deployment/local.py

import argparse
import os
import sys

import vertexai
from dotenv import load_dotenv
from vertexai.preview import reasoning_engines

# Correct the import path to your new project structure
from metro_agent.agent import root_agent

def create_session(app: reasoning_engines.AdkApp, user_id: str):
    """Creates a new local session."""
    session = app.create_session(user_id=user_id)
    print("✅ Local session created successfully:")
    print(f"  Session ID: {session.id}")
    print("Use this session ID for future --send commands.")


def list_sessions(app: reasoning_engines.AdkApp, user_id: str):
    """Lists all local sessions for a given user."""
    sessions = app.list_sessions(user_id=user_id)
    print(f"Local sessions for user '{user_id}':")
    session_list = sessions.sessions if hasattr(sessions, "sessions") else sessions.session_ids
    if not session_list:
        print("  No sessions found.")
        return
    for session_id in session_list:
        print(f"- Session ID: {session_id}")


def send_message(app: reasoning_engines.AdkApp, session_id: str, message: str, user_id: str):
    """Sends a message to a local session and streams the response."""
    print(f"Sending message to session {session_id}...")
    print(f"Message: '{message}'")
    print("\n--- Agent Response ---")
    for event in app.stream_query(
        user_id=user_id, session_id=session_id, message=message
    ):
        print(event)
    print("--- End of Response ---")


def main():
    """Main entrypoint for local agent testing script."""
    parser = argparse.ArgumentParser(description="Local ADK Agent Test Script")

    # Actions
    parser.add_argument("--create_session", action="store_true", help="Creates a new local session.")
    parser.add_argument("--list_sessions", action="store_true", help="Lists all local sessions for a user.")
    parser.add_argument("--send", action="store_true", help="Sends a message to a local session.")

    # Parameters
    parser.add_argument("--session_id", type=str, help="The ID of the session to use.")
    parser.add_argument("--user_id", type=str, default="test_user", help="User ID for session operations.")
    parser.add_argument("--message", type=str, help="The message to send to the agent.")

    args = parser.parse_args()

    # Load environment variables from .env file
    load_dotenv()
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    location = os.getenv("GOOGLE_CLOUD_LOCATION")

    if not all([project_id, location]):
        print("Error: GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION must be set in your .env file.", file=sys.stderr)
        sys.exit(1)

    vertexai.init(project=project_id, location=location)

    # Create the local app instance
    app = reasoning_engines.AdkApp(
        agent=root_agent,
        enable_tracing=True,
    )

    # Execute action
    if args.create_session:
        create_session(app, args.user_id)
    elif args.list_sessions:
        list_sessions(app, args.user_id)
    elif args.send:
        if not all([args.session_id, args.message]):
            print("Error: --session_id and --message are required for --send.", file=sys.stderr)
            sys.exit(1)
        send_message(app, args.session_id, args.message, args.user_id)
    else:
        print("No action specified. Use --help to see available commands.", file=sys.stderr)


if __name__ == "__main__":
    main()