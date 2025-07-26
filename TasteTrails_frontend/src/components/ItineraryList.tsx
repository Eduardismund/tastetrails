import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMapMarkerAlt, faCalendarAlt} from "@fortawesome/free-solid-svg-icons";
import type {ItineraryListProps } from '../types/interfaces';
import './ItineraryList.css';
import StreetView from "./StreetView.tsx";


const ItineraryList: React.FC<ItineraryListProps> = ({ itineraries, selectedId, onSelect, googleMapsApiKey  }) => {

    const selectedItinerary = itineraries.find(itinerary => itinerary.id === selectedId);

    const listClasses = `itinerary-list ${itineraries.length > 2 ? 'scrollable' : ''}`;



    return (
        <div className="itinerary-list-container">
            <div className="itinerary-list-header">
                <h4>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    Your Itineraries
                </h4>
            </div>

            <div className={listClasses}>
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
                                <span>{new Date(itinerary.startDate).toLocaleDateString()} to {new Date(itinerary.endDate).toLocaleDateString()}</span>

                            </div>
                            <div className="activity-count">
                                {itinerary.activities?.length || 0} activities
                            </div>
                        </div>
                    ))
                )}
            </div>
            {selectedItinerary && selectedItinerary.coordinates && (

                <>
                    <div className="itinerary-list-header">
                        <h4>
                            <FontAwesomeIcon icon={faMapMarkerAlt}/>
                            Map View
                        </h4>
                    </div>
                    <StreetView
                        lat={parseFloat(selectedItinerary.coordinates.split(',')[0])}
                        lng={parseFloat(selectedItinerary.coordinates.split(',')[1])}
                        bounds={selectedItinerary.bounds}
                        activities={selectedItinerary.activities}
                        width="100%"
                        height="300px"
                        apiKey={googleMapsApiKey}
                        className="itinerary-street-view"
                        mode="map"
                        view="itinerary"
                    />
                </>
            )}
        </div>
    );
};

export default ItineraryList;