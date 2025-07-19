export interface Activity {
    id: string;
    title: string;
    description: string;
    theme: 'CULTURAL_ACTIVITY' | 'SOCIAL_ACTIVITY' | 'CULINARY_ACTIVITY';
    startTime: string;
    endTime: string;
    activityDate: string;
    address: string;
    createdAt: string;
}

export interface Itinerary {
    id: string;
    userId: string;
    destination: string;
    startDate: string;
    endDate: string;
    activities: Activity[];
    createdAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    hasTasteProfile: boolean;
    itineraryCount: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp?: string;
}

// Component Props Interfaces
export interface ItineraryDetailsProps {
    itinerary: Itinerary | null;
    onActivityCreated: () => void;
}

export interface CreateFormProps {
    userId: string;
    onCreated: () => void;
}

export interface ItineraryListProps {
    itineraries: Itinerary[];
    selectedId: string | null;
    onSelect: (itinerary: Itinerary) => void;
}

// Form Data Interfaces
export interface NewItineraryForm {
    destination: string;
    startDate: string;
    endDate: string;
}

export interface NewActivityForm {
    title: string;
    description: string;
    theme: 'CULTURAL_ACTIVITY' | 'SOCIAL_ACTIVITY' | 'CULINARY_ACTIVITY';
    startTime: string;
    endTime: string;
    activityDate: string;
    address: string;
}

export interface LoginForm {
    email: string;
    password: string;
}

export interface RegisterForm {
    name: string;
    email: string;
    password: string;
}


///

export interface FormField{
    name: string,
    type: 'text' | 'email' | 'password' | 'date' | 'datetime-local' | 'textarea' | 'select';
    label: string;
    placeholder?: string
    required?: boolean
    options?: {value: string; label: string}[];
    min?: string;
    max?: string;
}

export interface GenericFormProps<T> {
    title: string;
    fields: FormField[];
    initialData: T;
    onSubmit: (data: T) => Promise<void>;
    onSuccess?: () => void;
    submitButtonText?: string;
    loadingText?: string;
}