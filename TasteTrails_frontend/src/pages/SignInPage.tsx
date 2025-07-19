import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faMapLocationDot } from "@fortawesome/free-solid-svg-icons";
import type { FormField } from "../types/interfaces.ts";
import GenericForm from "../components/GenericForm.tsx";
import './AuthenticatePage.css';
import {useScrollToTop} from "../hooks/useScrollToTop"; // Import the CSS file

interface SignInFormData extends Record<string, string> {
    email: string;
    password: string;
}

const SignInPage: React.FC = () => {
    useScrollToTop();

    const navigate = useNavigate();

    const fields: FormField[] = [
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
            placeholder: 'Enter your password',
            required: true
        }
    ];

    const handleSubmit = async (formData: SignInFormData) => {
        const response = await fetch('http://localhost:8080/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Sign in failed!');
        }

        const data = await response.json();
        const userId = data.data?.user?.id;
        navigate(`/dashboard/${userId}`);
    };

    return (
        <div className="page-style">
            <div className="fixed-background"></div>

            <header className="common-header app">
                <button className="header-button left-button" onClick={() => navigate('/')}>
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Back
                </button>
                <h1 className="landing-title app">
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
                        <GenericForm<SignInFormData>
                            title="Sign Into Your Account"
                            fields={fields}
                            initialData={{ email: '', password: '' }}
                            onSubmit={handleSubmit}
                            submitButtonText="Sign In"
                            loadingText="Signing In..."
                        />
                    </div>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{' '}
                            <button
                                className="auth-link"
                                onClick={() => navigate('/register')}
                            >
                                Create Account
                            </button>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SignInPage;