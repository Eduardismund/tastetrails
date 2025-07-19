import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import type {ItineraryListProps } from '../types/interfaces';
import './ItineraryList.css';

const ItineraryList: React.FC<ItineraryListProps> = ({ itineraries, selectedId, onSelect }) => {
    return (
        <div className="itinerary-list-container">
            <div className="itinerary-list-header">
                <h4>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                    Your Itineraries
                </h4>
            </div>

            <div className="itinerary-list">
                {itineraries.length === 0 ? (
                    <div className="empty-state">
                        <FontAwesomeIcon icon={faCalendarAlt} className="empty-icon" />
                        <p>No itineraries yet</p>
                        <small>Create your first itinerary to get started!</small>
                    </div>
                ) : (
                    itineraries.map((itinerary) => (
                        <div
                            key={itinerary.id}
                            onClick={() => onSelect(itinerary)}
                            className={`itinerary-item ${selectedId === itinerary.id ? 'selected' : ''}`}
                        >
                            <div className="itinerary-destination">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                                <span>{itinerary.destination}</span>
                            </div>
                            <div className="itinerary-dates">
                                <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
                                <span>{new Date(itinerary.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="activity-count">
                                {itinerary.activities?.length || 0} activities
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ItineraryList;