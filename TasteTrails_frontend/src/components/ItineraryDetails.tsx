import type {Itinerary} from "../types/interfaces.ts";
import React, { useState } from "react";
// Add this to your imports at the top:
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarAlt,
    faMapMarkerAlt,
    faPlus,
    faSpinner,
    faClock,
    faTheaterMasks,
    faUsers,
    faUtensils,
    faInfoCircle,
    faRobot,
    faStar,
    faLocationDot
} from "@fortawesome/free-solid-svg-icons";
import './ItineraryDetails.css';

interface ItineraryDetailsProps {
    itinerary: Itinerary | null;
    onActivityCreated: () => void;
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

const ItineraryDetails: React.FC<ItineraryDetailsProps> = ({ itinerary, onActivityCreated }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { userId } = useParams<{ userId: string }>();
    const [isAddingActivity, setIsAddingActivity] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activityOptions, setActivityOptions] = useState<ActivityOption[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<string>('Cultural Discovery');
    const [timeSlot, setTimeSlot] = useState({
        start_time: '10:00',
        end_time: '15:00',
        date: ''
    });

    if (!itinerary) {
        return (
            <div className="simple-feature-card main-page no-selection">
                <FontAwesomeIcon icon={faInfoCircle} className="feature-icon" />
                <h3>Select an itinerary</h3>
                <p>Choose an itinerary from the sidebar to view details and manage activities</p>
            </div>
        );
    }

    const generateActivityOptions = async () => {
        setIsGenerating(true);
        setError(null);
        setActivityOptions([]);

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
                city: itinerary.destination,
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
                setActivityOptions(claudeData.options);
            } else {
                throw new Error('No options generated');
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate options');
        } finally {
            setIsGenerating(false);
        }
    };

    const addActivityToItinerary = async (option: ActivityOption) => {
        setIsAddingActivity(true);
        setError(null);

        try {
            const activityRequest = {
                title: option.name,
                description: option.activity,
                startTime: `${timeSlot.date}T${timeSlot.start_time}:00`,
                endTime: `${timeSlot.date}T${timeSlot.end_time}:00`,
                activityDate: timeSlot.date,
                theme: getThemeFromName(selectedTheme),
                address: option.location
            };

            const response = await fetch(`http://localhost:8080/api/itineraries/${itinerary.id}/activities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activityRequest)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add activity');
            }

            // Clear options and refresh itinerary
            setActivityOptions([]);
            setTimeSlot({ start_time: '10:00', end_time: '15:00', date: '' });
            onActivityCreated();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add activity');
        } finally {
            setIsAddingActivity(false);
        }
    };

    const getThemeFromName = (themeName: string): 'CULTURAL_ACTIVITY' | 'SOCIAL_ACTIVITY' | 'CULINARY_ACTIVITY' => {
        switch (themeName) {
            case 'Cultural Discovery': return 'CULTURAL_ACTIVITY';
            case 'Social Experience': return 'SOCIAL_ACTIVITY';
            case 'Eating Experience': return 'CULINARY_ACTIVITY';
            default: return 'CULTURAL_ACTIVITY';
        }
    };

    const getThemeIcon = (theme: string) => {
        switch (theme) {
            case 'CULTURAL_ACTIVITY': return faTheaterMasks;
            case 'SOCIAL_ACTIVITY': return faUsers;
            case 'CULINARY_ACTIVITY': return faUtensils;
            default: return faInfoCircle;
        }
    };

    const getThemeColor = (theme: string) => {
        switch (theme) {
            case 'CULTURAL_ACTIVITY': return '#9b59b6';
            case 'SOCIAL_ACTIVITY': return '#3498db';
            case 'CULINARY_ACTIVITY': return '#e67e22';
            default: return '#95a5a6';
        }
    };

    return (
        <div className="itinerary-details">

            {/* Activities Section */}
            <div className="simple-feature-card main-page activities-section">
                <h4>
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    Activities ({itinerary.activities?.length || 0})
                </h4>

                {!itinerary.activities || itinerary.activities.length === 0 ? (
                    <div className="empty-activities">
                        <FontAwesomeIcon icon={faInfoCircle} className="empty-icon" />
                        <p>No activities planned yet</p>
                        <small>Generate AI-powered activity suggestions using the form below</small>
                    </div>
                ) : (
                    <div className="activities-list">
                        {itinerary.activities.map((activity) => (
                            <div key={activity.id} className="activity-card">
                                <div className="activity-header">
                                    <div className="activity-title">
                                        <FontAwesomeIcon
                                            icon={getThemeIcon(activity.theme || 'CULTURAL_ACTIVITY')}
                                            className="activity-icon"
                                            style={{ color: getThemeColor(activity.theme || 'CULTURAL_ACTIVITY') }}
                                        />
                                        <h5>{activity.title}</h5>
                                    </div>
                                    <span className="activity-theme">
                                        {activity.theme?.replace('_', ' ') || 'Unknown'}
                                    </span>
                                </div>
                                <p className="activity-description">{activity.description}</p>
                                <div className="activity-details">
                                    <div className="activity-detail">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                                        {new Date(activity.activityDate).toLocaleDateString()}
                                    </div>
                                    <div className="activity-detail">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                                        {activity.address}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Activity Generator */}
            <div className="simple-feature-card main-page activity-generator">
                <h4>
                    <FontAwesomeIcon icon={faRobot} className="mr-2" />
                    AI Activity Generator
                </h4>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                <div className="generator-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="theme">Activity Theme</label>
                            <select
                                id="theme"
                                value={selectedTheme}
                                onChange={(e) => setSelectedTheme(e.target.value)}
                                className="form-select"
                                disabled={isGenerating || isAddingActivity}
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
                                onChange={(e) => setTimeSlot({...timeSlot, date: e.target.value})}
                                min={itinerary.startDate}
                                max={itinerary.endDate}
                                className="form-input"
                                disabled={isGenerating || isAddingActivity}
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
                                onChange={(e) => setTimeSlot({...timeSlot, start_time: e.target.value})}
                                className="form-input"
                                disabled={isGenerating || isAddingActivity}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="end_time">End Time</label>
                            <input
                                id="end_time"
                                type="time"
                                value={timeSlot.end_time}
                                onChange={(e) => setTimeSlot({...timeSlot, end_time: e.target.value})}
                                className="form-input"
                                disabled={isGenerating || isAddingActivity}
                            />
                        </div>
                    </div>

                    <button
                        onClick={generateActivityOptions}
                        disabled={isGenerating || isAddingActivity || !timeSlot.date}
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

            {/* Activity Options */}
            {activityOptions.length > 0 && (
                <div className="simple-feature-card main-page activity-options">
                    <h4>
                        <FontAwesomeIcon icon={faStar} className="mr-2" />
                        Choose Your Activity
                    </h4>

                    <div className="options-grid">
                        {activityOptions.map((option) => (
                            <div key={option.id} className="option-card">
                                <div className="option-header">
                                    <h5>{option.name}</h5>
                                    <div className="cultural-score">
                                        <FontAwesomeIcon icon={faStar} className="mr-1" />
                                        {option.cultural_score}
                                    </div>
                                </div>
                                <p className="option-description">{option.activity}</p>
                                <div className="option-location">
                                    <FontAwesomeIcon icon={faLocationDot} className="mr-2" />
                                    {option.location}
                                </div>
                                <button
                                    onClick={() => addActivityToItinerary(option)}
                                    disabled={isAddingActivity}
                                    className="action-btn option-btn"
                                >
                                    {isAddingActivity ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="fa-spin mr-2" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                            Add to Itinerary
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItineraryDetails;