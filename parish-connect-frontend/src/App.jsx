
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

function Protected({ children }) {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function PriestOnly({ children }) {
    const user = JSON.parse(
        localStorage.getItem('user') || '{}'
    );

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
