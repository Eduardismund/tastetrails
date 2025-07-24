from fastapi import HTTPException, APIRouter

from app.models.google_maps_requests import VenueRequest, RoutesRequest, AddressRequest, WeatherRequest
from app.services.google_maps_service import google_maps_service

router = APIRouter()


@router.post("/venues")
async def search_venues_near_location(request: VenueRequest):
    result = await google_maps_service.find_venues_near_location(
        request.location,
        request.radius,
        request.max_results
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return result

@router.post("/routes")
async def calculate_route_between_addresses(request: RoutesRequest):
    result = await google_maps_service.calculate_route_between_addresses(
        request.start_address,
        request.end_address,
        request.travel_mode
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return result
@router.post("/geocode-route")
async def convert_address_to_coordinates(request: AddressRequest):
    result = await google_maps_service.convert_address_in_coordinates(
        request.address
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return result

@router.post("/weather-route")
async def get_weather_forecast(request: WeatherRequest):
    result = await google_maps_service.get_weather_forecast_for_location(
        request.location,
        request.days_ahead)

    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result["error"])

    return result

@router.post("/is-city")
async def validate_if_location_is_city(request: AddressRequest):
    result = await google_maps_service.check_if_location_is_city(
        request.address
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return result