import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// === CORE DATA INTERFACES === //

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    hasTasteProfile: boolean;
    itineraryCount: number;
}

export interface Itinerary {
    id: string;
    userId: string;
    destination: string;
    startDate: string;
    endDate: string;
    activities?: Activity[];
    createdAt: string;
}

export interface Activity {
    id: string;
    title: string;
    description: string;
    theme: string;
    startTime: string;
    endTime: string;
    activityDate: string;
    address: string;
    reasoning: string;
    createdAt: string;
}

export interface ActivityOption {
    id: string;
    name: string;
    activity: string;
    reasoning?: string;
    location: string;
    cultural_score?: number;
    start_time?: string;
    end_time?: string;
    activity_date?: string;
}

export interface ActivityResponse {
    id: string;
    itineraryId: string;
    description: string;
    title: string;
    theme: string;
    startTime: string;
    endTime: string;
    activityDate: string;
    address: string;
    createdAt: string;
}

// === API INTERFACES === //

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp?: string;
}

// === FORM INTERFACES === //

export interface FormField {
    name: string;
    type: 'text' | 'email' | 'password' | 'date' | 'time';
    label: string;
    placeholder?: string;
    required?: boolean;
    min?: string;
    max?: string;
}

export interface GenericFormProps<T extends Record<string, string>> {
    title: string;
    fields: FormField[];
    initialData: T;
    onSubmit: (data: T) => Promise<void>;
    onSuccess?: () => void;
    submitButtonText?: string;
    loadingText?: string;
}

// === FORM DATA INTERFACES === //

export interface SignInFormData extends Record<string, string> {
    email: string;
    password: string;
}

export interface RegisterFormData extends Record<string, string> {
    name: string;
    email: string;
    password: string;
}

export interface CreateItineraryFormData extends Record<string, string> {
    destination: string;
    startDate: string;
    endDate: string;
}

export interface NewItineraryForm {
    destination: string;
    startDate: string;
    endDate: string;
}

// === COMPONENT PROPS INTERFACES === //

export interface ItineraryListProps {
    itineraries: Itinerary[];
    selectedId: string | null;
    onSelect: (itinerary: Itinerary) => void;
}

export interface ItineraryDetailsProps {
    itinerary: Itinerary | null;
    onActivityCreated: () => void;
}

export interface CreateFormProps {
    userId: string;
    onCreated: () => void;
}

export interface ActivitiesListProps {
    activities: Activity[];
}

export interface ItemListManagerProps {
    title: string;
    items: string[];
    placeholder: string;
    icon: IconDefinition;
    category: string;
    isLoading?: boolean;
    onAddItem: (category: string, value: string) => void;
    onRemoveItem: (category: string, index: number) => void;
    addButtonText: string;
    className?: string;
}

export interface ActivityGeneratorProps {
    itineraryStartDate: string;
    itineraryEndDate: string;
    itineraryDestination: string;
    userId: string;
    itineraryId: string;
    timeSlot: {
        start_time: string;
        end_time: string;
        date: string;
    };
    selectedTheme: string;
    onTimeSlotChange: (timeSlot: {
        start_time: string;
        end_time: string;
        date: string;
    }) => void;
    onThemeChange: (theme: string) => void;
    onOptionsGenerated: (options: ActivityOption[]) => void;
    onError: (error: string) => void;
}

export interface ActivityOptionsProps {
    options: ActivityOption[];
    itineraryId: string;
    selectedTheme: string;
    timeSlot: {
        start_time: string;
        end_time: string;
        date: string;
    };
    onActivityAdded: () => void;
    onError: (error: string) => void;
    onClearOptions: () => void;
}

// === PROFILE INTERFACES === //

export interface UserPreferences {
    artists?: string[];
    books?: string[];
    movies?: string[];
}

export interface TasteProfile {
    artistPreferences?: { artists: string[] };
    moviePreferences?: { movies: string[] };
    bookPreferences?: { books: string[] };
}

export interface AutocompleteItem {
    entityId: string;
    name: string;
}

// === API REQUEST INTERFACES === //

export interface GenerateOptionsRequest {
    user_preferences: {
        artists?: string[];
        books?: string[];
        movies?: string[];
    };
    city: string;
    start_time: string;
    end_time: string;
    date: string;
    theme: string;
    existing_activities?: ActivityOption[];
}