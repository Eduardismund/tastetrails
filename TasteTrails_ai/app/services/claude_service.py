import json
import logging
from datetime import datetime, date

import httpx
from fastapi import HTTPException

from app.clients.claude_client import claude_client

logger = logging.getLogger(__name__)


class ClaudeService:
    """
    Claude service - handles business logic for itinerary generation
    """

    def __init__(self):
        self.client = claude_client

    async def generate_activity(self, user_preferences, city, coordinates,start_time, end_time, activity_date, theme,
                                existing_activities):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://localhost:8001/api/qloo/recommendations",
                    json={"user_preferences": user_preferences, "limit": 5},
                    timeout=10.0
                )
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail="Qloo failed")
                cultural_profile = response.json()

                response = await client.post(
                    "http://localhost:8001/api/venues",
                    json={"coordinates": coordinates},
                    timeout=10.0
                )
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail="Google Maps failed")

                nearby_venues = response.json()


                target_date = datetime.strptime(activity_date, "%Y-%m-%d").date()
                today = date.today()
                days_diff = (target_date - today).days

                response = await client.post(
                    "http://localhost:8001/api/weather-route",
                    json={"coordinates": coordinates, "days_ahead": days_diff},
                    timeout=10.0
                )
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail="Google Maps failed")

                weather_info = response.json()

                response = await client.post(
                    "http://localhost:8001/api/air-quality",
                    json={"coordinates": coordinates,
                          "start_hour": str(start_time),
                          "end_hour": str(end_time),
                          "target_date": str(activity_date)},
                    timeout=10.0
                )

                air_quality_info = response.json()

                response = await client.post(
                    "http://localhost:8001/api/pollen-forecast",
                    json={"coordinates": coordinates, "target_date": activity_date},
                    timeout=10.0
                )

                pollen_info = response.json()

            prompt = f"""
                        Have the mindset of an expert trip advisor for {theme} that knows all the activities and periodic events in the city {city}, between the time period: {start_time} to {end_time} on date {activity_date}.
                        Google Places API recommends the following: {nearby_venues}
                        The air quality is the following: {air_quality_info}
                        The pollen forecast is the following: {pollen_info}
                        The weather on the corresponding day is: {weather_info}
                        The following activities are already existing: {existing_activities}
                        User's preferences are: {user_preferences}
                        Qloo's recommendations are: {cultural_profile}

                        Return only this JSON format:
                        {{
                            "options": [
                                {{"id": "option_1", "name": "Relevant name for activity", "activity": "What to do", "location": "Where", "cultural_score": 0-100, "reasoning": "Reason why this activity is relevant", "coordinates": "Best coordinates to see the location", "heading": 0, "pitch": 0}},
                                {{"id": "option_2", "name": "Relevant name for activity", "activity": "What to do", "location": "Where", "cultural_score": 0-100, "reasoning": "Reason why this activity is relevant", "coordinates": "Best coordinates to see the location", "heading": 0, "pitch": 0}},
                                {{"id": "option_3", "name": "Relevant name for activity", "activity": "What to do", "location": "Where", "cultural_score": 0-100, "reasoning": "Reason why this activity is relevant", "coordinates": "Best coordinates to see the location", "heading": 0, "pitch": 0}}
                            ]
                        }}

                        RULES:
                        - Do not repeat the user preference more than once, instead give base your answers on the recommendations
                        - The Qloo recommendations genres are as relevant to ensure that ativities are appropriate
                        - All the Google Maps API's are relvant and mention when they are a favourable thing or not
                        - The activity description should be around 5 sentence long and be as creative as possible, combining as many preferences and recommendations as possible, ex: mention the main activity and specify mini tasks to do in that time like listen to a song, drink something, etc... what is relevant to the user
                        - The coordinates, heading and pitch must be the best in order to fully put in advantage that place, prioritize the view from the street directly to the place
                        - The options must be relevant to the user personality reflected through Qloo recommendations
                        - The Qloo recommendations are just as valuable in selecting the most appropriate option
                        - Do not mention the Qloo recommendations as explicit from Qloo, instead treat them as if the user was the one who input them and maybe value them more, 
                        - Based on the User preferences make the option of activity as unique as possible. e.g. 'Because the user likes an X artist, he should listen to their music while visiting a location'
                        - Make the activity more descriptive and include elements and aspects from the whole 'user_preferences' categories to truly make it unique
                        - The activity description should be detailed and specific, including many elements of what the user actually likes or that are recommended by Qloo to them
                        - When reasoning, use second person addressing, as talking directly with the user
                        - The addresses should match the style of the ones received from Google Places API
                        - Air quality should be a factor in choosing activities and mentioned when is affects
                        - Pollen should be a factor in choosing activities and mentioned when is affects
                        - Weather on that day factors in the activity choosing reasoning, if it exists and mention when weather affects activities
                        - The Google Places API recommendations are important, but if there is a better option that isn't linked to Google Places, consider it better
                        - The reasoning should be short and clear, not more than a sentence
                        - Already existing activities should not be considered again
                        - There must be 3 options, each following the same structure but different activities
                        - Prioritize options that meet multiple preferences criteria
                        - Search for occasional events on that specific day on EventBride or the internet
                        - The activity options must be relevant to the time period availability and make sense in the context
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
            return {"success": False, "error": str(e)}

    async def generate_options_today(self, user_preferences, itinerary_cities, today_date):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://localhost:8001/api/qloo/recommendations",
                    json={"user_preferences": user_preferences, "limit": 5},
                    timeout=10.0
                )
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail="Qloo failed")
                cultural_profile = response.json()

                response = await client.post(
                    "http://localhost:8001/api/qloo/recommendation-cities",
                    json={"itinerary_cities": itinerary_cities, "limit": 5},
                    timeout=10.0
                )
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail="Qloo failed")
                recommended_cities = response.json()

            prompt = f"""
                        Have the mindset of an expert trip advisor that knows all the activities and periodic events today, {today_date}.
                        The cities Qloo recommends {recommended_cities.get("recommended_cities")}, but choose any other city in the world if there is a better fit
                        User's preferences are: {user_preferences}
                        Qloo's recommendations are: {cultural_profile}

                        Return only this JSON format:
                        {{
                            "options": [
                                {{"id": "option_1", "name": "Relevant name for activity", "activity": "What to do", "location": "City,Country", "cultural_score": 0-100, "reasoning": "Reason why this activity is relevant"}},
                                {{"id": "option_2", "name": "Relevant name for activity", "activity": "What to do", "location": "City,Country", "cultural_score": 0-100, "reasoning": "Reason why this activity is relevant"}},
                                {{"id": "option_3", "name": "Relevant name for activity", "activity": "What to do", "location": "City,Country", "cultural_score": 0-100, "reasoning": "Reason why this activity is relevant"}}
                                {{"id": "option_4", "name": "Relevant name for activity", "activity": "What to do", "location": "City,Country", "cultural_score": 0-100, "reasoning": "Reason why this activity is relevant"}}
                                {{"id": "option_5", "name": "Relevant name for activity", "activity": "What to do", "location": "City,Country", "cultural_score": 0-100, "reasoning": "Reason why this activity is relevant"}}
                            ]
                        }}

                        RULES:
                        - The options must be relevant to the user personality reflected through Qloo recommendations
                        - The Qloo recommendations are just as valuable in selecting the most appropriate option
                        - The today date must be important for an activity in that city that the user would enjoy based on their taste
                        - Do not mention the Qloo recommendations as explicit from Qloo, instead treat them as if the user was the one who input them and maybe value them more, 
                        - Based on the User preferences make the option of activity as unique as possible. e.g. 'Because the user likes an X artist, he should listen to their music while visiting a location'
                        - Make the activity more descriptive and include elements and aspects from the whole 'user_preferences' categories to truly make it unique
                        - The activity description should be detailed and specific, including many elements of what the user actually likes or that are recommended by Qloo to them
                        - When reasoning, use second person addressing, as talking directly with the user
                        - The reasoning should be short and clear, not more than a sentence
                        - There must be 5 options, each following the same structure but different activities
                        - Prioritize options that meet multiple preferences criteria
                        - The option MUST happen today, on the specified date, otherwise it is not valid
                        - The most relevancy should be to the most important events happening today, {date.today()}
                        - Search for occasional events on that specific day on EventBride or the internet
                        - Choose the best activity options, based on the personality reflected through preferences from a specific entity or more
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