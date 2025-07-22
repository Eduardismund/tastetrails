import asyncio
from typing import List, Dict, Any

from app.clients.qloo_client import QlooClient


class QlooService:
    def __init__(self):
        self.client = QlooClient()

    async def search_entity(self, query: str, type: str, limit: int):
        try:
            return await self.client.search_entities(query, type, limit)
        except Exception as e:
            return []

    async def get_recommendations(self, user_preferences: Dict[str, List[str]], limits: int) -> Dict[str, Any]:
        try:
            results = {
                "success": True,
                "user_preferences": user_preferences,
                "recommendations": {}
            }

            tasks = []
            task_names = []

            if "artists" in user_preferences and user_preferences["artists"]:
                tasks.append(self.client.get_recommendations(
                    user_preferences["artists"],
                    "artist",
                    limits
                ))
                task_names.append("artists")

            if "books" in user_preferences and user_preferences["books"]:
                tasks.append(self.client.get_recommendations(
                    user_preferences["books"],
                    "book",
                    limits
                ))
                task_names.append("books")

            if "movies" in user_preferences and user_preferences["movies"]:
                tasks.append(self.client.get_recommendations(
                    user_preferences["movies"],
                    "movie",
                    limits
                ))
                task_names.append("movies")

            if tasks:
                tasks_results = await asyncio.gather(*tasks, return_exceptions=True)

                for i, result in enumerate(tasks_results):
                    task_name = task_names[i]

                    if isinstance(result, Exception):
                        return {
                            "success": False,
                            "error": str(result),
                            "recommendations": {}
                        }
                    else:
                        results["recommendations"][task_name] = result

                return results
            else:
                return {
                    "success": False,
                    "error": "No artists provided",
                    "recommendations": {}
                }
        except Exception as e:
            return {"success": False, "error": str(e), "recommendations": {}}


qloo_service = QlooService()

__all__ = ['QlooService', 'qloo_service']
