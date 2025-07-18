from typing import Optional
from pydantic import BaseModel
from app.models.user_preferences import UserPreferences


class TravelRecommendationsRequest(BaseModel):
    user_preferences: UserPreferences
    limit: Optional[int]
