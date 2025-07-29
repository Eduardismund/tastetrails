from typing import List, Optional

from pydantic import BaseModel  # Fixed: Use regular pydantic


class UserPreferences(BaseModel):
    artists: Optional[List[str]] = []
    books: Optional[List[str]] = []
    movies: Optional[List[str]] = []
    brands: Optional[List[str]] = []
    video_games: Optional[List[str]] = []
    tv_shows: Optional[List[str]] = []
    podcasts: Optional[List[str]] = []
    persons: Optional[List[str]] = []