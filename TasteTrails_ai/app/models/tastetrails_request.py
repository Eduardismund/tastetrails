from typing import Optional
from pydantic import BaseModel
from app.models.user_preferences import UserPreferences


class TasteTrailsRequest(BaseModel):
    user_preferences: UserPreferences
    city: Optional[str]
    days: Optional[int]
