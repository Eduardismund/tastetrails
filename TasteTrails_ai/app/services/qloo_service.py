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

    async def get_city_recommendations(self, itinerary_cities: List[str], limits: int):
        try:

            if not itinerary_cities:
                return {
                    "success": False,
                    "error": "Cities list cannot be empty",
                    "recommended_cities": []
                }

            clean_cities = [city.strip() for city in itinerary_cities if city and city.strip()]

            if not clean_cities:
                return {
                    "success": False,
                    "error": "No valid cities provided",
                    "recommended_cities": []
                }

            result = await self.client.get_recommendations(clean_cities, "destination", limits)

            if result.get("success"):
                return {
                    "success": True,
                    "input_cities": clean_cities,
                    "recommended_cities": result.get("recommendations", [])
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Failed to get city recommendations"),
                    "recommended_cities": []
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get city recommendations: {str(e)}",
                "recommended_cities": []
            }


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

            if "brands" in user_preferences and user_preferences["brands"]:
                tasks.append(self.client.get_recommendations(
                    user_preferences["brands"],
                    "brand",
                    limits
                ))
                task_names.append("brands")

            if "video_games" in user_preferences and user_preferences["video_games"]:
                tasks.append(self.client.get_recommendations(
                    user_preferences["video_games"],
                    "videogame",
                    limits
                ))
                task_names.append("video_games")

            if "tv_shows" in user_preferences and user_preferences["tv_shows"]:
                tasks.append(self.client.get_recommendations(
                    user_preferences["tv_shows"],
                    "tv_show",
                    limits
                ))
                task_names.append("tv_shows")

            if "podcasts" in user_preferences and user_preferences["podcasts"]:
                tasks.append(self.client.get_recommendations(
                    user_preferences["podcasts"],
                    "podcast",
                    limits
                ))
                task_names.append("podcasts")

            if "persons" in user_preferences and user_preferences["persons"]:
                tasks.append(self.client.get_recommendations(
                    user_preferences["persons"],
                    "person",
                    limits
                ))
                task_names.append("persons")

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
