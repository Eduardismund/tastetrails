import logging
import os
from typing import Dict, Any, Optional, List

import httpx

logger = logging.getLogger(__name__)

class GoogleMapsClient:
    def __init__(self):
        self.api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
        self.timeout = 30.0

        self.places_headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.id,places.types"
        }

        self.routes_headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters"
        }

    async def get_hourly_air_quality_range(self, coordinates: str, start_datetime, end_datetime, target_date: str) -> Dict[str, Any]:

        lat, lng = coordinates.strip().split(',')
        try:

            hours_in_range = int((end_datetime - start_datetime).total_seconds() / 3600)

            url = "https://airquality.googleapis.com/v1/forecast:lookup"

            request_body = {
                "location": {
                    "latitude": lat,
                    "longitude": lng
                },
                "period": {
                    "startTime": start_datetime.isoformat(),
                    "endTime": end_datetime.isoformat(),
                },
                "pageSize" : min(hours_in_range + 1, 96),
                "extraComputations" : [
                    "HEALTH_RECOMMENDATIONS",
                    "DOMINANT_POLLUTANT_CONCENTRATION",
                    "POLLUTANT_ADDITIONAL_INFO"
                ],
                "languageCode": "en",
                "universalAqi": True
            }

            async with httpx.AsyncClient(timeout=self.timeout) as client:

                response = await client.post(
                    url=url,
                    headers={
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": self.api_key,
                        "Accept-Language": "en"
                    },
                    json=request_body
                )

                response.raise_for_status()

                data = response.json()

                return self._parse_air_quality_data(data, start_datetime, end_datetime)
        except httpx.HTTPStatusError as e:
            return {"success": False, "error": f"API error: {e.response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_pollen_forecast(self, coordinates: str, days_offset: int) -> Dict[str, Any]:

        try:
            lat, lng = coordinates.strip().split(',')

            url = "https://pollen.googleapis.com/v1/forecast:lookup"

            params = {
                "key": self.api_key,
                "location.latitude": lat,
                "location.longitude": lng,
                "days": days_offset + 1,
                "languageCode": "en",
                "plantsDescription": "false"
            }

            async with httpx.AsyncClient(timeout=self.timeout) as client:

                response = await client.get(
                    url=url,
                    params=params,
                )

                response.raise_for_status()

                data = response.json()

                return self._parse_pollen_data(data, days_offset)
        except httpx.HTTPStatusError as e:
            return {"success": False, "error": f"API error: {e.response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def search_nearby_places(self, coordinates: str, radius: float = 10000.0, max_results: int = 20) -> List[Dict[str, Any]]:
        try:
            lat, lng = coordinates.strip().split(',')

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                url = "https://places.googleapis.com/v1/places:searchNearby"

                request_body = {
                    "locationRestriction": {
                        "circle": {
                            "center": {"latitude": lat, "longitude": lng},
                            "radius": radius
                        }
                    },
                    "includedTypes": [
                        "museum", "art_gallery", "library", "book_store",
                        "performing_arts_theater", "cultural_center",
                        "tourist_attraction", "restaurant", "cafe"
                    ],
                    "maxResultCount": min(max_results, 20)
                }
                response = await client.post(
                    url=url,
                    headers=self.places_headers,
                    json=request_body
                )

                if response.status_code == 200:
                    data = response.json()
                    places = []

                    for place in data.get("places", []):
                        places.append({
                            "name": place.get("displayName",{}).get("text", "Unknown"),
                            "address": place.get("formattedAddress", "Unknown"),
                            "rating": place.get("rating", 0.0),
                            "types": place.get("types", [])
                        })
                    return places
                else:
                    return []
        except Exception as e:
            return []
        except httpx.HTTPStatusError as e:
            return []

    async def calculate_route(self, start_address: str, end_address: str, travel_mode: str = "WALK") -> Dict[str, Any]:

        valid_modes = ["WALK", "DRIVE", "BICYCLE", "TRANSIT"]
        if travel_mode not in valid_modes:
            return {
                "success": False,
                "error": f"Invalid travel mode. Must be one of: {valid_modes}"
            }

        try:
            url = "https://routes.googleapis.com/directions/v2:computeRoutes"
            request_body = {
                "origin": {"address": start_address},
                "destination": {"address": end_address},
                "travelMode": travel_mode,
                "units": "METRIC"
            }

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url=url, headers=self.routes_headers, json=request_body)

                response.raise_for_status()

                data = response.json()

                if not data.get("routes", []):
                    return {
                        "success": False,
                        "error": "No route found between the specified addresses"
                    }

                route = data["routes"][0]

                duration_info = int(route.get("duration").rstrip('s'))
                distance_info = int(route.get("distanceMeters"))

                duration_minutes = duration_info // 60
                distance_km = distance_info / 1000

                return {
                    "success": True,
                    "start_address": start_address,
                    "end_address": end_address,
                    "travel_mode": travel_mode,
                    "duration_minutes": duration_minutes,
                    "distance_km": round(distance_km, 2)
                }

        except httpx.HTTPStatusError as e:
            return {"success": False, "error": e}

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


    async def geocode_address(self, address: str) -> Optional[Dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                url = "https://maps.googleapis.com/maps/api/geocode/json"

                params = {
                    "address": address,
                    "key": self.api_key
                }

                response = await client.get(url=url, params=params, timeout=20.0)

                response.raise_for_status()

                data = response.json()

                results = data.get("results", [])

                if not results:
                    return None

                result = results[0]
                location = result["geometry"]["location"]
                geometry = result["geometry"]

                bounds = {
                    "northeast": {
                        "lat": geometry["bounds"]["northeast"]["lat"],
                        "lng": geometry["bounds"]["northeast"]["lng"]
                    },
                    "southwest": {
                        "lat": geometry["bounds"]["southwest"]["lat"],
                        "lng": geometry["bounds"]["southwest"]["lng"]
                    }
                }

                return {
                    "success": True,
                    "coordinates": f"{location['lat']},{location['lng']}",
                    "types": result.get("types", []),
                    "latitude": location['lat'],
                    "bounds": bounds,
                    "longitude": location['lng']
                }
        except httpx.HTTPStatusError as e:
            return None
        except Exception as e:
            return None

    async def get_weather_forecast(self, coordinates: str, days_ahead: int) -> Dict[str, Any]:

        if days_ahead < 0 or days_ahead > 9:
            return {"success": False,
                    "error": "days_ahead must be between 0 and 9"}

        try:

            lat, lng = coordinates.strip().split(',')

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                url = "https://weather.googleapis.com/v1/forecast/days:lookup"

                params = {
                    "key": self.api_key,
                    "location.latitude": lat,
                    "location.longitude": lng,
                    "days": max(days_ahead + 1, 1)
                }

                response = await client.get(
                    url=url,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                return self._parse_weather_data_for_day(data, days_ahead)

        except httpx.HTTPStatusError as e:
            return {"success": False, "error": e}
        except Exception as e:
            return {"success": False, "error": e}

    def _parse_pollen_data(self, data: Dict, days_from_today: int) -> Dict[str, Any]:
        try:
            daily_info = data.get("dailyInfo", [])
            if not daily_info:
                return {
                    "success": False,
                    "error": "No pollen data available for this coordinates"
                }

            day_data = daily_info[days_from_today]

            pollen_summary = {}
            for pollen_type in day_data.get("pollenTypeInfo", []):
                code = pollen_type.get("code", "").lower()
                index_info = pollen_type.get("indexInfo", {})

                if index_info:
                    pollen_summary[code] = {
                        "level": index_info.get("value", 0),
                        "category": index_info.get("category", "Unknown"),
                        "in_season": pollen_type.get("inSeason", False)
                    }

            overall_level = 0
            worst_pollen_type = "none"
            for pollen_type, info in pollen_summary.items():
                if info["level"] > overall_level:
                    overall_level = info["level"]
                    worst_pollen_type = pollen_type

            active_plants = []
            for plant in day_data.get("plantInfo", []):
                if plant.get("inSeason") and plant.get("indexInfo", {}).get("value", 0) > 0:
                    active_plants.append({
                        "name": plant.get("displayName", "Unknown"),
                        "level": plant.get("indexInfo", {}).get("value", 0),
                        "type": plant.get("plantDescription", {}).get("type", "").lower()
                    })

            active_plants.sort(key=lambda x: x["level"], reverse=True)


            return {
                "success": True,
                "days_from_today": days_from_today,
                "overall_level": overall_level,
                "worst_pollen_type": worst_pollen_type,
                "pollen_summary": pollen_summary,
                "active_plants": active_plants[:3]
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Error parsing pollen data: {str(e)}"
            }

    def _parse_air_quality_data(self, data: Dict, start_date, end_date) -> Dict[str, Any]:
        """
        Very simple air quality parser - just daily AQI averages.
        """
        try:
            from datetime import datetime

            forecasts = data.get("hourlyForecasts", [])
            if not forecasts:
                return {"success": False, "error": "No air quality data"}

            daily_data = {}

            for forecast in forecasts:
                # Get datetime
                dt_str = forecast.get("dateTime", "")
                try:
                    dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                except:
                    continue

                # Check date range
                if not (start_date <= dt <= end_date):
                    continue

                # Get AQI
                aqi = None
                for index in forecast.get("indexes", []):
                    if index.get("code") == "uaqi":
                        aqi = index.get("aqi", 0)
                        break

                if aqi is None:
                    continue

                # Group by date
                date_key = dt.strftime("%Y-%m-%d")
                if date_key not in daily_data:
                    daily_data[date_key] = []
                daily_data[date_key].append(aqi)

            # Calculate daily averages
            result = []
            for date in sorted(daily_data.keys()):
                aqi_values = daily_data[date]
                avg_aqi = round(sum(aqi_values) / len(aqi_values))
                result.append({
                    "date": date,
                    "average_aqi": avg_aqi
                })

            return {
                "success": True,
                "daily_forecasts": result
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    def _parse_weather_data_for_day(self, data: Dict, day_offset: int) -> Dict[str, Any]:
        try:
            forecast_days = data.get("forecastDays", [])

            if not forecast_days:
                return {
                    "success": False,
                    "error": "No forecast days found"
                }
            target_day = forecast_days[day_offset]
            daytime = target_day.get("daytimeForecast", {})
            nighttime = target_day.get("nighttimeForecast", {})

            return {
                "success": True,
                "temperature": {
                    "max": target_day.get("maxTemperature", {}).get("degrees"),
                    "min": target_day.get("minTemperature", {}).get("degrees"),
                    "feels_like_max": target_day.get("feelsLikeMaxTemperature", {}).get("degrees"),
                    "feels_like_min": target_day.get("feelsLikeMinTemperature", {}).get("degrees"),
                    "unit": target_day.get("maxTemperature", {}).get("unit", "CELSIUS")
                },
                "daytime": {
                    "condition_type": daytime.get("weatherCondition", {}).get("type"),
                    "humidity": daytime.get("relativeHumidity"),
                    "uv_index": daytime.get("uvIndex"),
                    "precipitation": {
                        "probability": daytime.get("precipitation", {}).get("probability", {}).get("percent"),
                        "type": daytime.get("precipitation", {}).get("probability", {}).get("type"),
                        "amount": daytime.get("precipitation", {}).get("qpf", {}).get("quantity"),
                        "unit": daytime.get("precipitation", {}).get("qpf", {}).get("unit")
                    },
                    "thunderstorm_probability": daytime.get("thunderstormProbability"),
                    "wind": {
                        "speed": daytime.get("wind", {}).get("speed", {}).get("value"),
                        "direction": daytime.get("wind", {}).get("direction", {}).get("cardinal"),
                        "unit": daytime.get("wind", {}).get("speed", {}).get("unit")
                    },
                    "cloud_cover": daytime.get("cloudCover")
                },
                "nighttime": {
                    "condition_type": nighttime.get("weatherCondition", {}).get("type"),
                    "humidity": nighttime.get("relativeHumidity"),
                    "precipitation": {
                        "probability": nighttime.get("precipitation", {}).get("probability", {}).get("percent"),
                        "type": nighttime.get("precipitation", {}).get("probability", {}).get("type"),
                        "amount": nighttime.get("precipitation", {}).get("qpf", {}).get("quantity")
                    },
                    "wind": {
                        "speed": nighttime.get("wind", {}).get("speed", {}).get("value"),
                        "direction": nighttime.get("wind", {}).get("direction", {}).get("cardinal"),
                    },
                    "cloud_cover": nighttime.get("cloudCover")
                },
                "sun_events": {
                    "sunrise": target_day.get("sunEvents", {}).get("sunriseTime"),
                    "sunset": target_day.get("sunEvents", {}).get("sunsetTime")
                }

            }
        except Exception as e:
            return {"success": False, "error": str(e)}