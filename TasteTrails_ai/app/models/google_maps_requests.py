from typing import Optional
from pydantic import BaseModel, Field


# noinspection PyArgumentList
class AddressRequest(BaseModel):
    """Request model for address-related operations."""
    address: str = Field(
        ...,
        min_length=1,
        description="Address or location name to process",
        example="1600 Amphitheatre Parkway, Mountain View, CA"
    )

# noinspection PyArgumentList
class RoutesRequest(BaseModel):
    """Request model for route calculation between two addresses."""
    start_address: str = Field(
        ...,
        min_length=1,
        description="Starting address or location",
        example="Times Square, New York"
    )
    end_address: str = Field(
        ...,
        min_length=1,
        description="Destination address or location",
        example="Central Park, New York"
    )
    travel_mode: str = Field(
        default="WALK",
        description="Mode of travel: WALK, DRIVE, BICYCLE, or TRANSIT",
        example="WALK"
    )

# noinspection PyArgumentList
class VenueRequest(BaseModel):
    """Request model for venue search near a location."""
    location: str = Field(
        ...,
        min_length=1,
        description="Location to search for venues near",
        example="Paris, France"
    )
    radius: Optional[float] = Field(
        default=10000.0,
        ge=1.0,
        le=50000.0,
        description="Search radius in meters (1m to 50km)",
        example=5000.0
    )
    max_results: Optional[int] = Field(
        default=20,
        ge=1,
        le=20,
        description="Maximum number of venues to return (1 to 20)",
        example=10
    )

# noinspection PyArgumentList
class WeatherRequest(BaseModel):
    """Request model for weather forecast."""
    location: str = Field(
        ...,
        min_length=1,
        description="Location to get weather forecast for",
        example="London, UK"
    )
    days_ahead: Optional[int] = Field(
        default=0,
        ge=0,
        le=9,
        description="Number of days ahead (0=today, 1=tomorrow, max 9)",
        example=1
    )
