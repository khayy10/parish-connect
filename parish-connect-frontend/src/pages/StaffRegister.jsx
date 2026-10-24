
import { useState } from 'react';

import api, { getApiErrorMessage } from '../services/api';
import PasswordInput from '../components/PasswordInput';

export default function StaffRegister() {
    const emptyForm = {
        name: '',
        email: '',
        phone: '',
        role: '',
        password: '',
        password_confirmation: ''
    };

    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const update = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const register = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/staff/register', form);

            setSuccess(
                'Parish staff account created successfully.'
            );

            setForm(emptyForm);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Staff registration failed.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <header>
                <h1>Parish Staff Registration</h1>

                <p>
                    Register authorized parish personnel.
                </p>
            </header>

            <form
                className="panel"
                onSubmit={register}
            >
                {error && (
                    <div className="error">
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
                        name="name"
                        value={form.name}
                        onChange={update}
                        placeholder="Full name"
                        required
                    />
                </label>

                <label>
                    Email Address

                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={update}
                        placeholder="Email address"
                        required
                    />
                </label>

                <label>
                    Phone Number

                    <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={update}
                        placeholder="Phone number"
                    />
                </label>

                <label>
                    Parish Role

                    <select
                        name="role"
                        value={form.role}
                        onChange={update}
                        required
                    >
                        <option value="">
                            Select Parish Role
                        </option>

                        <option value="priest">
                            Parish Priest
                        </option>

                        <option value="secretary">
                            Parish Secretary
                        </option>

                        <option value="ministry_coordinator">
                            Ministry Coordinator
                        </option>
                    </select>
                </label>

                <label className="staff-password-label" htmlFor="staff-password">Password</label>
                <PasswordInput
                    id="staff-password"
                    name="password"
                    value={form.password}
                    onChange={update}
                    label="password"
                    placeholder="Create password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                />

                <label className="staff-password-label" htmlFor="staff-confirm-password">Confirm Password</label>
                <PasswordInput
                    id="staff-confirm-password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={update}
                    label="confirm password"
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Register Staff'}
                </button>
            </form>
        </div>
    );
}
