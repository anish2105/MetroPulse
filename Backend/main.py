import requests
import os

# Your inputs
event_name = "Standup comedy"
event_description = "Bassi is performing his stand up spl in indiranagar"
event_location = "Indiranagar, Bengaluru, India"
media_file_paths = [
    r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_1.mp4",
    r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_image2.jpg",
    r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_image1.jpg"
]

# API endpoint
url = "http://localhost:8000/process-event"

# Prepare form data
data = {
    'event_name': event_name,
    'event_description': event_description,
    'event_location': event_location
}

# Alternative cleaner approach with context managers
def make_request():
    files_to_upload = []
    
    # Prepare files with context managers
    for file_path in media_file_paths:
        if os.path.exists(file_path):
            filename = os.path.basename(file_path)
            files_to_upload.append(('media_files', (filename, open(file_path, 'rb'))))
        else:
            print(f"Warning: File not found - {file_path}")
    
    try:
        # Make the request
        response = requests.post(url, data=data, files=files_to_upload)
        
        # Process response
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                print("Event Summary:")
                print("=" * 50)
                print(result['summary'])
            else:
                print(f"Error: {result['error']}")
        else:
            print(f"HTTP Error: {response.status_code}")
            print(response.text)
    
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    
    finally:
        # Close all file handles
        for _, (_, file_handle) in files_to_upload:
            file_handle.close()

# Execute the request
make_request()