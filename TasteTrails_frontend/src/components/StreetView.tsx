import React, {useEffect, useRef, useState} from "react";
import type {StreetViewProps} from "../types/interfaces.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMap, faStreetView} from "@fortawesome/free-solid-svg-icons";

declare global {
    interface Window {
        google: any;
        initMap: () => void;
        googleMapsLoaded: boolean;
    }
}

const StreetView: React.FC<StreetViewProps> = ({
                                                   lat = 40.720032,
                                                   lng = -73.988354,
                                                   bounds,
                                                   activities,
                                                   heading = 151.78,
                                                   pitch = -0.76,
                                                   zoom = 1,
                                                   width = '100%',
                                                   height = '400px',
                                                   apiKey,
                                                   className = "",
                                                   mode = 'map',
                                                   view
                                               }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const streetViewRef = useRef<any>(null);
    const [currentMode, setCurrentMode] = useState<'map' | 'streetview'>(mode);

    useEffect(() => {
        const loadGoogleMapsScript = () => {
            if (window.google?.maps?.Map) {
                initializeMap();
                return;
            }

            const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
            if (existingScript) {
                existingScript.addEventListener('load', () => {
                    setTimeout(initializeMap, 500);
                });
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
            script.onload = () => {
                setTimeout(initializeMap, 500);
            };
            script.onerror = () => {
                console.error('Failed to load Google Maps API');
            };

            document.head.appendChild(script);
        };

        const initializeMap = () => {
            if (!mapRef.current || !window.google?.maps?.Map) {
                console.warn('Google Maps not ready yet');
                return;
            }

            const center = {lat, lng};

            if (currentMode === 'map') {
                mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                    center,
                    zoom: zoom || 14,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: false,
                    scaleControl: false,
                    rotateControl: false,
                    panControl: false,
                    gestureHandling: 'greedy',
                    disableDefaultUI: true,
                });

                if(view && view === "options"){
                    new window.google.maps.Marker({
                        position: { lat: lat, lng: lng },
                        map: mapInstanceRef.current,
                    })
                }

                if(activities && activities.length > 0){
                    activities.forEach((activity, index) => {
                        if(activity.coordinates){
                            try{
                                const [activityLat, activityLng] = activity.coordinates.split(',').map(Number)
                                if(!isNaN(activityLat) && !isNaN(activityLng)){
                                    new window.google.maps.Marker({
                                        position: { lat: activityLat, lng: activityLng },
                                        map: mapInstanceRef.current,
                                        title: activity.title || `Activity ${index + 1}`,
                                        label: (index + 1).toString(),
                                    });
                                }

                            } catch (error) {
                                console.warn(`Error creating marker for activity ${index + 1}:`, error);
                            }
                        }
                    })
                }

                if (bounds && bounds.length === 2) {
                    try {
                        const [neLat, neLng] = bounds[0].split(',').map(Number);
                        const [swLat, swLng] = bounds[1].split(',').map(Number);

                        const googleBounds = new window.google.maps.LatLngBounds(
                            new window.google.maps.LatLng(swLat, swLng),
                            new window.google.maps.LatLng(neLat, neLng)
                        );

                        mapInstanceRef.current.fitBounds(googleBounds);

                    } catch (error) {
                        console.warn('Error applying bounds:', error);
                    }
                }

            } else {
                // Street View mode
                streetViewRef.current = new window.google.maps.StreetViewPanorama(
                    mapRef.current,
                    {
                        position: center,
                        pov: { heading, pitch, zoom },
                        visible: true,
                        addressControl: false,
                        linksControl: false,
                        panControl: false,
                        zoomControl: false,
                        fullscreenControl: false,
                        motionTracking: false,
                        motionTrackingControl: false,
                        disableDefaultUI: true,

                    }
                );
            }
        };

        loadGoogleMapsScript();
    }, [lat, lng, bounds, activities, heading, pitch, zoom, apiKey, currentMode]);

    const toggleMode = () => {
        setCurrentMode(prev => prev === 'map' ? 'streetview' : 'map');
    };

    return (
        <div className={`${className}`}>
            <button
                className="action-btn btn-outline map-view-button"
                onClick={toggleMode}
                title={`Switch to ${currentMode === 'map' ? 'Street View' : 'Map View'}`}
            >
                <FontAwesomeIcon
                    icon={currentMode === 'map' ? faStreetView : faMap}
                    className="mr-2"
                />
                {currentMode === 'map' ? 'Street View' : 'Map View'}
            </button>
            <div
                ref={mapRef}
                style={{
                    width,
                    height,
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                }}
            />
        </div>
    );
};

export default StreetView;