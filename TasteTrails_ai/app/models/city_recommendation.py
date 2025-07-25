from typing import Optional, List
from pydantic import BaseModel
from app.models.user_preferences import UserPreferences


class CityRecommendationsRequest(BaseModel):
    itinerary_cities: List[str]
    limit: Optional[int]
