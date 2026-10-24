import { Church } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../services/api';
import ApiStatus from '../components/ApiStatus';
import { ROLE_OPTIONS } from '../constants/roles';

const EMPTY_FORM = {
    role: 'parishioner',
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
};

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const isStaff = form.role !== 'parishioner';

    const handleChange = (event) => {
        setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        if (isStaff) {
            setError('Staff accounts must be created by a logged-in Parish Priest using Register Parish Staff.');
            return;
        }
        if (form.password !== form.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must have at least 8 characters.');
            return;
        }
        setLoading(true);
        try {
            const { data, status } = await api.post('/register', {
                ...form,
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
            });
            if (status !== 201 || !data?.user) {
                setError('Unexpected server response. Please try again.');
                return;
            }
            navigate('/login', { replace: true, state: { message: 'Registration successful! Select Parishioner and sign in.' } });
        } catch (err) {
            setError(getApiErrorMessage(err, 'Registration failed.'));
        } finally {
            setLoading(false);
        }
    };

    return <div className="auth">
        <form className="card" onSubmit={handleSubmit}>
            <div className="auth-brand"><Church aria-hidden="true" /><div><strong>ParishConnect</strong><span>PARISH SERVICES PORTAL</span></div></div>
            <h1>Create Your Account</h1>
            <p className="auth-intro">Join the ParishConnect community.</p>
            <ApiStatus />
            {error && <div className="error" role="alert">{error}</div>}
            <label htmlFor="register-role">Register As</label>
            <select id="register-role" name="role" value={form.role} onChange={handleChange} required>
                {ROLE_OPTIONS.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
            {isStaff ? <div className="notice" role="status">
                <strong>Staff registration is restricted.</strong>
                <p>A Parish Priest must create Parish Priest, Secretary, and Ministry Coordinator accounts from the staff management page. This prevents unauthorized staff access.</p>
                <p>Already have a staff account? <Link to="/login">Sign In</Link>.</p>
            </div> : <>
                <label htmlFor="register-name">Full Name</label>
                <input id="register-name" name="name" value={form.name} onChange={handleChange}
                    maxLength={255} autoComplete="name" required />
                <label htmlFor="register-email">Email Address</label>
                <input id="register-email" type="email" name="email" value={form.email} onChange={handleChange}
                    maxLength={255} autoComplete="email" required />
                <label htmlFor="register-phone">Phone Number (optional)</label>
                <input id="register-phone" type="tel" name="phone" value={form.phone} onChange={handleChange}
                    maxLength={30} autoComplete="tel" />
                <label htmlFor="register-password">Password</label>
                <input id="register-password" type="password" name="password" value={form.password} onChange={handleChange}
                    autoComplete="new-password" minLength={8} required />
                <label htmlFor="register-confirm">Confirm Password</label>
                <input id="register-confirm" type="password" name="password_confirmation" value={form.password_confirmation}
                    onChange={handleChange} autoComplete="new-password" minLength={8} required />
                <button className="auth-submit" type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Create Parishioner Account'}
                </button>
            </>}
            <p className="auth-foot">Already have an account? <Link to="/login">Sign In</Link></p>
        </form>
    </div>;
}
