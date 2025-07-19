import {useState} from "react";

const CreateForm: React.FC<{ userId: string; onCreated: () => void }> = ({ userId, onCreated }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newItinerary, setNewItinerary] = useState({
        destination: '',
        startDate: '',
        endDate: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewItinerary({
            ...newItinerary,
            [e.target.name]: e.target.value
        });
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8080/api/itineraries/users/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItinerary)
            });

            const data = await response.json();

            if (response.ok) {
                setNewItinerary({destination: '', startDate: '', endDate: ''});
                onCreated();
            } else {
                setError(data.message || 'Failed to create itinerary');
            }
        } catch {
            setError('Network error');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Create New Itinerary</h3>
            {error && <div style={{color: 'red'}}>{error}</div>}
            <div>
                <label>Destination:</label>
                <input
                    type="text"
                    name="destination"
                    value={newItinerary.destination}
                    onChange={handleChange}
                    required
                    disabled={isCreating}
                />
            </div>
            <div>
                <label>Start Date:</label>
                <input
                    type="date"
                    name="startDate"
                    value={newItinerary.startDate}
                    onChange={handleChange}
                    required
                    disabled={isCreating}
                />
            </div>
            <div>
                <label>End Date:</label>
                <input
                    type="date"
                    name="endDate"
                    value={newItinerary.endDate}
                    onChange={handleChange}
                    required
                    disabled={isCreating}
                />
            </div>
            <button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Itinerary'}
            </button>
        </form>
    );
};

export default CreateForm
