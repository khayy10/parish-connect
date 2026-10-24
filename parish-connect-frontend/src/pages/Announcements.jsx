import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [form, setForm] = useState({ title: '', content: '', event_date: '', is_published: true });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    let user = {};
    try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch { /* ignore malformed cache */ }

    const load = async (isActive = () => true) => {
        try {
            const { data } = await api.get('/announcements');
            if (!isActive()) return;
            if (!Array.isArray(data)) throw new Error('Unexpected announcements response from the server.');
            setAnnouncements(data);
            setError('');
        } catch (err) {
            if (isActive()) setError(err.message?.startsWith('Unexpected') ? err.message : getApiErrorMessage(err));
        }
    };

    useEffect(() => {
        let active = true;
        void load(() => active);
        return () => { active = false; };
    }, []);

    const add = async event => {
        event.preventDefault();
        setError('');
        setMessage('');
        try {
            await api.post('/announcements', form);
            setForm({ title: '', content: '', event_date: '', is_published: true });
            setMessage('Announcement published.');
            await load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    return <>
        <header><h1>Announcements</h1></header>
        {error && <p className="error" role="alert">{error}</p>}
        {message && <p className="success" role="status">{message}</p>}
        {user.role !== 'parishioner' && <form className="panel" onSubmit={add}>
            <input aria-label="Announcement title" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea aria-label="Announcement content" placeholder="Announcement" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
            <input aria-label="Event date" type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
            <button type="submit">Publish</button>
        </form>}
        <div className="grid">
            {announcements.map(item => <article className="panel" key={item.id}>
                <h3>{item.title}</h3><p>{item.content}</p>
                {item.event_date && <small>Event: {item.event_date}</small>}
            </article>)}
        </div>
    </>;
}
