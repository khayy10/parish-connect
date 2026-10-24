import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';

export default function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [form, setForm] = useState({ facility: 'Parish Hall', event_name: '', reservation_date: '', start_time: '08:00', end_time: '10:00', purpose: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);

    const load = async (isActive = () => true) => {
        try {
            const { data } = await api.get('/reservations');
            if (!isActive()) return;
            if (!Array.isArray(data)) throw new Error('Unexpected reservations response from the server.');
            setReservations(data);
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

    const add = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setSaving(true);
        try {
            await api.post('/reservations', form);
            setMessage('Reservation submitted.');
            setForm(previous => ({ ...previous, event_name: '', purpose: '' }));
            await load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return <>
        <header><h1>Facility Reservations</h1></header>
        {error && <p className="error" role="alert">{error}</p>}
        {message && <p className="success" role="status">{message}</p>}
        <form className="panel formrow" onSubmit={add}>
            <input aria-label="Facility" value={form.facility} onChange={e => setForm({ ...form, facility: e.target.value })} required />
            <input aria-label="Event name" placeholder="Event name" value={form.event_name} onChange={e => setForm({ ...form, event_name: e.target.value })} required />
            <input aria-label="Reservation date" type="date" value={form.reservation_date} onChange={e => setForm({ ...form, reservation_date: e.target.value })} required />
            <input aria-label="Start time" type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required />
            <input aria-label="End time" type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required />
            <button type="submit" disabled={saving}>{saving ? 'Submitting...' : 'Request'}</button>
        </form>
        <div className="panel">
            {reservations.map(item => <div className="row" key={item.id}>
                <b>{item.event_name}</b>
                <span>{item.facility} · {item.reservation_date} · {item.status}</span>
            </div>)}
        </div>
    </>;
}
