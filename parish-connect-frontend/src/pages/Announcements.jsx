import {
    useEffect, useState
}
from 'react';
import api from '../services/api';
export default function Announcements() {
    const [x, setX] = useState([]), u = JSON.parse(localStorage.getItem('user') || '{}'), [f, setF] = useState({
        title: '', content: '', event_date: '', is_published: true
    });
    const load = () => api.get('/announcements').then(r => setX(r.data));
    useEffect(load, []);
    const add = async (e) => {
        e.preventDefault();
        await api.post('/announcements', f);
        setF({
            title: '', content: '', event_date: '', is_published: true
        });
        load();
    };
    return <>
    <header>
    <h1>Announcements</h1>
    </header>
    {
        u.role !== 'parishioner' && <form className='panel' onSubmit={add}>
        <input placeholder='Title' value={f.title} onChange={e => setF({
            ...f, title: e.target.value
        })
    }
    /><textarea placeholder='Announcement' value={f.content} onChange={e => setF({
        ...f, content: e.target.value
    })
}
/><input type='date' value={f.event_date} onChange={e => setF({
    ...f, event_date: e.target.value
})
}
/><button>Publish</button>
</form>
}
<div className='grid'>
{
    x.map(a => <article className='panel' key={a.id}>
    <h3>
    {
        a.title
    }
    </h3>
    <p>
    {
        a.content
    }
    </p>
    {
        a.event_date && <small>Event: {
            a.event_date
        }
        </small>
    }
    </article>)
}
</div>
</>;
}
