import googlemaps

def get_coordinates(address):
    gmaps = googlemaps.Client(key='AIzaSyBgJg4-QFVbWFXX1hvNLp593efz4eXVOVM')
    geocode_result = gmaps.geocode(address)
    
    if geocode_result:
        location = geocode_result[0]['geometry']['location']
        return {"lat": location['lat'], "lng": location['lng']}
    return None

# Usage
# coords = get_coordinates("Indiranagar, Bengaluru, India")
# print(coords)

import re
import json

def convert_response_to_json(llm_response):
    clean_json_regex = r"```json\s*|\s*```"
    cleaned_json = re.sub(clean_json_regex, '', llm_response, flags=re.MULTILINE)
    parsed_data = json.loads(cleaned_json)
    return parsed_data

# llm_response = """```json
# {
# "Location": "Koramangala 5th Block",
# "Eventtype": "WATER_LOGGING",
# "Eventname": "Severe Waterlogging in Koramangala 5th Block",
# "EventSummarize": "Koramangala 5th Block is currently experiencing significant waterlogging, making roads difficult to drive and causing locals to wade through knee-deep water. This area, along with other parts of Bengaluru, is frequently affected by such conditions during the monsoon season, often attributed to insufficient drainage systems and urban planning issues. Commuters are strongly advised to avoid non-essential travel through this locality and to stay informed about real-time traffic updates. For those who must navigate waterlogged streets, it's crucial to proceed with extreme caution: avoid driving through water deeper than 4-6 inches or half your tire height, drive slowly in lower gears (first or second) to prevent water from entering the engine, and under no circumstances attempt to restart a vehicle that has stalled in deep water, as this can lead to severe engine damage. Additionally, be vigilant for hidden hazards like open manholes, potholes, and submerged electrical lines."
# }
# ```
# """

# parsed_json = convert_response_to_json(llm_response)
# print(parsed_json)
