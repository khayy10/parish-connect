import {
    useEffect, useState
}
from 'react';
import api from '../services/api';
export default function Appointments() {
    const [x, setX] = useState([]), [f, setF] = useState({
        service_type: 'Baptism', preferred_date: '', preferred_time: '09:00', purpose: ''
    });
    const load = () => api.get('/appointments').then(r => setX(r.data));
    useEffect(load, []);
    const add = async (e) => {
        e.preventDefault();
        await api.post('/appointments', f);
        setF({
            ...f, preferred_date: '', purpose: ''
        });
        load();
    };
    return <>
    <header>
    <h1>Appointments</h1>
    <p>Request baptism, wedding, blessing or counseling schedules.</p>
    </header>
    <form className='panel formrow' onSubmit={add}>
    <select value={f.service_type} onChange={e => setF({
        ...f, service_type: e.target.value
    })
}
>{
    ['Baptism', 'Wedding', 'Blessing', 'Counseling'].map(v => <option>
    {
        v
    }
    </option>)
}
</select>
<input type='date' value={f.preferred_date} onChange={e => setF({
    ...f, preferred_date: e.target.value
})
}
required/><input type='time' value={f.preferred_time} onChange={e => setF({
    ...f, preferred_time: e.target.value
})
}
/><input placeholder='Purpose' value={f.purpose} onChange={e => setF({
    ...f, purpose: e.target.value
})
}
/><button>Submit</button>
</form>
<Table rows={x}/>
</>;
}
function Table({
    rows
}) {
    return <div className='panel table'>
    <table>
    <thead>
    <tr>
    <th>Service</th>
    <th>Date</th>
    <th>Time</th>
    <th>Status</th>
    </tr>
    </thead>
    <tbody>
    {
        rows.map(r => <tr key={r.id}>
        <td>
        {
            r.service_type
        }
        </td>
        <td>
        {
            r.preferred_date
        }
        </td>
        <td>
        {
            r.preferred_time
        }
        </td>
        <td>
        <span className={'badge ' + r.status}>
        {
            r.status
        }
        </span>
        </td>
        </tr>)
    }
    </tbody>
    </table>
    </div>;
}
