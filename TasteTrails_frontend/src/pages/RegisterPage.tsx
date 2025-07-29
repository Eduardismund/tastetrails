import { useNavigate } from "react-router-dom";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faMapLocationDot } from "@fortawesome/free-solid-svg-icons";
import GenericForm from "../components/GenericForm";
import type { RegisterFormData, FormField } from "../types/interfaces";
import './AuthenticatePage.css';



const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    const fields: FormField[] = [
        {
            name: 'name',
            type: 'text',
            label: 'Full Name',
            placeholder: 'Enter your full name',
            required: true
        },
        {
            name: 'email',
            type: 'email',
            label: 'Email Address',
            placeholder: 'Enter your email address',
            required: true
        },
        {
            name: 'password',
            type: 'password',
            label: 'Password',
            placeholder: 'Create a secure password',
            required: true
        }
    ];

    const handleSubmit = async (formData: RegisterFormData) => {
        const response = await fetch(`/api/backend/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Registration failed!');
        }

        const data = await response.json();
        const userId = data.data?.id;
        navigate(`/profile/${userId}`);
    };

    return (
        <div className="page-style">
            <div className="fixed-background"></div>

            <header className="common-header app">
                <button className="header-button left-button" onClick={() => navigate('/')}>
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Back
                </button>
                <h1>
                    TasteTrails
                    <FontAwesomeIcon
                        icon={faMapLocationDot}
                        className="ml-3"
                    />
                </h1>
            </header>

            <main className="simple-main common">
                <div className="authenticate-container">
                    <div className="simple-feature-card auth-page">
                        <GenericForm<RegisterFormData>
                            title="Create Your Account"
                            fields={fields}
                            initialData={{ name: '', email: '', password: '' }}
                            onSubmit={handleSubmit}
                            submitButtonText="Create Account"
                            loadingText="Creating Account..."
                        />
                    </div>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <button
                                className="auth-link"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;