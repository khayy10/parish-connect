import {
    useEffect, useState
}
from 'react';
import api from '../services/api';
export default function Dashboard() {
    const [d, setD] = useState({
    });
    useEffect(() => {
        api.get('/dashboard').then(r => setD(r.data));
    }, []);
    return <>
    <header>
    <h1>Dashboard</h1>
    <p>Welcome to ParishConnect.</p>
    </header>
    <div className='stats'>
    {
        Object.entries(d).map(([k, v]) => <div className='stat' key={k}>
        <strong>
        {
            v
        }
        </strong>
        <span>
        {
            k.replaceAll('_', ' ')
        }
        </span>
        </div>)
    }
    </div>
    </>;
}
