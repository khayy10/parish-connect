import {
    Routes, Route, Navigate
}
from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Reservations from './pages/Reservations';
import Ministries from './pages/Ministries';
import Announcements from './pages/Announcements';
import Parishioners from './pages/Parishioners';
const P = ({
    children
}) => localStorage.getItem('token') ? children : <Navigate to='/login'/>;
export default function App() {
    return <Routes>
    <Route path='/login' element={<Login />
}
/><Route path='/register' element={<Register />
}
/><Route path='/' element={<P>
<Layout />
</P>
}
><Route index element={<Dashboard />
}
/><Route path='appointments' element={<Appointments />
}
/><Route path='reservations' element={<Reservations />
}
/><Route path='ministries' element={<Ministries />
}
/><Route path='announcements' element={<Announcements />
}
/><Route path='parishioners' element={<Parishioners />
}
/></Route>
</Routes>;
}
