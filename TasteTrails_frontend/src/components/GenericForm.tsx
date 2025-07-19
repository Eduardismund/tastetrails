import {useState} from "react";
import type {GenericFormProps} from "../types/interfaces.ts";
import './GenericForm.css'; // Import the CSS file

function GenericForm<T extends Record<string, string>>({
                                                           title,
                                                           fields,
                                                           initialData,
                                                           onSubmit,
                                                           onSuccess,
                                                           submitButtonText = "Submit",
                                                           loadingText = "Processing..."
                                                       }: GenericFormProps<T>) {
    const [formData, setFormData] = useState<T>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await onSubmit(formData);
            setFormData(initialData);
            onSuccess?.();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="generic-form">
            <h3>{title}</h3>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {fields.map((field) => (
                <div key={field.name} className="form-group">
                    <label htmlFor={field.name}>{field.label}</label>
                    <input
                        id={field.name}
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required={field.required}
                        disabled={isSubmitting}
                        min={field.min}
                        max={field.max}
                        className="form-input"
                    />
                </div>
            ))}

            <button
                type="submit"
                disabled={isSubmitting}
                className={`action-btn`}
            >
                {isSubmitting ? loadingText : submitButtonText}
            </button>
        </form>
    );
}

export default GenericForm;