from typing import List, Optional

from pydantic import BaseModel  # Fixed: Use regular pydantic


class UserPreferences(BaseModel):
    artists: Optional[List[str]] = []
    books: Optional[List[str]] = []
    movies: Optional[List[str]] = []