import json
from datetime import datetime, date

from fastapi import HTTPException

from app.clients.claude_client import claude_client
from app.services.google_maps_service import google_maps_service
from app.services.qloo_service import qloo_service


class ClaudeService:
    """
    Claude service - handles business logic for itinerary generation
    """

    def __init__(self):
        self.client = claude_client


    async def generate_activity(self, user_preferences, city, start_time, end_time, activity_date, theme, existing_activities):
        """Generate a set of proposed activities based on user's preferences"""
        try:
            cultural_profile = await qloo_service.get_recommendations(user_preferences, 5)

            if not cultural_profile.get("success"):
                raise HTTPException(status_code=500, detail="Qloo failed")

            nearby_venues = await google_maps_service.find_venues_near_location(city)

            if not cultural_profile.get("success"):
                raise HTTPException(status_code=500, detail="Google Maps failed")

            target_date = datetime.strptime(activity_date, "%Y-%m-%d").date()

            today = date.today()

            weather_info = await google_maps_service.get_weather_forecast_for_location(city, (target_date - today).days)

            if not weather_info.get("success"):
                raise HTTPException(status_code=500, detail="Google Maps failed")


            air_quality_info = await google_maps_service.get_hourly_air_quality_range_for_location(city, start_time, end_time, str(target_date))

            if not air_quality_info.get("success"):
                raise HTTPException(status_code=500, detail="Google Maps failed")

            pollen_info = await google_maps_service.get_pollen_forecast_for_location(city, str(target_date))

            if not pollen_info.get("success"):
                raise HTTPException(status_code=500, detail="Google Maps failed")


            prompt = f"""
                        Have the mindset of an expert trip advisor for {theme} that knows all the activities and periodic events in the city {city}, between the time period: {start_time} to {end_time} on date {date}.
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
                                {{"id": "option_1", "name": "Relevant name for activity", "activity": "What to do", "location": "Where", "cultural_score": 0-100, "reasoning": "Reason why this activity is relevant", "coordinates": "Best coordinates to see the location", "fov": "int", "heading": "int", "pitch"}},
                                {{"id": "option_2", "name": "Relevant name for activity", "activity": "What to do", "location": "Where", "cultural_score": 0-100, "reasoning": "Reason why this activity is relevant", "coordinates": "Best coordinates to see the location", "fov": "int", "heading": "int", "pitch"}},
                                {{"id": "option_3", "name": "Relevant name for activity", "activity": "What to do", "location": "Where", "cultural_score": 0-100, "reasoning": "Reason why this activity is relevant", "coordinates": "Best coordinates to see the location", "fov": "int", "heading": "int", "pitch"}}
                            ]
                        }}

                        RULES:
                        - The coordinates, fov, heading and picth must be the best in order to fully put in advantage that place, meaning the most important angle and frame of that place from outside to inside
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
            return {"success" : False, "error" : str(e)}



    async def generate_options_today(self, user_preferences, itinerary_cities):
        try:
            cultural_profile = await qloo_service.get_recommendations(user_preferences, 5)

            if not cultural_profile.get("success"):
                raise HTTPException(status_code=500, detail="Qloo failed")

            recommended_cities = await qloo_service.get_city_recommendations(itinerary_cities, 3)

            if not recommended_cities.get("success"):
                raise HTTPException(status_code=500, detail="Qloo failed")

            prompt = f"""
                        Have the mindset of an expert trip advisor that knows all the activities and periodic events today, {date.today()}.
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