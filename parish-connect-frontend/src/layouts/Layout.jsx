
import {
    NavLink,
    Outlet,
    useNavigate
} from 'react-router-dom';

import {
    Church,
    LayoutDashboard,
    CalendarDays,
    Building2,
    Users,
    Newspaper,
    LogOut,
    UserPlus
} from 'lucide-react';

import api from '../services/api';

export default function Layout() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem('user') || '{}'
    );

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error(error);
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        navigate('/login');
    };

    return (
        <div className="shell">
            <aside>
                <div className="brand">
                    <Church />
                    ParishConnect
                </div>

                <small>
                    {user.name}
                    <br />
                    {user.role}
                </small>

                <nav>
                    <NavLink to="/" end>
                        <LayoutDashboard />
                        Dashboard
                    </NavLink>

                    <NavLink to="/appointments">
                        <CalendarDays />
                        Appointments
                    </NavLink>

                    <NavLink to="/reservations">
                        <Building2 />
                        Reservations
                    </NavLink>

                    <NavLink to="/ministries">
                        <Users />
                        Ministries
                    </NavLink>

                    <NavLink to="/announcements">
                        <Newspaper />
                        Announcements
                    </NavLink>

                    {user.role !== 'parishioner' && (
                        <NavLink to="/parishioners">
                            <Users />
                            Parishioners
                        </NavLink>
                    )}

                    {user.role === 'priest' && (
                        <NavLink to="/staff/register">
                            <UserPlus />
                            Register Parish Staff
                        </NavLink>
                    )}
                </nav>

                <button
                    className="logout"
                    onClick={logout}
                >
                    <LogOut />
                    Logout
                </button>
            </aside>

            <main>
                <Outlet />
            </main>
        </div>
    );
}
