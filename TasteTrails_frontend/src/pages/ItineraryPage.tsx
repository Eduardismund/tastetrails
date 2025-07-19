import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faMapLocationDot, faSpinner, faRoute } from "@fortawesome/free-solid-svg-icons";
import ActivitiesList from "../components/ActivitiesList.tsx";
import ActivityGenerator from "../components/ActivityGenerator.tsx";
import ActivityOptions from "../components/ActivityOptions.tsx";
import CreateForm from "../components/CreateForm.tsx";
import ItineraryList from "../components/ItineraryList.tsx";
import type {ApiResponse, Itinerary} from "../types/interfaces.ts";
import './ItineraryPage.css';

interface ActivityOption {
    id: string;
    name: string;
    activity: string;
    location: string;
    cultural_score: number;
}

const ItineraryPage: React.FC = () => {
    const navigate = useNavigate();
    const {userId} = useParams<{userId: string}>();
    const [itineraries, setItineraries] = useState<Itinerary[]>([]);
    const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activityOptions, setActivityOptions] = useState<ActivityOption[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<string>('Cultural Discovery');
    const [timeSlot, setTimeSlot] = useState({
        start_time: '10:00',
        end_time: '15:00',
        date: ''
    });

    useEffect(() => {
        if (!userId) {
            navigate('/register');
            return;
        }
        loadItineraries();
    }, [userId, navigate]);

    const loadItineraries = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/itineraries/users/${userId}`);

            if (response.ok) {
                const data: ApiResponse<Itinerary[]> = await response.json();
                setItineraries(data.data || []);
            } else if (response.status === 404) {
                setItineraries([]);
            } else {
                setError('Failed to load itineraries');
            }
        } catch {
            setError('Network error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleItinerarySelect = (itinerary: Itinerary) => {
        setSelectedItinerary(selectedItinerary?.id === itinerary.id ? null : itinerary);
        // Clear options when switching itineraries
        setActivityOptions([]);
        setTimeSlot({ start_time: '10:00', end_time: '15:00', date: '' });
    };

    const handleOptionsGenerated = (options: ActivityOption[]) => {
        setActivityOptions(options);
        setError(null);
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    const handleActivityAdded = () => {
        setActivityOptions([]);
        setTimeSlot({ start_time: '10:00', end_time: '15:00', date: '' });
        loadItineraries();
    };

    const handleClearOptions = () => {
        setActivityOptions([]);
    };

    const handleTimeSlotChange = (newTimeSlot: {
        start_time: string;
        end_time: string;
        date: string;
    }) => {
        setTimeSlot(newTimeSlot);
    }

    const handleThemeChange = (theme: string) => {
        setSelectedTheme(theme);
    };

    if (isLoading) {
        return (
            <div className="page-style">
                <div className="fixed-background"></div>
                <header className="common-header app">
                    <button className="header-button left-button" onClick={() => navigate(`/dashboard/${userId}`)}>
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Back
                    </button>
                    <h1>TasteTrails <FontAwesomeIcon icon={faMapLocationDot} /></h1>
                    <div></div>
                </header>
                <main className="simple-main common">
                    <div className="simple-feature-card auth-page loading-card">
                        <FontAwesomeIcon icon={faSpinner} className="feature-icon fa-spin" />
                        <h3>Loading itineraries...</h3>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="page-style">
            <div className="fixed-background"></div>

            <header className="common-header app">
                <button className="header-button left-button" onClick={() => navigate(`/dashboard/${userId}`)}>
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Back to Dashboard
                </button>
                <h1>TasteTrails <FontAwesomeIcon icon={faMapLocationDot} /></h1>
                <div></div>
            </header>

            <main className="itinerary-main">
                {/* Left Sidebar - Itinerary List */}
                <aside className="itinerary-sidebar">
                    <ItineraryList
                        itineraries={itineraries}
                        selectedId={selectedItinerary?.id || null}
                        onSelect={handleItinerarySelect}
                    />
                </aside>

                {/* Right Content Area */}
                <div className="itinerary-content">
                    <div className="container">

                        {error && (
                            <div className="simple-feature-card error-card">
                                <h4>Oops! Something went wrong</h4>
                                <p>{error}</p>
                            </div>
                        )}

                        {!selectedItinerary && (<div className="simple-feature-card main-page create-form-card">
                            <CreateForm userId={userId!} onCreated={loadItineraries}/>
                        </div>)}


                        {/* Activities and Generator - Only show if itinerary is selected */}
                        {selectedItinerary && (
                            <div className="details-container">
                                {/* Activities List */}
                                <ActivitiesList activities={selectedItinerary.activities || []} />

                                {/* Activity Generator */}
                                {userId && (
                                    <ActivityGenerator
                                        itineraryStartDate={selectedItinerary.startDate}
                                        itineraryEndDate={selectedItinerary.endDate}
                                        itineraryDestination={selectedItinerary.destination}
                                        userId={userId}
                                        timeSlot={timeSlot}
                                        selectedTheme={selectedTheme}
                                        onTimeSlotChange={handleTimeSlotChange}
                                        onThemeChange={handleThemeChange}
                                        onOptionsGenerated={handleOptionsGenerated}
                                        onError={handleError}
                                    />
                                )}

                                {/* Activity Options */}
                                <ActivityOptions
                                    options={activityOptions}
                                    itineraryId={selectedItinerary.id}
                                    selectedTheme={selectedTheme}
                                    timeSlot={timeSlot}
                                    onActivityAdded={handleActivityAdded}
                                    onError={handleError}
                                    onClearOptions={handleClearOptions}
                                />
                            </div>
                        )}

                        {/* No Selection Message */}
                        {!selectedItinerary && (
                            <div className="simple-feature-card main-page no-selection">
                                <FontAwesomeIcon icon={faRoute} className="feature-icon" />
                                <h3>Select an itinerary</h3>
                                <p>Choose an itinerary from the sidebar to view details and manage activities</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ItineraryPage;