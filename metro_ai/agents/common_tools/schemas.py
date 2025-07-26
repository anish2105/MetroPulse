# agents/common_tools/schemas.py
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

# --- Individual Data Models ---
class Movie(BaseModel):
    name: str = Field(description="The full name of the movie.")
    genre: str = Field(description="The genre(s) of the movie.")
    language: str = Field(description="The primary language of the movie.")
    certificate: str = Field(description="The certification rating.")
    description: str = Field(description="A brief description of the movie.")
    locations_available: Dict[str, List[str]] = Field(description="Dictionary of theaters to showtimes.")

class Restaurant(BaseModel):
    name: str = Field(description="The name of the restaurant.")
    cuisine: str = Field(description="The primary type of cuisine served.")
    rating: Optional[float] = Field(description="The numerical rating of the restaurant.")
    address: str = Field(description="The physical address of the restaurant.")

class Concert(BaseModel):
    name: str = Field(description="The official name of the concert or event.")
    date: str = Field(description="The date of the event in YYYY-MM-DD format.")
    venue: str = Field(description="The name of the venue where the event is held.")
    description: str = Field(description="A brief description of the event.")

# --- Master Schema for Final Validation ---
class CityData(BaseModel):
    """The master data model for all city information."""
    city: str = Field(description="The city for which the information was fetched.")
    movies: List[Movie]
    restaurants: Dict[str, List[Restaurant]] = Field(description="Contains keys 'veg_restaurants' and 'nonveg_restaurants'.")
    concerts: List[Concert]