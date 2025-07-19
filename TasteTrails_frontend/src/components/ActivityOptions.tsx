import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faLocationDot, faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import './ItineraryDetails.css';


interface ActivityOption {
    id: string;
    name: string;
    activity: string;
    location: string;
    cultural_score: number;
}

interface ActivityOptionsProps {
    options: ActivityOption[];
    itineraryId: string;
    selectedTheme: string;
    timeSlot: {
        start_time: string;
        end_time: string;
        date: string;
    };
    onActivityAdded: () => void;
    onError: (error: string) => void;
    onClearOptions: () => void;
}

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
        onError(''); // Clear previous errors

        try {
            // Validate required fields
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
                address: option.location
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

            // Clear options and refresh itinerary
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
        <div className="simple-feature-card main-page activity-options">
            <h4>
                <FontAwesomeIcon icon={faStar} className="mr-2" />
                Choose Your Activity
            </h4>

            <div className="options-grid">
                {options.map((option) => (
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
    );
};

export default ActivityOptions;