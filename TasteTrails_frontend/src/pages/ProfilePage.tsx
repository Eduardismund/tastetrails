import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faMapLocationDot, faMusic, faPlus, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import './ProfilePage.css'; // Import profile-specific CSS

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const {userId} = useParams<{userId: string}>()
    const [preferences, setPreferences] = useState({
        artists: ['']
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if(!userId){
            navigate('/register')
        }

        loadExistingProfile();
    }, [userId, navigate]);

    const loadExistingProfile = async () => {
        setIsLoadingProfile(true);
        try{
            const response = await fetch(`http://localhost:8080/api/taste-profiles/users/${userId}`);

            if(response.ok){
                const data = await response.json();
                const existingArtists = data.data?.musicPreferences?.artists || []
                if(existingArtists.length > 0) {
                    setPreferences({
                        artists: existingArtists
                    })
                }
            } else if(response.status === 404){
                console.log("No existing profiles found!")
            }
        } catch {
            console.error("Error loading existing profiles!")
        } finally {
            setIsLoadingProfile(false)
        }
    }

    const handleAddItem = (category:  keyof typeof preferences) => {
        setPreferences({
            ...preferences,
            [category]: [...preferences[category], '']
        })
    };

    const handleRemoveItem = (category:  keyof typeof preferences, index: number) => {
        const newItems = preferences[category].filter((_, i) => i !== index)
        setPreferences({
            ...preferences,
            [category]: newItems
        });
    };

    const handleItemChange =  (category: keyof typeof preferences, index: number, value:string) => {
        const newItems = [...preferences[category]]
        newItems[index] = value;
        setPreferences({
            ...preferences,
            [category]: newItems
        })
    };

    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();

        if(!userId){
            return
        }

        const filteredArtists = preferences.artists.filter(artist => artist.trim() !== '');

        if(filteredArtists.length === 0) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try{
            const response = await fetch(`http://localhost:8080/api/taste-profiles/users/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artistPreferences: {artists: filteredArtists},
                    moviePreferences: {movies : []}
                })
            });

            const data = await response.json();

            if(response.ok){
                navigate(`/dashboard/${userId}`);
            }else{
                setError(data.message || 'Failed to save')
            }
        } catch {
            setError('Network error');
        } finally{
            setIsLoading(false)
        }
    };

    if (isLoadingProfile) {
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
                        <h3>Loading existing profile...</h3>
                    </div>
                </main>
            </div>
        )
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

            <main className="simple-main">
                <div className="container">
                    {/* Hero Section */}
                    <div className="hero-section">
                        <h2 className="hero-title">Tell us about Your Cultural Taste</h2>
                        <p className="hero-description">Help us understand your artistic soul</p>
                    </div>

                    {/* Current Artists Display */}
                    {preferences.artists.length > 0 && preferences.artists.some(artist => artist.trim() !== '') && (
                        <div className="simple-feature-card main-page current-artists">
                            <FontAwesomeIcon icon={faMusic} className="feature-icon" />
                            <h4>Your current artists</h4>
                            <div className="artist-list">
                                {preferences.artists.filter(artist => artist.trim() !== '').map((artist, index) => {
                                    const originalIndex = preferences.artists.findIndex(a => a === artist);
                                    return (
                                        <div key={index} className="artist-tag-container">
                                            <span className="artist-tag">{artist}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem('artists', originalIndex)}
                                                disabled={isLoading}
                                                className="artist-remove-btn"
                                                title={`Remove ${artist}`}
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="simple-feature-card error-card">
                            <FontAwesomeIcon icon={faTimes} className="feature-icon error-icon" />
                            <h4>Oops! Something went wrong</h4>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Form Section */}
                    <div className="simple-feature-card main-page profile-form-card">
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-section">
                                <h3 className="form-section-title">
                                    <FontAwesomeIcon icon={faMusic} className="mr-2" />
                                    Favourite artists/musicians
                                </h3>

                                <div className="input-list">
                                    {preferences.artists.map((artist, index) => (
                                        <div key={index} className="input-group">
                                            <input
                                                type="text"
                                                value={artist}
                                                disabled={isLoading}
                                                onChange={(e) => handleItemChange('artists', index, e.target.value)}
                                                placeholder="Enter artist name"
                                                className="profile-input"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleAddItem('artists')}
                                    className="add-btn"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    Add Another Artist
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || preferences.artists.filter(artist => artist.trim() !== '').length === 0}
                                className="action-btn submit-btn"
                            >
                                {isLoading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} className="fa-spin mr-2" />
                                        Saving Profile...
                                    </>
                                ) : (
                                    'Complete Profile'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage