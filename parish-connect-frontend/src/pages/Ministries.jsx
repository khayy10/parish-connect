import {
    useEffect, useState
}
from 'react';
import api from '../services/api';
export default function Ministries() {
    const [x, setX] = useState([]);
    useEffect(() => {
        api.get('/ministries').then(r => setX(r.data));
    }, []);
    return <>
    <header>
    <h1>Ministries</h1>
    <p>Parish ministries, coordinators and members.</p>
    </header>
    <div className='grid'>
    {
        x.map(m => <div className='panel' key={m.id}>
        <h3>
        {
            m.name
        }
        </h3>
        <p>
        {
            m.description
        }
        </p>
        <small>Coordinator: {
            m.coordinator?.name || 'Not assigned'
        }
        </small>
        <p>
        {
            m.members?.length || 0
        }
        member(s)</p>
        </div>)
    }
    </div>
    </>;
}
