import {
    useEffect, useState
}
from 'react';
import api from '../services/api';
export default function Reservations() {
    const [x, setX] = useState([]), [f, setF] = useState({
        facility: 'Parish Hall', event_name: '', reservation_date: '', start_time: '08:00', end_time: '10:00', purpose: ''
    }), [msg, setMsg] = useState('');
    const load = () => api.get('/reservations').then(r => setX(r.data));
    useEffect(load, []);
    const add = async (e) => {
        e.preventDefault();
        try {
            await api.post('/reservations', f);
            setMsg('Reservation submitted.');
            load();
        }
        catch (x) {
            setMsg(x.response?.data?.message || 'Unable to submit');
        }
    };
    return <>
    <header>
    <h1>Facility Reservations</h1>
    </header>
    {
        msg && <p>
        {
            msg
        }
        </p>
    }
    <form className='panel formrow' onSubmit={add}>
    <input value={f.facility} onChange={e => setF({
        ...f, facility: e.target.value
    })
}
/><input placeholder='Event name' value={f.event_name} onChange={e => setF({
    ...f, event_name: e.target.value
})
}
required/><input type='date' value={f.reservation_date} onChange={e => setF({
    ...f, reservation_date: e.target.value
})
}
required/><input type='time' value={f.start_time} onChange={e => setF({
    ...f, start_time: e.target.value
})
}
/><input type='time' value={f.end_time} onChange={e => setF({
    ...f, end_time: e.target.value
})
}
/><button>Request</button>
</form>
<div className='panel'>
{
    x.map(r => <div className='row' key={r.id}>
    <b>
    {
        r.event_name
    }
    </b>
    <span>
    {
        r.facility
    }
    · {
        r.reservation_date
    }
    · {
        r.status
    }
    </span>
    </div>)
}
</div>
</>;
}
