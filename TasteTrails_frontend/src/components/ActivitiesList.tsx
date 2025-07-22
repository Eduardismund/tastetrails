import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarAlt,
    faMapMarkerAlt,
    faClock,
    faTheaterMasks,
    faUsers,
    faUtensils,
    faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import type {ActivitiesListProps} from "../types/interfaces";
import './ItineraryDetails.css';


const ActivitiesList: React.FC<ActivitiesListProps> = ({ activities }) => {
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
        <div className="simple-feature-card activities-section">
            <h4>
                <FontAwesomeIcon icon={faClock} />
                Activities ({activities.length})
            </h4>

            {activities.length === 0 ? (
                <div className="empty-activities">
                    <FontAwesomeIcon icon={faInfoCircle} className="empty-icon" />
                    <p>No activities planned yet</p>
                    <small>Generate AI-powered activity suggestions using the form below</small>
                </div>
            ) : (
                <div className="activities-list">
                    {activities.map((activity) => (
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
                            <p className="activity-description">{activity.reasoning}</p>
                            <div className="activity-details">
                                <div className="activity-detail">
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                    {new Date(activity.activityDate).toLocaleDateString()} from {activity.startTime} to {activity.endTime}
                                </div>
                                <div className="activity-detail">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                    {activity.address}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivitiesList;