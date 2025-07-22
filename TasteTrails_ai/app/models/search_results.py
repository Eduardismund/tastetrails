from pydantic import BaseModel


class SearchResult(BaseModel):
    entityId: str
    name: str
