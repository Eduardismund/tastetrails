# app/clients/claude_client.py
import httpx
from typing import Dict, Any, Optional
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class ClaudeClient:
    """
    Claude API client - handles raw API communication
    """

    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.base_url = "https://api.anthropic.com/v1/messages"
        self.headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }

    async def generate(self,
                       prompt: str,
                       model: str = "claude-3-5-sonnet-20241022",
                       max_tokens: int = 2500,
                       temperature: float = 0.7) -> Dict[str, Any]:

        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "model": model,
                    "max_tokens": max_tokens,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": temperature
                }

                response = await client.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload,
                    timeout=45.0
                )

                if response.status_code == 200:
                    data = response.json()
                    content = data["content"][0]["text"]

                    return {
                        "success": True,
                        "content": content
                    }

                else:
                    error_text = response.text

                    return {
                        "success": False,
                        "error": f"Claude API error: {response.status_code}",
                        "details": error_text
                    }

        except httpx.TimeoutException:
            return {
                "success": False,
                "error": "Claude API timeout",
                "details": "Request took longer than 45 seconds"
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Claude API call failed: {str(e)}",
                "details": str(e)
            }


claude_client = ClaudeClient()

__all__ = ['ClaudeClient', 'claude_client']