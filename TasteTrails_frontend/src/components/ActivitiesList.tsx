import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarAlt,
    faMapMarkerAlt,
    faClock,
    faTheaterMasks,
    faUsers,
    faUtensils,
    faInfoCircle,
    faChevronLeft,
    faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import type {ActivitiesListProps} from "../types/interfaces";
import './ItineraryDetails.css';

const ActivitiesList: React.FC<ActivitiesListProps> = ({ activities }) => {
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

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

    const goToPrevious = () => {
        setCurrentActivityIndex(prev =>
            prev === 0 ? activities.length - 1 : prev - 1
        );
    };

    const goToNext = () => {
        setCurrentActivityIndex(prev =>
            prev === activities.length - 1 ? 0 : prev + 1
        );
    };

    if (activities.length === 0) {
        return (
            <div className="simple-feature-card activities-section">
                <h4>
                    <FontAwesomeIcon icon={faClock} />
                    Activities (0)
                </h4>
                <div className="empty-activities">
                    <FontAwesomeIcon icon={faInfoCircle} className="empty-icon" />
                    <p>No activities planned yet</p>
                    <small>Generate AI-powered activity suggestions using the form below</small>
                </div>
            </div>
        );
    }

    const currentActivity = activities[currentActivityIndex];

    return (
        <div className="simple-feature-card activities-section">
            <h4>
                <FontAwesomeIcon icon={faClock} />
                Activities ({activities.length})
            </h4>

            <div className="activities-list">
                <div className="activity-card">
                    <div className="activity-header">
                        <div className="activity-title">
                            <FontAwesomeIcon
                                icon={getThemeIcon(currentActivity.theme || 'CULTURAL_ACTIVITY')}
                                className="activity-icon"
                                style={{ color: getThemeColor(currentActivity.theme || 'CULTURAL_ACTIVITY') }}
                            />
                            <h5>{currentActivity.title}</h5>
                        </div>
                        <span className="activity-theme">
                            {currentActivity.theme?.replace('_', ' ') || 'Unknown'}
                        </span>
                    </div>
                    <p className="activity-description">{currentActivity.description}</p>
                    <p className="activity-description">{currentActivity.reasoning}</p>
                    <div className="activity-details">
                        <div className="activity-detail">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            {new Date(currentActivity.activityDate).toLocaleDateString()} from {currentActivity.startTime} to {currentActivity.endTime}
                        </div>
                        <div className="activity-detail">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            {currentActivity.address}
                        </div>
                    </div>
                </div>
            </div>

            {activities.length > 1 && (
                <div className="activity-navigation">
                    <button onClick={goToPrevious} className="action-btn btn-outline">
                        <FontAwesomeIcon icon={faChevronLeft} />
                        Previous
                    </button>
                    <span>{currentActivityIndex + 1} of {activities.length}</span>
                    <button onClick={goToNext} className="action-btn btn-outline">
                        Next
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivitiesList;