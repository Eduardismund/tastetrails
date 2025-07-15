from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # Fixed: Use fastapi import

from app.models.travel_recommendation import TravelRecommendationsRequest
from app.services.qloo_service import QlooService

qloo_service = QlooService()

app = FastAPI(title="TasteTrails AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"]
)


@app.get("/")
def health_check():
    return {"service": "TasteTrails AI", "status": "running"}


@app.post("/api/qloo/recommendations")
async def get_recommendations(request: TravelRecommendationsRequest):
    try:
        preference_dict = {
            "artists": request.user_preferences.artists,
            "books": request.user_preferences.books
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