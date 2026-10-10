
import { useState } from 'react';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import api from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');

    const [err, setErr] = useState('');

    const navigate = useNavigate();

    const go = async (e) => {
        e.preventDefault();

        setErr('');

        try {
            const { data } = await api.post('/login', {
                email,
                password
            });

            localStorage.setItem(
                'token',
                data.token
            );

            localStorage.setItem(
                'user',
                JSON.stringify(data.user)
            );

            navigate('/');
        } catch (error) {
            setErr(
                error.response?.data?.message ||
                'Login failed'
            );
        }
    };

    return (
        <div className="auth">
            <form
                className="card"
                onSubmit={go}
            >
                <h1>
                    ParishConnect
                </h1>

                <p>
                    Parish Administrative and
                    Information Management System
                </p>

                {err && (
                    <div className="error">
                        {err}
                    </div>
                )}

                <label>
                    Email

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />
                </label>

                <label>
                    Password

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />
                </label>

                <button type="submit">
                    Sign In
                </button>

                <p>
                    No account?{' '}

                    <Link to="/register">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}
