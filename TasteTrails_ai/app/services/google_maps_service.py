import logging
from typing import Dict, Any
from datetime import timezone, timedelta, date, datetime

from app.clients.google_maps_client import GoogleMapsClient

logger = logging.getLogger(__name__)


class GoogleMapsService:
    def __init__(self):
        self.client = GoogleMapsClient()

    async def find_venues_near_location(self, coordinates: str, radius: float = 10000.0, max_results: int = 20) -> Dict[str, Any]:
        try:


            if max_results <= 0 or max_results > 20:
                return {
                    "success": False,
                    "error": "Max results must be between 1 and 20",
                    "coordinates": coordinates,
                    "venues": []
                }

            venues = await self.client.search_nearby_places(coordinates=coordinates,
                                                            radius=radius,
                                                            max_results=max_results)

            return {
                "success": True,
                "coordinates": coordinates,
                "venues_found": len(venues),
                "venues": venues
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "coordinates": coordinates,
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

        northeast = result.get("bounds").get("northeast")
        southwest = result.get("bounds").get("southwest")

        if any(t in city_like_types for t in types):
            return {
                "success": True,
                "bounds": [str(northeast.get("lat"))+','+str(northeast.get("lng")), str(southwest.get("lat"))+','+str(southwest.get("lng"))],
                "coordinates": result.get("coordinates"),
                "city": True
            }

        return {
            "success": True,
            "city": False
        }

    async def get_weather_forecast_for_location(self, coordinates: str, days_ahead: int = 0) -> Dict[str, Any]:

        try:
            if not coordinates or not coordinates.strip():
                return {
                    "success": False,
                    "error": "Coordinates cannot be empty"
                }

            if days_ahead < 0 or days_ahead > 9:
                return {
                    "success": False,
                    "error": "Days ahead must be between 0 (today) and 9"
                }

            weather_result = await self.client.get_weather_forecast(
                coordinates=coordinates,
                days_ahead=days_ahead
            )

            return weather_result

        except Exception as e:
            return {
                "success": False,
                "error": "Internal service error while getting weather forecast"
            }

    async def get_hourly_air_quality_range_for_location(self, coordinates: str, start_hour: str, end_hour: str,
                                                        target_date: str) -> Dict[str, Any]:

        try:
            start_datetime = datetime.strptime(f"{target_date} {start_hour}", "%Y-%m-%d %H:%M")
            end_datetime = datetime.strptime(f"{target_date} {end_hour}", "%Y-%m-%d %H:%M")

            start_datetime = start_datetime.replace(tzinfo=timezone.utc)
            end_datetime = end_datetime.replace(tzinfo=timezone.utc)

            if end_datetime <= start_datetime:
                return {
                    "success": False,
                    "error": "End time must be after start time"
                }

            now = datetime.now(timezone.utc)
            hours_until_end = (end_datetime - now).total_seconds() / 3600

            if hours_until_end > 96:
                max_date = (now + timedelta(hours=96)).strftime("%Y-%m-%d %H:%M")
                return {
                    "success": False,
                    "error": f"Date range is too far in future",
                    "max_date": max_date
                }
            if not coordinates or not coordinates.strip():
                return {
                    "success": False,
                    "error": "Coordinates cannot be empty"
                }

            air_quality = await self.client.get_hourly_air_quality_range(
                coordinates=coordinates,
                start_datetime=start_datetime,
                end_datetime=end_datetime,
                target_date=target_date
            )

            return air_quality

        except Exception as e:
            logger.error(f"Service error getting weather for {coordinates}: {str(e)}")
            return {
                "success": False,
                "error": "Internal service error while getting weather forecast"
            }

    async def get_pollen_forecast_for_location(self, coordinates: str, target_date: str) -> Dict[str, Any]:

        try:
            if target_date is None:
                target_date_obj = date.today()
                target_date = target_date_obj.strftime("%Y-%m-%d")
            else:
                try:
                    target_date_obj = datetime.strptime(target_date, "%Y-%m-%d").date()
                except ValueError:
                    return {
                        "success": False,
                        "error": "Invalid date format. Use YYYY-MM-DD (e.g., '2025-07-28')"
                    }
            today = date.today()
            days_from_today = (target_date_obj - today).days

            if days_from_today < 0:
                return {
                    "success": False,
                    "error": f"Cannot get pollen data for past dates. Target date {target_date} is {abs(days_from_today)} days ago."
                }

            if days_from_today > 4:
                max_date = (today + timedelta(days=4)).strftime("%Y-%m-%d")
                return {
                    "success": False,
                    "error": f"Target date {target_date} is too far in the future. Maximum date available is {max_date}."
                }

            air_quality = await self.client.get_pollen_forecast(
                coordinates=coordinates,
                days_offset=days_from_today
            )

            return air_quality

        except Exception as e:
            logger.error(f"Service error getting weather for {coordinates}: {str(e)}")
            return {
                "success": False,
                "error": "Internal service error while getting weather forecast"
            }


google_maps_service = GoogleMapsService()

__all__ = ['GoogleMapsService', 'google_maps_service']