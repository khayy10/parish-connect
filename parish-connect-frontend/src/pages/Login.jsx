
import { useState } from 'react';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import api from '../services/api';

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const update = (e) => {
        setForm((previous) => ({
            ...previous,
            [e.target.name]: e.target.value
        }));
    };

    const register = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        if (
            form.password !==
            form.password_confirmation
        ) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/register', form);

            setSuccess(
                'Account created successfully. Redirecting to Sign In...'
            );

            setForm({
                name: '',
                email: '',
                phone: '',
                password: '',
                password_confirmation: ''
            });

            navigate('/login', {
                replace: true,
                state: {
                    message:
                        'Registration successful! Please sign in.'
                }
            });

        } catch (err) {
            const validationErrors =
                err.response?.data?.errors;

            setError(
                validationErrors
                    ? Object.values(validationErrors)
                        .flat()
                        .join(' ')
                    : err.response?.data?.message ||
                        'Registration failed. Please try again.'
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth">
            <form
                className="card"
                onSubmit={register}
            >
                <h1>
                    Parishioner Sign Up
                </h1>

                <p>
                    Create your ParishConnect account.
                </p>

                {error && (
                    <div
                        className="error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <p role="status">
                        {success}
                    </p>
                )}

                <label>
                    Full Name

                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={update}
                        required
                    />
                </label>

                <label>
                    Email Address

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={update}
                        autoComplete="email"
                        required
                    />
                </label>

                <label>
                    Phone Number

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Enter phone number"
                        value={form.phone}
                        onChange={update}
                    />
                </label>

                <label>
                    Password

                    <input
                        type="password"
                        name="password"
                        placeholder="Create password"
                        value={form.password}
                        onChange={update}
                        autoComplete="new-password"
                        minLength={8}
                        required
                    />
                </label>

                <label>
                    Confirm Password

                    <input
                        type="password"
                        name="password_confirmation"
                        placeholder="Confirm password"
                        value={form.password_confirmation}
                        onChange={update}
                        autoComplete="new-password"
                        minLength={8}
                        required
                    />
                </label>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? 'Creating Account...'
                        : 'Sign Up'}
                </button>

                <p>
                    Already have an account?{' '}

                    <Link to="/login">
                        Sign In
                    </Link>
                </p>
            </form>
        </div>
    );
}
