# In deployment/remote.py

import argparse
import os
import sys

import vertexai
from dotenv import load_dotenv
from vertexai import agent_engines
from vertexai.preview import reasoning_engines

# Correct the import path to your new project structure
from metro_agent.agent import root_agent


def create_deployment():
    """Packages the agent and deploys it to Agent Engines."""
    print("Wrapping the agent in AdkApp...")
    app = reasoning_engines.AdkApp(
        agent=root_agent,
        enable_tracing=True,
    )

    print("Deploying to Agent Engine...")
    remote_app = agent_engines.create(
        agent_engine=app,
        # Define necessary packages for the remote environment
        requirements=[
                "google-adk>=1.7.0",
                "google-cloud-aiplatform[adk,agent-engines]>=1.104.0",
                "python-dotenv>=1.1.1",
                "cloudpickle>=3.1.1",
            ],
        # Include the local agent code
        extra_packages=["."],
    )
    print(f"✅ Successfully created remote deployment: {remote_app.resource_name}")
    print("You can now use this resource name with the --resource_id flag.")


def delete_deployment(resource_id: str):
    """Deletes an existing deployment by its resource name."""
    print(f"Attempting to delete deployment: {resource_id}...")
    remote_app = agent_engines.get(resource_id)
    remote_app.delete(force=True)
    print(f"✅ Successfully deleted remote deployment: {resource_id}")


def list_deployments():
    """Lists all active deployments in the project."""
    deployments = agent_engines.list()
    if not deployments:
        print("No deployments found.")
        return
    print("Found deployments:")
    for deployment in deployments:
        print(f"- {deployment.resource_name}")


def cleanup_all_deployments():
    """Finds and deletes ALL agent deployments in the project. Use with caution."""
    print("Starting cleanup of all deployments...")
    deployments = agent_engines.list()
    if not deployments:
        print("No deployments found to clean up.")
        return

    print("Found the following deployments to delete:")
    for deployment in deployments:
        print(f"- {deployment.resource_name}")
        try:
            deployment.delete(force=True)
            print(f"  ✅ Deleted {deployment.resource_name}")
        except Exception as e:
            print(f"  ❌ Failed to delete {deployment.resource_name}: {e}")


def create_session(resource_id: str, user_id: str):
    """Creates a new session for a given deployment."""
    remote_app = agent_engines.get(resource_id)
    session = remote_app.create_session(user_id=user_id)
    print("✅ Session created successfully:")
    print(f"  Resource ID: {resource_id}")
    print(f"  Session ID: {session['id']}")
    print("Use this session ID for future --send commands.")


def list_sessions(resource_id: str, user_id: str):
    """Lists all sessions for a given user on a deployment."""
    remote_app = agent_engines.get(resource_id)
    sessions = remote_app.list_sessions(user_id=user_id)
    print(f"Sessions for user '{user_id}' on '{resource_id}':")
    if not sessions:
        print("  No sessions found.")
        return
    for session in sessions:
        print(f"- Session ID: {session['id']}")


def send_message(resource_id: str, session_id: str, message: str, user_id: str):
    """Sends a message to a session and streams the response."""
    remote_app = agent_engines.get(resource_id)
    print(f"Sending message to session {session_id}...")
    print(f"Message: '{message}'")
    print("\n--- Agent Response ---")
    for event in remote_app.stream_query(
        user_id=user_id, session_id=session_id, message=message
    ):
        print(event)
    print("--- End of Response ---")


def main():
    """Main entrypoint for remote deployment and interaction script."""
    parser = argparse.ArgumentParser(description="Remote ADK Agent Deployment Script")
    
    # Actions
    parser.add_argument("--create", action="store_true", help="Creates and deploys a new agent.")
    parser.add_argument("--delete", action="store_true", help="Deletes an existing deployment.")
    parser.add_argument("--list", action="store_true", help="Lists all deployments.")
    parser.add_argument("--cleanup-all", action="store_true", help="Deletes ALL deployments in the project.")
    parser.add_argument("--create_session", action="store_true", help="Creates a new session.")
    parser.add_argument("--list_sessions", action="store_true", help="Lists all sessions for a user.")
    parser.add_argument("--send", action="store_true", help="Sends a message to the deployed agent.")
    
    # Parameters
    parser.add_argument("--resource_id", type=str, help="The resource name of the deployed agent.")
    parser.add_argument("--session_id", type=str, help="The ID of the session to use.")
    parser.add_argument("--user_id", type=str, default="test_user", help="User ID for session operations.")
    parser.add_argument("--message", type=str, help="The message to send to the agent.")

    args = parser.parse_args()

    # Load environment variables from .env file
    load_dotenv()
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    location = os.getenv("GOOGLE_CLOUD_LOCATION")
    bucket = os.getenv("GOOGLE_CLOUD_STAGING_BUCKET")

    if not all([project_id, location, bucket]):
        print("Error: GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, and GOOGLE_CLOUD_STAGING_BUCKET must be set in your .env file.", file=sys.stderr)
        sys.exit(1)

    vertexai.init(project=project_id, location=location, staging_bucket=bucket)

    # Execute action
    if args.create:
        create_deployment()
    elif args.delete:
        if not args.resource_id:
            print("Error: --resource_id is required for --delete.", file=sys.stderr)
            sys.exit(1)
        delete_deployment(args.resource_id)
    elif args.list:
        list_deployments()
    elif args.cleanup_all:
        cleanup_all_deployments()
    elif args.create_session:
        if not args.resource_id:
            print("Error: --resource_id is required for --create_session.", file=sys.stderr)
            sys.exit(1)
        create_session(args.resource_id, args.user_id)
    elif args.list_sessions:
        if not args.resource_id:
            print("Error: --resource_id is required for --list_sessions.", file=sys.stderr)
            sys.exit(1)
        list_sessions(args.resource_id, args.user_id)
    elif args.send:
        if not all([args.resource_id, args.session_id, args.message]):
            print("Error: --resource_id, --session_id, and --message are required for --send.", file=sys.stderr)
            sys.exit(1)
        send_message(args.resource_id, args.session_id, args.message, args.user_id)
    else:
        print("No action specified. Use --help to see available commands.", file=sys.stderr)

if __name__ == "__main__":
    main()