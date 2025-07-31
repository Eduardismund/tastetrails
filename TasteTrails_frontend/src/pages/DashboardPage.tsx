import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMapLocationDot,
    faUser,
    faRoute,
    faSignOutAlt,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
import type {ApiResponse, TasteProfile, User, UserPreferences, DailySuggestionsResponse} from "../types/interfaces.ts";
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dailySuggestions, setDailySuggestions] = useState<DailySuggestionsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            navigate('/register');
            return;
        }
        fetchUserData();
        fetchDailySuggestions();
    }, [userId, navigate]);

    const fetchUserData = async () => {
        try {
            const response = await fetch(`/api/backend/users/${userId}`);
            const data: ApiResponse<User> = await response.json();

            if (response.ok && data.success) {
                setUser(data.data);
            } else {
                setError(data.message || 'Failed to fetch user data');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error fetching user data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleModifyProfile = () => {
        navigate(`/profile/${userId}`);
    };

    const handleManageItineraries = () => {
        navigate(`/itineraries/${userId}`);
    };

    const handleLogout = () => {
        navigate('/');
    };

    const fetchDailySuggestions = async () => {
        try {
            const userPreferences = await getUserTasteProfile(userId!);

            const destinationsResponse = await fetch(`/api/backend/itineraries/users/${userId}/destinations`);
            const destinationsData = await destinationsResponse.json();

            const dailySuggestionsResponse = await fetch(`/api/ai/claude/generate_options_today`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_preferences: userPreferences,
                    itinerary_cities: destinationsData.data || [],
                    today_date: new Date().toISOString().split('T')[0]
                })
            });

            if (dailySuggestionsResponse.ok) {
                const suggestionsData = await dailySuggestionsResponse.json();
                setDailySuggestions(suggestionsData);
            }

        } catch (err) {
            console.error('Error fetching daily suggestions:', err);
        }
    };

    const getUserTasteProfile = async (userId: string): Promise<UserPreferences> => {
        const tasteProfileResponse = await fetch(`/api/backend/taste-profiles/users/${userId}`);

        if (!tasteProfileResponse.ok) {
            throw new Error('Failed to fetch taste profile');
        }

        const tasteProfileData = await tasteProfileResponse.json();
        const tasteProfile: TasteProfile = tasteProfileData.data;

        const userPreferences: UserPreferences = {};

        if (tasteProfile.artistPreferences?.artists) {
            userPreferences.artists = tasteProfile.artistPreferences.artists;
        }
        if (tasteProfile.moviePreferences?.movies) {
            userPreferences.movies = tasteProfile.moviePreferences.movies;
        }
        if (tasteProfile.bookPreferences?.books) {
            userPreferences.books = tasteProfile.bookPreferences.books;
        }
        if (tasteProfile.brandPreferences?.brands) {
            userPreferences.brands = tasteProfile.brandPreferences.brands;
        }
        if (tasteProfile.videoGamePreferences?.videoGames) {
            userPreferences.videoGames = tasteProfile.videoGamePreferences.videoGames;
        }
        if (tasteProfile.tvShowPreferences?.tvShows) {
            userPreferences.tvShows = tasteProfile.tvShowPreferences.tvShows;
        }
        if (tasteProfile.podcastPreferences?.podcasts) {
            userPreferences.podcasts = tasteProfile.podcastPreferences.podcasts;
        }
        if (tasteProfile.personPreferences?.persons) {
            userPreferences.persons = tasteProfile.personPreferences.persons;
        }

        return userPreferences;
    };

    if (isLoading) {
        return (
            <div className="page-style">
                <div className="fixed-background"></div>
                <header className="common-header app">
                    <h1>
                        TasteTrails
                        <FontAwesomeIcon icon={faMapLocationDot} className="ml-3" />
                    </h1>
                </header>
                <main className="loading-container">
                    <div className="loading-text">
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                        Loading your dashboard...
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-style">
                <div className="fixed-background"></div>
                <header className="common-header app">
                    <h1>
                        TasteTrails
                        <FontAwesomeIcon icon={faMapLocationDot} className="ml-3" />
                    </h1>
                </header>
                <main className="error-container">
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                    <button
                        className="retry-btn"
                        onClick={() => navigate('/register')}
                    >
                        Go to Registration
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="page-style">
            <div className="fixed-background"></div>

            <header className="common-header app">
                <button className="header-button left-button" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2"/>
                    Logout
                </button>
                <h1>
                    TasteTrails
                    <FontAwesomeIcon icon={faMapLocationDot} className="ml-3"/>
                </h1>
                <div className="user-greeting">
                    Hi, {user?.name}
                </div>
            </header>

            <main className="simple-main">
                <div className="dashboard-container">


                    {/* Actions Section */}
                    <section className="actions-section">
                        <h3>What would you like to do today?</h3>

                        <div className="action-cards">
                            <div className="simple-feature-card dash-page" onClick={handleModifyProfile}>
                                <FontAwesomeIcon icon={faUser} className="feature-icon" />
                                <h4>Modify Profile</h4>
                                <p>Update your cultural taste preferences and refine your profile</p>
                                <button className="action-btn btn-primary">Edit Profile</button>
                            </div>

                            <div className="simple-feature-card dash-page" onClick={handleManageItineraries}>
                                <FontAwesomeIcon icon={faRoute} className="feature-icon" />
                                <h4>Manage Itineraries</h4>
                                <p>Create new travel plans, view existing itineraries, and explore destinations</p>
                                <button className="action-btn btn-primary">View Itineraries</button>
                            </div>
                        </div>
                    </section>


                    {dailySuggestions && dailySuggestions.options && dailySuggestions.options.length > 0 && (
                        <section className="daily-suggestions-section">
                            <h3>Today's Cultural Suggestions</h3>
                            <div className="suggestions-scroll-container">
                                <div className="suggestions-carousel">
                                    {[
                                        ...dailySuggestions.options,
                                        ...dailySuggestions.options,
                                        ...dailySuggestions.options,
                                        ...dailySuggestions.options
                                    ].map((suggestion, index) => (
                                        <div key={`${suggestion.id}-${index}`} className="suggestion-card">
                                            <div className="suggestion-header">
                                                <h4>{suggestion.name}</h4>
                                            </div>
                                            <div className="suggestion-content">
                                                <p className="activity">{suggestion.activity}</p>
                                                <p className="location">
                                                    <FontAwesomeIcon icon={faMapLocationDot} />
                                                    {suggestion.location}
                                                </p>
                                                <p className="reasoning">{suggestion.reasoning}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="account-section">
                        <h4>Account Information</h4>
                        <div className="account-info">
                            <div className="info-item">
                                <strong>Name:</strong>
                                <span>{user?.name}</span>
                            </div>
                            <div className="info-item">
                                <strong>Email:</strong>
                                <span>{user?.email}</span>
                            </div>
                            <div className="info-item">
                                <strong>Member since:</strong>
                                <span>
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;