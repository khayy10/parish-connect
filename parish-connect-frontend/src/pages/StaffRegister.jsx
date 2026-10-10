
import { useState } from 'react';

import api from '../services/api';

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
            setError(
                Object.values(
                    err.response?.data?.errors || {}
                ).flat().join(' ') ||
                err.response?.data?.message ||
                'Staff registration failed.'
            );
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

                <label>
                    Password

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={update}
                        placeholder="Create password"
                        minLength={8}
                        required
                    />
                </label>

                <label>
                    Confirm Password

                    <input
                        type="password"
                        name="password_confirmation"
                        value={form.password_confirmation}
                        onChange={update}
                        placeholder="Confirm password"
                        minLength={8}
                        required
                    />
                </label>

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
