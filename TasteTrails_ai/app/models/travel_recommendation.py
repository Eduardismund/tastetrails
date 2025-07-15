from typing import List, Optional

from pydantic import BaseModel  # Fixed: Use regular pydantic

from app.models.user_preferences import UserPreferences


class TravelRecommendationsRequest(BaseModel):
    user_preferences: UserPreferences
    limit: Optional[int]