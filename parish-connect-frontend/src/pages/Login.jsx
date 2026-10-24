import { Church } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../services/api';
import ApiStatus from '../components/ApiStatus';
import { ROLE_OPTIONS } from '../constants/roles';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ role: 'parishioner', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
        setError('');
    };

    const login = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/login', {
                role: form.role,
                email: form.email.trim().toLowerCase(),
                password: form.password,
            });
            if (!data?.token || !data?.user) {
                setError('Invalid login response from the server.');
                return;
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/', { replace: true });
        } catch (err) {
            setError(getApiErrorMessage(err, 'Sign in failed.'));
        } finally {
            setLoading(false);
        }
    };

    return <div className="auth">
        <form className="card" onSubmit={login}>
            <div className="auth-brand"><Church aria-hidden="true" /><div><strong>ParishConnect</strong><span>PARISH SERVICES PORTAL</span></div></div>
            <h1>ParishConnect Sign In</h1>
            <p className="auth-intro">Welcome back! Select your account role to continue.</p>
            <ApiStatus />
            {location.state?.message && <div className="success" role="status">{location.state.message}</div>}
            {error && <div className="error" role="alert">{error}</div>}
            <label htmlFor="login-role">Account Role</label>
            <select id="login-role" name="role" value={form.role} onChange={handleChange} required>
                {ROLE_OPTIONS.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
            <label htmlFor="login-email">Email Address</label>
            <input id="login-email" type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="Enter your email" autoComplete="email" required />
            <label htmlFor="login-password">Password</label>
            <input id="login-password" type="password" name="password" value={form.password} onChange={handleChange}
                autoComplete="current-password" required />
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
            <p className="auth-foot">No account? <Link to="/register">Sign Up</Link></p>
        </form>
    </div>;
}
