import logging

from fastapi import APIRouter, HTTPException

from app.clients.claude_client import claude_client
from app.services.qloo_service import qloo_service
from app.services.claude_service import claude_service


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/claude/test")
async def test_claude():
    """Test Claude API connection"""
    try:

        result = await claude_client.generate(
            prompt="Hello! Respond with 'Yes' to test the connection",
            max_tokens=50
        )

        return {
            "success": result.get("success", False),
            "claude_response": result.get("content", ""),
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


@router.post("/claude/generate-options")
async def claude_generate_options(request: dict):
    try:
        claude_result = await claude_service.generate_activity(
            request["user_preferences"],
            request["city"],
            request["start_time"],
            request["end_time"],
            request["date"],
            request.get("theme", "Cultural Discovery"),
            request.get("existing_activities", [])
        )

        if not claude_result:
            logger.error("Claude service returned empty result")
            raise HTTPException(status_code=500, detail="Claude failed")

        response = {
            "success": True,
            "city": request["city"],
            "options": claude_result["data"].get("options", []),
        }

        logger.info(f"Final response: {response}")

        return response

    except Exception as e:
        logger.error(f"Error in claude_generate_options: {str(e)}")
        logger.error(f"Request that caused error: {request}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/claude/generate_options_today")
async def claude_generate_options_today(request: dict):
    try:
        claude_result = await claude_service.generate_options_today(
            request["user_preferences"],
            request["itinerary_cities"],
        )

        if not claude_result:
            logger.error("Claude service returned empty result")
            raise HTTPException(status_code=500, detail="Claude failed")

        response = {
            "success": True,
            "options": claude_result["data"].get("options", []),
        }

        logger.info(f"Final response: {response}")

        return response

    except Exception as e:
        logger.error(f"Error in claude_generate_options: {str(e)}")
        logger.error(f"Request that caused error: {request}")
        raise HTTPException(status_code=500, detail=str(e))