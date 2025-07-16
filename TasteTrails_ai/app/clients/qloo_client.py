import logging
from typing import Dict, Any, List
import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class QlooClient:
    def __init__(self):
        self.base_url = settings.QLOO_BASE_URL
        self.api_key = settings.QLOO_API_KEY
        self.headers = {
            "Accept": "application/json",
            "X-API-Key": self.api_key,
        }

    async def search_entities(self, name: str, entity_type: str) -> str:
        """
        Search for entities

        Args:
            name: Name to search for
            entity_type: Type of entity (urn:entity:artist, urn:entity:restaurant, etc.)
        """
        try:
            async with httpx.AsyncClient() as client:
                url = f"{self.base_url}/search"
                params = {"query": name, "types": entity_type}

                response = await client.get(url, headers=self.headers, params=params)

                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    if results:
                        entity_id = results[0].get("entity_id", "")
                        return entity_id

        except Exception as e:
            logger.error(f"Search failed for '{name}': {e}")

        return ""

    async def get_recommendations(self,
                                  input_items: List[str],
                                  entity_type: str,
                                  limit: int = 10) -> Dict[str, Any]:
        """
        General recommendations method

        Args:
            input_items: List of items to get recommendations for
            entity_type: Type of entities
            limit: Max recommendations per input item
        """
        try:
            all_recommendations = []

            if not entity_type.startswith("urn:entity:"):
                entity_type = "urn:entity:" + entity_type

            for input_item in input_items:
                entity_id = await self.search_entities(input_item, entity_type)

                if entity_id:
                    suggestions = await self.get_suggestion(entity_id, entity_type, limit)
                    all_recommendations.extend(suggestions)
                else:
                    logger.warning(f"No entity found for: {input_item}")

            unique_recommendations = self.remove_duplicate_entities(all_recommendations, input_items)

            return {
                "success": True,
                "recommendations": unique_recommendations,
                "total": len(unique_recommendations)
            }
        except Exception as e:
            logger.error(f"Recommendations failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "recommendations": []
            }

    async def get_suggestion(self, entity_id: str, entity_type: str, limit: int) -> List[Dict[str, Any]]:
        """
        Get suggestions for a specific entity
        """
        try:
            async with httpx.AsyncClient() as client:
                url = f"{self.base_url}/recommendations"

                params = {
                    "entity_ids": [entity_id],
                    "type": entity_type,
                    "take": limit
                }

                response = await client.get(
                    url=url,
                    headers=self.headers,
                    params=params,
                    timeout=20.0
                )

                if response.status_code == 200:
                    return await self.process_response(response)

                else:
                    logger.warning(f"Recommendations failed: {response.status_code} - {response.text}")
                    return []

        except Exception as err:
            logger.error(f"Exception getting suggestions: {str(err)}")
            return []

    @staticmethod
    async def process_response(response):
        data = response.json()
        results = data.get("results", [])
        recommendations = []
        for item in results:
            if isinstance(item, dict):
                affinity_score = item.get("query", {}).get("affinity", 0.0)

                genres = []
                tags = item.get("tags", [])
                for tag in tags:
                    if tag.get("type") == "urn:tag:genre":
                        genres.append(tag.get("name", ""))

                popularity = item.get("popularity", 0.0)
                image_url = item.get("properties", {}).get("image", {}).get("url", "")
                external_data = item.get("properties", {}).get("external", {})

                recommendations.append({
                    "name": item.get("name", ""),
                    # "qloo_id": item.get("entity_id", ""),
                    # "score": affinity_score,  # ← Fixed: now gets real affinity score
                    # "popularity": popularity,
                    "genres": genres # ← Fixed: now extracts genres from tags
                    # "image_url": image_url,
                    # "external_links": {
                    #     "spotify": external_data.get("spotify", {}).get("id", ""),
                    #     "lastfm": external_data.get("lastfm", {}).get("id", ""),
                    #     "instagram": external_data.get("instagram", {}).get("id", "")
                    # },
                    # "attributes": item.get("attributes", []),
                    # "tags": [tag.get("name", "") for tag in tags]  # All tags for reference
                })
        return recommendations

    @staticmethod
    def remove_duplicate_entities(entities: List[Dict[str, Any]], input_items: List[str]) -> List[Dict[str, Any]]:
        """Remove duplicate entities based on name and filter out input items"""

        input_names_lower = {item.lower().strip() for item in input_items}
        seen = set()
        unique = []

        for entity in entities:
            name = entity.get("name", "").lower().strip()

            if not name or name in seen or name in input_names_lower:
                continue

            seen.add(name)
            unique.append(entity)

        unique.sort(key=lambda x: x.get("score", 0.0), reverse=True)
        return unique
