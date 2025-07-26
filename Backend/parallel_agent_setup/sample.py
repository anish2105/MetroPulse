import requests

url = "http://localhost:8000/event_summary/"

payload = {
    "event_name": "Standup Comedy Night",
    "event_description": "A hilarious standup comedy show featuring local comedians.",
    "event_location": "Indiranagar, Bangalore",
}

response = requests.post(url, json=payload)

print("Status Code:", response.status_code)

try:
    print("Response JSON:", response.json())  # Properly decode and print JSON
except Exception as e:
    print("Failed to parse JSON.")
    print("Raw Response Text:", response.text)
    print("Error:", e)
