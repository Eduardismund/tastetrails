
from fastapi import APIRouter, HTTPException

from app.clients.claude_client import claude_client
from app.services.qloo_service import qloo_service
from app.services.claude_service import claude_service

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
        qloo_results = await qloo_service.get_recommendations(request["user_preferences"], 5)

        if not qloo_results.get("success"):
            raise HTTPException(status_code=500, detail="Qloo failed")

        claude_result = await claude_service.generate_activity(
            qloo_results,
            request["user_preferences"],
            request["city"],
            request["start_time"],
            request["end_time"],
            request["date"],
            request.get("theme", "Cultural Discovery")
        )

        if not claude_result:
            raise HTTPException(status_code=500, detail="Claude failed")

        return {
            "success": True,
            "city": request["city"],
            "options": claude_result["data"].get("options", []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))