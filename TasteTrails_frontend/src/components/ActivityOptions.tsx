import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faLocationDot} from "@fortawesome/free-solid-svg-icons";
import type {ActivityOption, ActivityOptionsProps} from "../types/interfaces.ts";

const ActivityOptions: React.FC<ActivityOptionsProps> = ({
                                                             options,
                                                             itineraryId,
                                                             selectedTheme,
                                                             timeSlot,
                                                             onActivityAdded,
                                                             onError,
                                                             onClearOptions
                                                         }) => {
    const [isAddingActivity, setIsAddingActivity] = useState(false);

    const getThemeFromName = (themeName: string): 'CULTURAL_ACTIVITY' | 'SOCIAL_ACTIVITY' | 'CULINARY_ACTIVITY' => {
        switch (themeName) {
            case 'Cultural Discovery': return 'CULTURAL_ACTIVITY';
            case 'Social Experience': return 'SOCIAL_ACTIVITY';
            case 'Eating Experience': return 'CULINARY_ACTIVITY';
            default: return 'CULTURAL_ACTIVITY';
        }
    };

    const addActivityToItinerary = async (option: ActivityOption) => {
        setIsAddingActivity(true);
        onError('');

        try {
            if (!timeSlot.date) {
                throw new Error('Date is required');
            }

            const activityRequest = {
                title: option.name,
                description: option.activity,
                startTime: `${timeSlot.date}T${timeSlot.start_time}:00`,
                endTime: `${timeSlot.date}T${timeSlot.end_time}:00`,
                activityDate: timeSlot.date,
                theme: getThemeFromName(selectedTheme),
                address: option.location,
                reasoning: option.reasoning
            };

            console.log('Sending activity request:', activityRequest); // Debug log

            const response = await fetch(`http://localhost:8080/api/itineraries/${itineraryId}/activities`, {
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

            onClearOptions();
            onActivityAdded();

        } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to add activity');
        } finally {
            setIsAddingActivity(false);
        }
    };

    if (options.length === 0) {
        return null;
    }

    return (
        <div className="simple-feature-card activity-options">
            <h4>
                <FontAwesomeIcon icon={faStar} />
                Choose Your Activity
            </h4>

            <div className="options-row">
                {options.slice(0, 3).map((option) => (
                    <div key={option.id} className="option-card">
                        <div className="option-header">
                            <h5>{option.name}</h5>
                            <div className="cultural-score">
                                <FontAwesomeIcon icon={faStar} />
                                {option.cultural_score}
                            </div>
                        </div>
                        <p className="option-description">{option.activity}</p>
                        <p className="option-description">{option.reasoning}</p>
                        <div className="option-location">
                            <FontAwesomeIcon icon={faLocationDot} />
                            {option.location}
                        </div>
                        <button
                            onClick={() => addActivityToItinerary(option)}
                            disabled={isAddingActivity}
                            className={`submit-btn ${isAddingActivity ? 'loading' : ''}`}
                        >
                            {isAddingActivity ? 'Adding...' : 'Add to Itinerary'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityOptions;