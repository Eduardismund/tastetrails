from fastapi import HTTPException, APIRouter

from app.clients.redis_client import get_redis_cache
from app.models.google_maps_requests import VenueRequest, RoutesRequest, AddressRequest, WeatherRequest, \
    AirQualityRequest, PollenQualityRequest
from app.services.google_maps_service import google_maps_service

router = APIRouter()


@router.post("/venues")
async def search_venues_near_location(request: VenueRequest):
    redis_cache = await get_redis_cache()

    cache_key = redis_cache.generate_cache_key("venues", request.model_dump())

    cached_result = await redis_cache.get_cache(cache_key)
    if cached_result:
        return cached_result

    result = await google_maps_service.find_venues_near_location(
        request.coordinates,
        request.radius,
        request.max_results
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    await redis_cache.set_cache(cache_key, result, ttl_seconds=3600)

    return result

@router.post("/routes")
async def calculate_route_between_addresses(request: RoutesRequest):
    redis_cache = await get_redis_cache()

    cache_key = redis_cache.generate_cache_key("routes", request.model_dump())

    cached_result = await redis_cache.get_cache(cache_key)

    if cached_result:
        return cached_result
    result = await google_maps_service.calculate_route_between_addresses(
        request.start_address,
        request.end_address,
        request.travel_mode
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    await redis_cache.set_cache(cache_key, result, ttl_seconds=3600)

    return result
@router.post("/geocode-route")
async def convert_address_to_coordinates(request: AddressRequest):
    redis_cache = await get_redis_cache()

    cache_key = redis_cache.generate_cache_key("geocode_route", request.model_dump())

    cached_result = await redis_cache.get_cache(cache_key)
    if cached_result:
        return cached_result

    result = await google_maps_service.convert_address_in_coordinates(
        request.address
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    await redis_cache.set_cache(cache_key, result, ttl_seconds=3600)

    return result

@router.post("/weather-route")
async def get_weather_forecast(request: WeatherRequest):
    redis_cache = await get_redis_cache()

    cache_key = redis_cache.generate_cache_key("weather_route", request.model_dump())

    cached_result = await redis_cache.get_cache(cache_key)
    if cached_result:
        return cached_result

    result = await google_maps_service.get_weather_forecast_for_location(
        request.coordinates,
        request.days_ahead)

    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result["error"])

    await redis_cache.set_cache(cache_key, result, ttl_seconds=3600)

    return result

@router.post("/air-quality")
async def get_air_quality(request: AirQualityRequest):
    redis_cache = await get_redis_cache()

    cache_key = redis_cache.generate_cache_key("air_quality", request.model_dump())

    cached_result = await redis_cache.get_cache(cache_key)
    if cached_result:
        return cached_result

    result = await google_maps_service.get_hourly_air_quality_range_for_location(
        request.coordinates,
        request.start_hour,
        request.end_hour,
        request.target_date
    )


    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result["error"])

    await redis_cache.set_cache(cache_key, result, ttl_seconds=3600)

    return result
@router.post("/pollen-forecast")
async def get_pollen_forecast(request: PollenQualityRequest):
    redis_cache = await get_redis_cache()

    cache_key = redis_cache.generate_cache_key("pollen_forecast", request.model_dump())

    cached_result = await redis_cache.get_cache(cache_key)
    if cached_result:
        return cached_result


    result = await google_maps_service.get_pollen_forecast_for_location(
        request.coordinates,
        str(request.target_date),
    )

    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result["error"])

    await redis_cache.set_cache(cache_key, result, ttl_seconds=3600)

    return result

@router.post("/is-city")
async def validate_if_location_is_city(request: AddressRequest):
    redis_cache = await get_redis_cache()

    cache_key = redis_cache.generate_cache_key("is_city", request.model_dump())

    cached_result = await redis_cache.get_cache(cache_key)
    if cached_result:
        return cached_result

    result = await google_maps_service.check_if_location_is_city(
        request.address
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    await redis_cache.set_cache(cache_key, result, ttl_seconds=3600)

    return result