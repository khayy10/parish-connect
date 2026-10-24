
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api, { getApiErrorMessage } from '../services/api';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const login = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const response = await api.post('/login', form);

            const { token, user } = response.data;

            if (!token || !user) {
                throw new Error(
                    'Invalid login response from server.'
                );
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/', {
                replace: true
            });

        } catch (err) {
            setError(getApiErrorMessage(err, 'Sign in failed.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth">
            <form className="card" onSubmit={login}>
                <h1>ParishConnect Sign In</h1>

                {location.state?.message && (
                    <p role="status">
                        {location.state.message}
                    </p>
                )}

                {error && (
                    <div className="error" role="alert">
                        {error}
                    </div>
                )}

                <label>
                    Email Address
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        autoComplete="email"
                        required
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                    />
                </label>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <p>
                    No account?{' '}
                    <Link to="/register">
                        Sign Up
                    </Link>
                </p>
            </form>
        </div>
    );
}
