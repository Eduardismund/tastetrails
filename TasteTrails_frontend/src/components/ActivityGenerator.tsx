import React, {useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRobot} from "@fortawesome/free-solid-svg-icons";
import type {
    ActivityGeneratorProps,
    ActivityOption, ActivityResponse,
    ApiResponse, GenerateOptionsRequest,
    TasteProfile,
    UserPreferences
} from "../types/interfaces.ts";

const ActivityGenerator: React.FC<ActivityGeneratorProps> = ({
                                                                 itineraryStartDate,
                                                                 itineraryEndDate,
                                                                 itineraryDestination,
                                                                 userId,
                                                                 itineraryId,
                                                                 timeSlot,
                                                                 selectedTheme,
                                                                 onThemeChange,
                                                                 onTimeSlotChange,
                                                                 onOptionsGenerated,
                                                                 onError
                                                             }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [timeConflict, setTimeConflict] = useState<string | null>(null);
    const [existingActivities, setExistingActivities] = useState<ActivityResponse[]>([]);

    const parseTime = (timeString: string): number => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    };


    const checkTimeSlotConflict = (
        newStartTime: string,
        newEndTime: string,
        newDate: string,
        activities: ActivityResponse[]
    ): string | null => {
        if (!newStartTime || !newEndTime || !newDate) {
            return null;
        }

        const newStart = parseTime(newStartTime);
        const newEnd = parseTime(newEndTime);

        if (newEnd <= newStart) {
            return "End time must be after start time";
        }

        const sameeDateActivities = activities.filter(activity =>
            activity.activityDate === newDate
        );

        for (const activity of sameeDateActivities) {
            const existingStart = parseTime(activity.startTime);
            const existingEnd = parseTime(activity.endTime);

            const hasOverlap = newStart < existingEnd && newEnd > existingStart;

            if (hasOverlap) {
                return `Time conflict with "${activity.title}" (${activity.startTime} - ${activity.endTime})`;
            }
        }

        return null;
    };

    const getUserTasteProfile = async (userId: string): Promise<UserPreferences> => {
        const tasteProfileResponse = await fetch(`http://localhost:8080/api/taste-profiles/users/${userId}`)

        if (!tasteProfileResponse.ok) {
            throw new Error('Failed to fetch taste profile');
        }

        const tasteProfileData = await tasteProfileResponse.json();
        const tasteProfile: TasteProfile = tasteProfileData.data;

        const userPreferences: UserPreferences = {}

        if (tasteProfile.artistPreferences?.artists) {
            userPreferences.artists = tasteProfile.artistPreferences.artists
        }
        if (tasteProfile.moviePreferences?.movies) {
            userPreferences.movies = tasteProfile.moviePreferences.movies
        }
        if (tasteProfile.bookPreferences?.books) {
            userPreferences.books = tasteProfile.bookPreferences.books
        }

        return userPreferences
    }

    const getExistingActivities = async (itineraryId: string): Promise<ActivityResponse[]> => {
        const activitiesResponse = await fetch(`http://localhost:8080/api/itineraries/${itineraryId}/activities`)

        if (!activitiesResponse.ok) {
            throw new Error('Failed to fetch existing activities')
        }

        const activitiesData: ApiResponse<ActivityResponse[]> = await activitiesResponse.json();
        return activitiesData.data;
    }

    const handleTimeSlotChange = (newTimeSlot: typeof timeSlot) => {
        onTimeSlotChange(newTimeSlot);

        const conflict = checkTimeSlotConflict(
            newTimeSlot.start_time,
            newTimeSlot.end_time,
            newTimeSlot.date,
            existingActivities
        );
        setTimeConflict(conflict);
    };

    const generateActivityOptions = async () => {
        setIsGenerating(true);
        onError('');
        setTimeConflict(null);

        try {
            const activities = await getExistingActivities(itineraryId);
            setExistingActivities(activities);

            const conflict = checkTimeSlotConflict(
                timeSlot.start_time,
                timeSlot.end_time,
                timeSlot.date,
                activities
            );

            if (conflict) {
                setTimeConflict(conflict);
                throw new Error(conflict);
            }

            const userPreferences = await getUserTasteProfile(userId);

            const existingActivitiesForClaude: ActivityOption[] = activities.map((activity) => ({
                id: activity.id,
                name: activity.title,
                activity: activity.description,
                location: activity.address,
                start_time: activity.startTime,
                end_time: activity.endTime,
                activity_date: activity.activityDate
            }));

            const claudeRequest: GenerateOptionsRequest = {
                user_preferences: userPreferences,
                city: itineraryDestination,
                start_time: timeSlot.start_time,
                end_time: timeSlot.end_time,
                date: timeSlot.date,
                theme: selectedTheme,
                existing_activities: existingActivitiesForClaude
            };

            const claudeResponse = await fetch('http://localhost:8001/api/claude/generate-options', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(claudeRequest)
            });

            if (!claudeResponse.ok) {
                throw new Error('Failed to generate activity options');
            }

            const claudeData = await claudeResponse.json();

            if (claudeData.success && claudeData.options) {
                onOptionsGenerated(claudeData.options);
            } else {
                throw new Error('No options generated');
            }

        } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to generate options');
        } finally {
            setIsGenerating(false);
        }
    };

    const hasTimeIssue = Boolean(timeConflict) || !timeSlot.date || !timeSlot.start_time || !timeSlot.end_time;
    return (
        <div className="simple-feature-card activity-generator">
            <h4>
                <FontAwesomeIcon icon={faRobot} />
                AI Activity Generator
            </h4>

            <div className="generator-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="theme">Activity Theme</label>
                        <select
                            id="theme"
                            value={selectedTheme}
                            onChange={(e) => onThemeChange(e.target.value)}
                            className="form-select"
                            disabled={isGenerating}
                        >
                            <option value="Cultural Discovery">🎭 Cultural Discovery</option>
                            <option value="Social Experience">👥 Social Experience</option>
                            <option value="Eating Experience">🍽️ Eating Experience</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            id="date"
                            type="date"
                            value={timeSlot.date}
                            onChange={(e) => handleTimeSlotChange({...timeSlot, date: e.target.value})}
                            min={itineraryStartDate}
                            max={itineraryEndDate}
                            className="form-input"
                            disabled={isGenerating}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="start_time">Start Time</label>
                        <input
                            id="start_time"
                            type="time"
                            value={timeSlot.start_time}
                            onChange={(e) => handleTimeSlotChange({...timeSlot, start_time: e.target.value})}
                            className={`form-input ${timeConflict ? 'error' : ''}`}
                            disabled={isGenerating}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="end_time">End Time</label>
                        <input
                            id="end_time"
                            type="time"
                            value={timeSlot.end_time}
                            onChange={(e) => handleTimeSlotChange({...timeSlot, end_time: e.target.value})}
                            className={`form-input ${timeConflict ? 'error' : ''}`}
                            disabled={isGenerating}
                        />
                    </div>
                </div>


                <button
                    onClick={generateActivityOptions}
                    disabled={isGenerating || hasTimeIssue}
                    className={`generate-button submit-btn ${isGenerating ? 'loading' : ''} ${hasTimeIssue ? 'disabled' : ''}`}
                >
                    {isGenerating ? (
                        'Generating...'
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faRobot} />
                            Generate Activity Options
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ActivityGenerator;