
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../services/api';

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
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');

        if (form.password !== form.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }

        if (form.password.length < 8) {
            setError(
                'Password must contain at least 8 characters.'
            );
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/register', form);

            if (response.status === 201) {
                navigate('/login', {
                    replace: true,
                    state: {
                        message:
                            'Registration successful! Please sign in.'
                    }
                });
            } else {
                setError(
                    'Unexpected server response. Please try again.'
                );
            }

        } catch (err) {
            setError(getApiErrorMessage(err, 'Registration failed.'));
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        {
            name: 'name',
            label: 'Full Name',
            type: 'text',
            autoComplete: 'name'
        },
        {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            autoComplete: 'email'
        },
        {
            name: 'phone',
            label: 'Phone Number',
            type: 'tel',
            autoComplete: 'tel'
        },
        {
            name: 'password',
            label: 'Password',
            type: 'password',
            autoComplete: 'new-password'
        },
        {
            name: 'password_confirmation',
            label: 'Confirm Password',
            type: 'password',
            autoComplete: 'new-password'
        }
    ];

    return (
        <div className="auth">
            <form
                className="card"
                onSubmit={handleSubmit}
            >
                <h1>Parishioner Sign Up</h1>

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

                {fields.map((field) => (
                    <label key={field.name}>
                        {field.label}

                        <input
                            type={field.type}
                            name={field.name}
                            value={form[field.name]}
                            onChange={handleChange}
                            autoComplete={field.autoComplete}
                            required={field.name !== 'phone'}
                            minLength={
                                field.type === 'password'
                                    ? 8
                                    : undefined
                            }
                        />
                    </label>
                ))}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Registering...' : 'Sign Up'}
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
