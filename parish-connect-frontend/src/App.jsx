import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from './services/api';

import {
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import StaffRegister from './pages/StaffRegister';

import Layout from './layouts/Layout';

import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Reservations from './pages/Reservations';
import Ministries from './pages/Ministries';
import Announcements from './pages/Announcements';
import Parishioners from './pages/Parishioners';
import DocumentRequests from './pages/DocumentRequests';

function Protected({ children }) {
    const [state, setState] = useState('checking');
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            setState('signed-out');
            return;
        }
        let active = true;
        api.get('/me').then(({ data }) => {
            if (!active) return;
            localStorage.setItem('user', JSON.stringify(data));
            setState('authenticated');
        }).catch((err) => {
            if (!active) return;
            if (err.response?.status === 401) setState('signed-out');
            else {
                setError(getApiErrorMessage(err));
                setState('error');
            }
        });
        return () => { active = false; };
    }, [token]);

    if (!token || state === 'signed-out') return <Navigate to="/login" replace />;
    if (state === 'checking') return <div className="auth"><p>Checking your session...</p></div>;
    if (state === 'error') return <div className="auth"><div className="card"><p role="alert">{error}</p><button onClick={() => window.location.reload()}>Retry connection</button></div></div>;
    return children;
}

function PriestOnly({ children }) {
    let user = {};
    try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch { /* invalid old cache */ }

    if (user.role !== 'priest') {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default function App() {
    return (
        <Routes>
            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/"
                element={
                    <Protected>
                        <Layout />
                    </Protected>
                }
            >
                <Route
                    index
                    element={<Dashboard />}
                />

                <Route
                    path="appointments"
                    element={<Appointments />}
                />

                <Route
                    path="reservations"
                    element={<Reservations />}
                />

                <Route
                    path="ministries"
                    element={<Ministries />}
                />

                <Route
                    path="announcements"
                    element={<Announcements />}
                />

                <Route
                    path="document-requests"
                    element={<DocumentRequests />}
                />

                <Route
                    path="parishioners"
                    element={<Parishioners />}
                />

                <Route
                    path="staff/register"
                    element={
                        <PriestOnly>
                            <StaffRegister />
                        </PriestOnly>
                    }
                />
            </Route>

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}
