import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/register', form);

            navigate('/login', {
                replace: true,
                state: {
                    message: 'Registration successful! Please sign in.'
                }
            });
        } catch (err) {
            const errors = err.response?.data?.errors;

            setError(
                errors
                    ? Object.values(errors).flat().join(' ')
                    : err.response?.data?.message ||
                    'Registration failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { name: 'name', label: 'Full Name', type: 'text' },
        { name: 'email', label: 'Email Address', type: 'email' },
        { name: 'phone', label: 'Phone Number', type: 'tel' },
        { name: 'password', label: 'Password', type: 'password' },
        {
            name: 'password_confirmation',
            label: 'Confirm Password',
            type: 'password'
        }
    ];

    return (
        <div className="auth">
            <form className="card" onSubmit={handleSubmit}>
                <h1>Parishioner Sign Up</h1>
                <p>Create your ParishConnect account.</p>

                {error && (
                    <div className="error" role="alert">
                        {error}
                    </div>
                )}

                {fields.map((field) => (
                    <label key={field.name}>
                        {field.label}
                        <input
                            type={field.type}
                            value={form[field.name]}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    [field.name]: e.target.value
                                })
                            }
                            required
                        />
                    </label>
                ))}

                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Sign Up'}
                </button>

                <p>
                    Already have an account?{' '}
                    <Link to="/login">Sign In</Link>
                </p>
            </form>
        </div>
    );
}
