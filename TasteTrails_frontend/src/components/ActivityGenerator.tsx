import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faSpinner } from "@fortawesome/free-solid-svg-icons";
import './ItineraryDetails.css';


interface ActivityGeneratorProps {
    itineraryStartDate: string;
    itineraryEndDate: string;
    itineraryDestination: string;
    userId: string;
    timeSlot: {
        start_time: string;
        end_time: string;
        date: string;
    };
    selectedTheme: string;
    onTimeSlotChange: (timeSlot: {
        start_time: string;
        end_time: string;
        date: string;
    }) => void;
    onThemeChange: (theme: string) => void;
    onOptionsGenerated: (options: ActivityOption[]) => void;
    onError: (error: string) => void;
}

interface ActivityOption {
    id: string;
    name: string;
    activity: string;
    location: string;
    cultural_score: number;
}

interface GenerateOptionsRequest {
    user_preferences: {
        artists?: string[];
        books?: string[];
        movies?: string[];
        activities?: string[];
    };
    city: string;
    start_time: string;
    end_time: string;
    date: string;
    theme: string;
}

const ActivityGenerator: React.FC<ActivityGeneratorProps> = ({
                                                                 itineraryStartDate,
                                                                 itineraryEndDate,
                                                                 itineraryDestination,
                                                                 userId,
                                                                 timeSlot,
                                                                 selectedTheme,
                                                                 onThemeChange,
                                                                 onTimeSlotChange,
                                                                 onOptionsGenerated,
                                                                 onError
                                                             }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateActivityOptions = async () => {
        setIsGenerating(true);
        onError(''); // Clear previous errors

        try {
            // First, get user's taste profile
            const tasteProfileResponse = await fetch(`http://localhost:8080/api/taste-profiles/users/${userId}`);

            if (!tasteProfileResponse.ok) {
                throw new Error('Failed to fetch taste profile');
            }

            const tasteProfileData = await tasteProfileResponse.json();
            const tasteProfile = tasteProfileData.data;

            const userPreferences: {
                artists?: string[];
                books?: string[];
                movies?: string[];
                activities?: string[];
            } = {};

            if (tasteProfile.musicPreferences?.artists) {
                userPreferences.artists = tasteProfile.musicPreferences.artists;
            }
            if (tasteProfile.moviePreferences?.movies) {
                userPreferences.movies = tasteProfile.moviePreferences.movies;
            }
            if (tasteProfile.activityPreferences?.activities) {
                userPreferences.activities = tasteProfile.activityPreferences.activities;
            }

            // Prepare request for Claude API
            const claudeRequest: GenerateOptionsRequest = {
                user_preferences: userPreferences,
                city: itineraryDestination,
                start_time: timeSlot.start_time,
                end_time: timeSlot.end_time,
                date: timeSlot.date,
                theme: selectedTheme
            };

            // Call Claude API
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

    return (
        <div className="simple-feature-card main-page activity-generator">
            <h4>
                <FontAwesomeIcon icon={faRobot} className="mr-2" />
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
                            <option value="Cultural Discovery">Cultural Discovery</option>
                            <option value="Social Experience">Social Experience</option>
                            <option value="Eating Experience">Eating Experience</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            id="date"
                            type="date"
                            value={timeSlot.date}
                            onChange={(e) => onTimeSlotChange({...timeSlot, date: e.target.value})}
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
                            onChange={(e) => onTimeSlotChange({...timeSlot, start_time: e.target.value})}
                            className="form-input"
                            disabled={isGenerating}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="end_time">End Time</label>
                        <input
                            id="end_time"
                            type="time"
                            value={timeSlot.end_time}
                            onChange={(e) => onTimeSlotChange({...timeSlot, end_time: e.target.value})}
                            className="form-input"
                            disabled={isGenerating}
                        />
                    </div>
                </div>

                <button
                    onClick={generateActivityOptions}
                    disabled={isGenerating || !timeSlot.date}
                    className="action-btn generate-btn"
                >
                    {isGenerating ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} className="fa-spin mr-2" />
                            Generating Options...
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faRobot} className="mr-2" />
                            Generate Activity Options
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ActivityGenerator;