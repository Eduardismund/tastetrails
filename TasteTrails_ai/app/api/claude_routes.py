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
        # 🔥 SERVER-SIDE LOGGING 🔥
        logger.info("=== CLAUDE GENERATE OPTIONS REQUEST ===")
        logger.info(f"Full request data: {request}")
        logger.info(f"User preferences: {request.get('user_preferences', {})}")
        logger.info(f"City: {request.get('city', 'Not provided')}")
        logger.info(f"Start time: {request.get('start_time', 'Not provided')}")
        logger.info(f"End time: {request.get('end_time', 'Not provided')}")
        logger.info(f"Date: {request.get('date', 'Not provided')}")
        logger.info(f"Theme: {request.get('theme', 'Cultural Discovery')}")
        logger.info(f"Existing Activities: {request.get('existing_activities', 'Cultural Discovery')}")

        logger.info("=======================================")

        qloo_results = await qloo_service.get_recommendations(request["user_preferences"], 5)

        if not qloo_results.get("success"):
            logger.error(f"Qloo service failed: {qloo_results}")
            raise HTTPException(status_code=500, detail="Qloo failed")

        logger.info(f"Qloo results: {qloo_results}")

        claude_result = await claude_service.generate_activity(
            qloo_results,
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

        logger.info(f"Claude result: {claude_result}")

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