import {
    NavLink, Outlet, useNavigate
}
from 'react-router-dom';
import {
    Church, LayoutDashboard, CalendarDays, Building2, Users, Newspaper, LogOut
}
from 'lucide-react';
import api from '../services/api';
export default function Layout() {
    const n = useNavigate(), u = JSON.parse(localStorage.getItem('user') || '{}');
    const out = async () => {
        try {
            await api.post('/logout');
        }
        catch {
        }
        localStorage.clear();
        n('/login');
    };
    return <div className='shell'>
    <aside>
    <div className='brand'>
    <Church /> ParishConnect</div>
    <small>
    {
        u.name
    }
    <br />
    {
        u.role
    }
    </small>
    <nav>
    <NavLink to='/'>
    <LayoutDashboard />Dashboard</NavLink>
    <NavLink to='/appointments'>
    <CalendarDays />Appointments</NavLink>
    <NavLink to='/reservations'>
    <Building2 />Reservations</NavLink>
    <NavLink to='/ministries'>
    <Users />Ministries</NavLink>
    <NavLink to='/announcements'>
    <Newspaper />Announcements</NavLink>
    {
        u.role !== 'parishioner' && <NavLink to='/parishioners'>
        <Users />Parishioners</NavLink>
    }
    </nav>
    <button className='logout' onClick={out}>
    <LogOut />Logout</button>
    </aside>
    <main>
    <Outlet />
    </main>
    </div>;
}
