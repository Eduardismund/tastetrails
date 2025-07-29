import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faMapLocationDot,
    faMusic,
    faSpinner,
    faBook,
    faFilm,
    faGamepad,
    faTv,
    faMicrophone,
    faUser,
    faTag
} from "@fortawesome/free-solid-svg-icons";
import './ProfilePage.css';
import ItemListManager from "../components/ItemListManager.tsx";

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const {userId} = useParams<{userId: string}>()
    const [preferences, setPreferences] = useState({
        artists: [] as string[],
        movies: [] as string[],
        books: [] as string[],
        brands: [] as string[],
        videoGames: [] as string[],
        tvShows: [] as string[],
        podcasts: [] as string[],
        persons: [] as string[]
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
                const existingBrands = data.data?.brandPreferences?.brands || []
                const existingVideoGames = data.data?.videoGamePreferences?.videoGames || []
                const existingTvShows = data.data?.tvShowPreferences?.tvShows || []
                const existingPodcasts = data.data?.podcastPreferences?.podcasts || []
                const existingPersons = data.data?.personPreferences?.persons || []

                setPreferences({
                    artists: existingArtists,
                    movies: existingMovies,
                    books: existingBooks,
                    brands: existingBrands,
                    videoGames: existingVideoGames,
                    tvShows: existingTvShows,
                    podcasts: existingPodcasts,
                    persons: existingPersons,
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
        const filteredMovies = preferences.movies.filter(movie => movie.trim() !== '');
        const filteredBooks = preferences.books.filter(book => book.trim() !== '');
        const filteredBrands = preferences.brands.filter(book => book.trim() !== '');
        const filteredVideoGames = preferences.videoGames.filter(book => book.trim() !== '');
        const filteredTvShows = preferences.tvShows.filter(book => book.trim() !== '');
        const filteredPodcasts = preferences.podcasts.filter(book => book.trim() !== '');
        const filteredPersons = preferences.persons.filter(book => book.trim() !== '');


        if(filteredArtists.length === 0 && filteredBooks.length === 0 && filteredMovies.length === 0
        && filteredBrands.length === 0 && filteredVideoGames.length === 0 && filteredTvShows.length === 0
            && filteredPodcasts.length === 0 && filteredPersons.length === 0) {
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
                    moviePreferences: {movies : filteredMovies},
                    bookPreferences: {books: filteredBooks},
                    brandPreferences: {brands : filteredBrands},
                    videoGamePreferences: {videoGames : filteredVideoGames},
                    tvShowPreferences: {tvShows : filteredTvShows},
                    podcastPreferences: {podcasts : filteredPodcasts},
                    personPreferences: {persons : filteredPersons},
                })
            });

            const data = await response.json();

            if(response.ok){
                navigate(`/dashboard/${userId}`);
            }else{
                setError(data.message || 'Failed to save')
            }

            await fetch(`http://localhost:8001/api/qloo/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_preferences: {
                        artists: filteredArtists,
                        books: filteredBooks,
                        movies: filteredMovies,
                        brands: filteredBrands,
                        video_games: filteredVideoGames,
                        tv_shows: filteredTvShows,
                        podcasts: filteredPodcasts,
                        persons: filteredPersons
                    },
                    limit: 5
                })
            });
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
                            title="Favourite brands"
                            items={preferences.brands}
                            placeholder="Enter brand name"
                            icon={faTag}
                            category="brands"
                            isLoading={isLoading}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            addButtonText="Add Brand"
                        />

                        <ItemListManager
                            title="Favourite video games"
                            items={preferences.videoGames}
                            placeholder="Enter video game name"
                            icon={faGamepad}
                            category="videoGames"
                            isLoading={isLoading}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            addButtonText="Add video game"
                        />
                        <ItemListManager
                            title="Favourite TV shows"
                            items={preferences.tvShows}
                            placeholder="Enter TV show title"
                            icon={faTv}
                            category="tvShows"
                            isLoading={isLoading}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            addButtonText="Add TV show"
                        />

                        <ItemListManager
                            title="Favourite podcasts"
                            items={preferences.podcasts}
                            placeholder="Enter podcast title"
                            icon={faMicrophone}
                            category="podcasts"
                            isLoading={isLoading}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            addButtonText="Add podcast"
                        />
                        <ItemListManager
                            title="Favourite famous persons"
                            items={preferences.persons}
                            placeholder="Enter person name"
                            icon={faUser}
                            category="persons"
                            isLoading={isLoading}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            addButtonText="Add person"
                        />

                        <button
                            type="submit"
                            disabled={isLoading || (preferences.artists.length === 0 && preferences.movies.length === 0 && preferences.books.length === 0
                             && preferences.brands.length === 0 && preferences.videoGames.length === 0 && preferences.tvShows.length === 0
                            && preferences.podcasts.length === 0 && preferences.persons.length === 0)}
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