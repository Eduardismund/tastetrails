import json
import logging

from app.clients.claude_client import claude_client


class ClaudeService:
    """
    Claude service - handles business logic for itinerary generation
    """

    def __init__(self):
        self.client = claude_client


    async def generate_activity(self, cultural_profile, user_preferences, city, start_time, end_time, date, theme):
        """Generate a set of proposed activities based on user's preferences"""
        try:
            prompt = f"""
                        Have the mindset of an expert trip advisor for {theme} that knows all the activities and periodic events in the city {city}, between the time period: {start_time} to {end_time} on date {date}.

                        User's preferences are: {user_preferences}
                        Qloo's recommendations are: {cultural_profile}

                        Return only this JSON format:
                        {{
                            "options": [
                                {{"id": "option_1", "name": "Relevant name for activity", "activity": "What to do", "location": "Where", "cultural_score": 95}},
                                {{"id": "option_2", "name": "Relevant name for activity", "activity": "What to do", "location": "Where", "cultural_score": 92}},
                                {{"id": "option_3", "name": "Relevant name for activity", "activity": "What to do", "location": "Where", "cultural_score": 89}}
                            ]
                        }}

                        RULES:
                        - The options must be relevant to the user personality reflected through preferences and Qloo recommendations
                        - There must be 3 options, each following the same structure but different activities
                        - Choose the best activity options, based on the personality reflected through preferences from a specific entity or more
                        - Consider meet-ups, periodic events, and anything that can be considered an activity for {theme}
                        """
            result = await self.client.generate(prompt)

            if result.get("success"):
                try:
                    return {"success": True, "data": json.loads(result["content"])}
                except:
                    return {"success": False, "error": "JSON parse failure"}
            else:
                return {"success": False, "error": result.get("error")}

        except Exception as e:
            return {"success" : False, "error" : str(e)}



claude_service = ClaudeService()

__all__ = ['ClaudeService', 'claude_service']