from fastapi import HTTPException, APIRouter, Query

from app.models.city_recommendation import CityRecommendationsRequest
from app.models.travel_recommendation import TravelRecommendationsRequest
from app.services.qloo_service import QlooService

router = APIRouter()

qloo_service = QlooService()

@router.get("/qloo/search")
async def get_entity_search(query: str = Query(..., min_length=1, description="Search term for entity"),
                            limit: int = Query(5, ge=1, le=50, description="Maximum number of results"),
                            entity_type: str = Query(..., min_length=1, description="Type for the entity")):
    try:
        qloo_type= "urn:entity:" + entity_type
        result = await qloo_service.search_entity(query, qloo_type, limit)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.post("/qloo/recommendations")
async def get_recommendations(request: TravelRecommendationsRequest):
    try:
        preference_dict = {
            "artists": request.user_preferences.artists,
            "books": request.user_preferences.books,
            "movies": request.user_preferences.movies,
            "brands": request.user_preferences.brands,
            "video_games": request.user_preferences.video_games,
            "tv_shows": request.user_preferences.tv_shows,
            "podcasts": request.user_preferences.podcasts,
            "persons": request.user_preferences.persons,
        }

        preference_dict = {k: v for k, v in preference_dict.items() if v}

        if not preference_dict:
            raise HTTPException(status_code=400, detail="No user preference provided!")

        result = await qloo_service.get_recommendations(preference_dict, request.limit)

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))

        return {
            "success": True,
            "data": result,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@router.post("/qloo/recommendation-cities")
async def get_recommendation_cities(request: CityRecommendationsRequest):
    try:
        result = await qloo_service.get_city_recommendations(request.itinerary_cities, request.limit)

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))

        return {
            "success": True,
            "data": result,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")