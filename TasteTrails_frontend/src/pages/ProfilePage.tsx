import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faMapLocationDot,
    faMusic,
    faSpinner,
    faBook,
    faFilm
} from "@fortawesome/free-solid-svg-icons";
import './ProfilePage.css';
import ItemListManager from "../components/ItemListManager.tsx";

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const {userId} = useParams<{userId: string}>()
    const [preferences, setPreferences] = useState({
        artists: [] as string[],
        books: [] as string[],
        movies: [] as string[]
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
                const existingArtists = data.data?.artistPreferences?.artists || []
                const existingMovies = data.data?.moviePreferences?.movies || []
                const existingBooks = data.data?.bookPreferences?.books || []

                setPreferences({
                    artists: existingArtists,
                    movies: existingMovies,
                    books: existingBooks
                })
            } else if(response.status === 404){
                console.log("No existing profiles found!")
            }
        } catch {
            console.error("Error loading existing profiles!")
        } finally {
            setIsLoadingProfile(false)
        }
    }

    const handleAddItem = (category: string, value: string) => {
        const key = category as keyof typeof preferences;
        setPreferences({
            ...preferences,
            [key]: [...preferences[key], value]
        })
    };

    const handleRemoveItem = (category: string, index: number) => {
        const key = category as keyof typeof preferences;
        const newItems = preferences[key].filter((_, i) => i !== index)
        setPreferences({
            ...preferences,
            [key]: newItems
        });
    };

    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();

        if(!userId){
            return
        }

        const filteredArtists = preferences.artists.filter(artist => artist.trim() !== '');
        const filteredBooks = preferences.books.filter(book => book.trim() !== '');
        const filteredMovies = preferences.movies.filter(movie => movie.trim() !== '');

        console.log('Filtered data:', {
            artists: filteredArtists,
            movies: filteredMovies,
            books: filteredBooks
        });

        if(filteredArtists.length === 0 && filteredBooks.length === 0 && filteredMovies.length === 0) {
            setError('Please add at least one item to any category');
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
                    bookPreferences: {books: filteredBooks},
                    moviePreferences: {movies : filteredMovies}
                })
            });

            console.log('API Response Status:', response.status);

            const data = await response.json();
            console.log('API Response Data:', data);

            if(response.ok){
                navigate(`/dashboard/${userId}`);
            }else{
                setError(data.message || 'Failed to save')
            }
        } catch (error) {
            console.error('API Error:', error);
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
                    <h1>TasteTrails <FontAwesomeIcon icon={faMapLocationDot} className="ml-3" /></h1>
                    <div></div>
                </header>
                <main className="simple-main common">
                    <div className="simple-feature-card loading-card">
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
                <h1>TasteTrails <FontAwesomeIcon icon={faMapLocationDot} className="ml-3" /></h1>
                <div></div>
            </header>

            <main className="simple-main">
                <div className="container">
                    <div className="hero-section">
                        <h2 className="hero-title">Tell us about Your Cultural Taste</h2>
                        <p className="hero-description">Help us understand your artistic soul</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="profile-form">
                        <ItemListManager
                            title="Favourite artists"
                            items={preferences.artists}
                            placeholder="Enter artist name"
                            icon={faMusic}
                            category="artists"
                            isLoading={isLoading}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            addButtonText="Add Artist"
                        />

                        <ItemListManager
                            title="Favourite books"
                            items={preferences.books}
                            placeholder="Enter book title"
                            icon={faBook}
                            category="books"
                            isLoading={isLoading}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            addButtonText="Add Book"
                        />

                        <ItemListManager
                            title="Favourite movies"
                            items={preferences.movies}
                            placeholder="Enter movie title"
                            icon={faFilm}
                            category="movies"
                            isLoading={isLoading}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            addButtonText="Add Movie"
                        />

                        <button
                            type="submit"
                            disabled={isLoading || (preferences.artists.length === 0 && preferences.movies.length === 0 && preferences.books.length === 0)}
                            className={`submit-btn ${isLoading ? 'loading' : ''}`}>
                            {isLoading ? 'Saving Profile...' : 'Complete Profile'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage