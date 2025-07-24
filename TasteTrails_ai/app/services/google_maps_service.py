import asyncio
from typing import List, Dict, Any

from app.clients.google_maps_client import GoogleMapsClient
from app.clients.qloo_client import QlooClient

import logging

logger = logging.getLogger(__name__)


class GoogleMapsService:
    def __init__(self):
        self.client = GoogleMapsClient()

    async def find_venues_near_location(self, location: str, radius: float = 10000.0, max_results: int = 20) -> Dict[str, Any]:
        try:

            if not location or not location.strip():
                return {
                    "success": False,
                    "error": "Location cannot be empty",
                    "location": location,
                    "venues": []
                }

            if radius <= 0 or radius > 50000:
                return {
                    "success": False,
                    "error": "Radius must be between 1 and 50,000 meters",
                    "location": location,
                    "venues": []
                }

            if max_results <= 0 or max_results > 20:
                return {
                    "success": False,
                    "error": "Max results must be between 1 and 20",
                    "location": location,
                    "venues": []
                }

            venues = await self.client.search_nearby_places(location=location.strip(),
                                                            radius=radius,
                                                            max_results=max_results)

            return {
                "success": True,
                "location": location,
                "venues_found": len(venues),
                "venues": venues
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "location": location,
                "venues": []
            }

    async def calculate_route_between_addresses(self, start_address: str, end_address: str, travel_mode: str = "WALK") -> Dict[str, Any]:
        try:
            if not start_address or not start_address.strip():
                return {
                    "success": False,
                    "error": "Start address cannot be empty"
                }

            if not end_address or not end_address.strip():
                return {
                    "success": False,
                    "error": "End address cannot be empty"
                }

            valid_modes = ["WALK", "DRIVE", "BICYCLE", "TRANSIT"]
            if travel_mode.upper() not in valid_modes:
                return {
                    "success": False,
                    "error": f"Invalid travel mode '{travel_mode}'. Must be one of: {', '.join(valid_modes)}"
                }

            route_result = await self.client.calculate_route(
                start_address=start_address.strip(),
                end_address=end_address.strip(),
                travel_mode=travel_mode.upper()
            )

            return route_result

        except Exception as e:
            return {
                "success": False,
                "error": "Internal service error while calculating route"
            }

    async def convert_address_in_coordinates(self, address):
        try:
            if not address or not address.strip():
                return {
                    "success": False,
                    "error": "Address cannot be empty"
                }

            geocode_result = await self.client.geocode_address(address.strip())

            if geocode_result is None:
                return {
                    "success": False,
                    "error": f"Could not find coordinates for address: {address}"
                }

            return geocode_result

        except Exception as e:
            logger.error(f"Service error geocoding address {address}: {str(e)}")
            return {
                "success": False,
                "error": "Internal service error while geocoding address"
            }

    async def check_if_location_is_city(self, city_name):
        result = await self.client.geocode_address(city_name)

        if not result:
            return {
                "success": False,
                "error": "No geocode result returned"
            }

        if result.get("error"):
            return {
                "success": False,
                "error": result["error"]
            }

        types = result.get("types", [])

        city_like_types = {"locality", "administrative_area_level_3", "administrative_area_level_2"}

        if any(t in city_like_types for t in types):
            return {
                "success": True,
                "city": True
            }

        return {
            "success": True,
            "city": False
        }

    async def get_weather_forecast_for_location(self, location: str, days_ahead: int = 0) -> Dict[str, Any]:

        try:
            if not location or not location.strip():
                return {
                    "success": False,
                    "error": "Location cannot be empty"
                }

            if days_ahead < 0 or days_ahead > 9:
                return {
                    "success": False,
                    "error": "Days ahead must be between 0 (today) and 9"
                }

            weather_result = await self.client.get_weather_forecast(
                location=location.strip(),
                days_ahead=days_ahead
            )

            return weather_result

        except Exception as e:
            logger.error(f"Service error getting weather for {location}: {str(e)}")
            return {
                "success": False,
                "error": "Internal service error while getting weather forecast"
            }



google_maps_service = GoogleMapsService()

__all__ = ['GoogleMapsService', 'google_maps_service']