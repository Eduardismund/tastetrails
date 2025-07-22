import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { useScrollToTop } from '../hooks/useScrollToTop.js';
import './LandingPage.css';

import {
    faMapLocationDot,
    faUtensils,
    faMapMarkedAlt,
    faStar
} from "@fortawesome/free-solid-svg-icons";

const LandingPage: React.FC = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsScrolled(currentScrollY > 50);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <div className="page-style">
            <div className="fixed-background"></div>
            <header className={`common-header landing ${isScrolled ? 'scroll' : ''}`}>
                <h1 className="landing-title">
                    TasteTrails
                    <FontAwesomeIcon
                        icon={faMapLocationDot}
                        className="ml-3"
                    />
                </h1>
                <p className="landing-subtitle">Discover Your Perfect Culinary Journey</p>
            </header>

            <main className="simple-main common">
                <div className="landing-content">
                    <div className="hero-section">
                        <h2 className="hero-title">Plan Your Food Adventures</h2>
                        <p className="hero-description">
                            Create personalized itineraries based on your taste preferences.
                            Discover amazing restaurants, local cuisine, and unforgettable dining experiences around the world.
                        </p>
                    </div>

                    <div className="cta-section">
                        <button
                            className="action-btn btn-primary"
                            onClick={() => handleNavigation('/register')}
                        >
                            Create Account
                        </button>

                        <button
                            className="action-btn btn-outline"
                            onClick={() => handleNavigation('/login')}
                        >
                            Sign In
                        </button>
                    </div>

                    <div className="features-section">
                        <div className="simple-feature-card main-page">
                            <FontAwesomeIcon
                                icon={faUtensils}
                                className="feature-icon"
                            />
                            <h3>Taste Profiles</h3>
                            <p>Create your unique taste profile to get personalized recommendations</p>
                        </div>
                        <div className="simple-feature-card main-page">
                            <FontAwesomeIcon
                                icon={faMapMarkedAlt}
                                className="feature-icon"
                            />
                            <h3>Smart Itineraries</h3>
                            <p>Plan your trips with AI-powered restaurant and activity suggestions</p>
                        </div>
                        <div className="simple-feature-card main-page">
                            <FontAwesomeIcon
                                icon={faStar}
                                className="feature-icon"
                            />
                            <h3>Local Experiences</h3>
                            <p>Discover hidden gems and authentic local dining experiences</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="landing-footer">
                <div className="container">
                    <p>&copy; 2025 TasteTrails. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;