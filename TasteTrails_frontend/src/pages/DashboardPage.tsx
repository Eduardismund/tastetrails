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
import type { ApiResponse, User } from "../types/interfaces.ts";
import './DashboardPage.css'; // Import the CSS file

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user data on component mount
    useEffect(() => {
        if (!userId) {
            navigate('/register');
            return;
        }

        fetchUserData();
    }, [userId, navigate]);

    const fetchUserData = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${userId}`);
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
        // Clear any stored data if needed
        navigate('/');
    };

    if (isLoading) {
        return (
            <div className="page-style">
                <div className="fixed-background"></div>
                <header className="dashboard-header">
                    <h1>
                        TasteTrails
                        <FontAwesomeIcon icon={faMapLocationDot} className="ml-3" />
                    </h1>
                </header>
                <main className="loading-container">
                    <div className="loading-text">
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin mr-3" />
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
                <main className="simple-main">
                    <div className="error-message">
                        {error}
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
        <div className="dashboard-page">
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
                                <FontAwesomeIcon icon={faUser} className="text-4xl mb-4 text-white" />
                                <h4>Modify Profile</h4>
                                <p>Update your cultural taste preferences, add new artists, and refine your profile</p>
                                <button className="action-btn">Edit Profile</button>
                            </div>

                            <div className="simple-feature-card dash-page" onClick={handleManageItineraries}>
                                <FontAwesomeIcon icon={faRoute} className="text-4xl mb-4 text-white" />
                                <h4>Manage Itineraries</h4>
                                <p>Create new travel plans, view existing itineraries, and explore destinations</p>
                                <button className="action-btn">View Itineraries</button>
                            </div>
                        </div>
                    </section>

                    {/* Account Information Section */}
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