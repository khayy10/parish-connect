import {
    useEffect, useState
}
from 'react';
import api from '../services/api';
export default function Parishioners() {
    const [x, setX] = useState([]), [q, setQ] = useState('');
    const load = () => api.get('/parishioners', {
        params: {
            q
        }
    }).then(r => setX(r.data.data));
    useEffect(load, []);
    return <>
    <header>
    <h1>Parishioners</h1>
    </header>
    <div className='panel search'>
    <input placeholder='Search name' value={q} onChange={e => setQ(e.target.value)
}
/><button onClick={load}>Search</button>
</div>
<div className='panel table'>
<table>
<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Phone</th>
<th>Address</th>
</tr>
</thead>
<tbody>
{
    x.map(p => <tr key={p.id}>
    <td>
    {
        p.first_name
    }
    {
        p.middle_name
    }
    {
        p.last_name
    }
    </td>
    <td>
    {
        p.user?.email
    }
    </td>
    <td>
    {
        p.phone
    }
    </td>
    <td>
    {
        p.address
    }
    </td>
    </tr>)
}
</tbody>
</table>
</div>
</>;
}
