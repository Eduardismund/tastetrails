import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faMapLocationDot, faSpinner, faRoute } from "@fortawesome/free-solid-svg-icons";
import ActivitiesList from "../components/ActivitiesList.tsx";
import ActivityGenerator from "../components/ActivityGenerator.tsx";
import ActivityOptions from "../components/ActivityOptions.tsx";
import GenericForm from "../components/GenericForm.tsx";
import ItineraryList from "../components/ItineraryList.tsx";
import type {ActivityOption, CreateItineraryFormData, FormField} from "../types/interfaces.ts";
import type {ApiResponse, Itinerary} from "../types/interfaces.ts";
import './ItineraryPage.css';

const ItineraryPage: React.FC = () => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
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
            const response = await fetch(`/api/backend/itineraries/users/${userId}`);

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

    const handleActivityAdded = async () => {
        setActivityOptions([]);
        setTimeSlot({ start_time: '10:00', end_time: '12:00', date: '' });

        await loadItineraries();

        if (selectedItinerary) {
            try {
                const response = await fetch(`/api/backend/itineraries/${selectedItinerary.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setSelectedItinerary(data.data);
                }
            } catch (error) {
                console.error('Error refreshing selected itinerary:', error);
            }
        }
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

    const createItineraryFields: FormField[] = [
        {
            name: 'destination',
            type: 'text',
            label: 'Destination',
            placeholder: 'Enter destination city',
            required: true
        },
        {
            name: 'startDate',
            type: 'date',
            label: 'Start Date',
            placeholder: '',
            required: true
        },
        {
            name: 'endDate',
            type: 'date',
            label: 'End Date',
            placeholder: '',
            required: true
        }
    ];

    const checkCityExistence =  async(
        address: string
    ) => {
        if (!address) {
            return { exists: false, bounds: null, coordinates: null };
        }

        try{

            const isCityResponse = await fetch(`/api/ai/google-maps/is-city`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address: address })
            });

            if (!isCityResponse.ok) {
                throw new Error('Failed to generate activity options');
            }

            const response = await isCityResponse.json();

            if (response.success && response.city) {
                return {
                    exists: true,
                    bounds: response.bounds,
                    coordinates: response.coordinates
                };
            }
            return {
                exists: false,
                bounds: null,
                coordinates: null
            };

        } catch (error) {
            console.error('City validation error:', error);
            return {
                exists: false,
                bounds: null,
                coordinates: null
            };
        }
    };

    const handleCreateItinerary = async (formData: CreateItineraryFormData) => {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const cityCheck = await checkCityExistence(formData.destination);

        if (!cityCheck.exists) {
            throw new Error(`"${formData.destination}" is not a recognized city. Please enter a valid city name.`);
        }

        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
            throw new Error('Start date cannot be in the past');
        }

        if (endDate <= startDate) {
            throw new Error('End date must be after start date');
        }

        const response = await fetch(`/api/backend/itineraries/users/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                destination: formData.destination,
                coordinates: cityCheck.coordinates,
                bounds: cityCheck.bounds,
                startDate: formData.startDate,
                endDate: formData.endDate
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to create itinerary');
        }

        await loadItineraries();
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
                    <h1>TasteTrails <FontAwesomeIcon icon={faMapLocationDot} className="ml-3" /></h1>
                    <div></div>
                </header>
                <main className="simple-main common">
                    <div className="simple-feature-card loading-card">
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
                <h1>TasteTrails <FontAwesomeIcon icon={faMapLocationDot} className="ml-3" /></h1>
                <div></div>
            </header>

            <main className="itinerary-main">
                <aside className="itinerary-sidebar">
                    <ItineraryList
                        itineraries={itineraries}
                        selectedId={selectedItinerary?.id || null}
                        onSelect={handleItinerarySelect}
                        googleMapsApiKey={GOOGLE_MAPS_API_KEY}

                    />
                </aside>

                <div className="itinerary-content">
                    {error && (
                        <div className="simple-feature-card error-card">
                            <h4>Oops! Something went wrong</h4>
                            <p>{error}</p>
                        </div>
                    )}

                    {!selectedItinerary && (
                        <div className="simple-feature-card create-form-card">
                            <GenericForm<CreateItineraryFormData>
                                title="Create New Itinerary"
                                fields={createItineraryFields}
                                initialData={{ destination: '', startDate: '', endDate: '' }}
                                onSubmit={handleCreateItinerary}
                                submitButtonText="Create Itinerary"
                                loadingText="Creating Itinerary..."
                            />
                        </div>
                    )}

                    {!selectedItinerary && itineraries.length > 0 && (
                        <div className="no-selection">
                            <FontAwesomeIcon icon={faRoute} className="feature-icon" />
                            <h3>Select an itinerary</h3>
                            <p>Choose an itinerary from the sidebar to view details and manage activities</p>
                        </div>
                    )}

                    {selectedItinerary && (
                        <div className="details-container">
                            <ActivitiesList activities={selectedItinerary.activities || []} />

                            {userId && (
                                <ActivityGenerator
                                    itineraryStartDate={selectedItinerary.startDate}
                                    itineraryEndDate={selectedItinerary.endDate}
                                    itineraryDestination={selectedItinerary.destination}
                                    itineraryCoordinates={selectedItinerary.coordinates}
                                    userId={userId}
                                    itineraryId={selectedItinerary.id}
                                    timeSlot={timeSlot}
                                    selectedTheme={selectedTheme}
                                    onTimeSlotChange={handleTimeSlotChange}
                                    onThemeChange={handleThemeChange}
                                    onOptionsGenerated={handleOptionsGenerated}
                                    onError={handleError}
                                />
                            )}

                        </div>
                    )}
                </div>
            </main>
            {selectedItinerary && (
                <ActivityOptions
                    options={activityOptions}
                    itineraryId={selectedItinerary.id}
                    itineraryBounds={selectedItinerary.bounds}
                    googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                    selectedTheme={selectedTheme}
                    timeSlot={timeSlot}
                    onActivityAdded={handleActivityAdded}
                    onError={handleError}
                    onClearOptions={handleClearOptions}
                />
            )}
        </div>
    );
};

export default ItineraryPage;