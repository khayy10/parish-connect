import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [form, setForm] = useState({ service_type: 'Baptism', preferred_date: '', preferred_time: '09:00', purpose: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);

    const load = async (isActive = () => true) => {
        try {
            const { data } = await api.get('/appointments');
            if (!isActive()) return;
            if (!Array.isArray(data)) throw new Error('Unexpected appointments response from the server.');
            setAppointments(data);
            setError('');
        } catch (err) {
            if (isActive()) setError(err.message?.startsWith('Unexpected') ? err.message : getApiErrorMessage(err));
        }
    };

    useEffect(() => {
        let active = true;
        // Effects must return only a cleanup function, never an Axios Promise.
        void load(() => active);
        return () => { active = false; };
    }, []);

    const add = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');
        try {
            await api.post('/appointments', form);
            setForm(previous => ({ ...previous, preferred_date: '', purpose: '' }));
            setMessage('Appointment request submitted.');
            await load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return <>
        <header><h1>Appointments</h1><p>Request baptism, wedding, blessing or counseling schedules.</p></header>
        {error && <p className="error" role="alert">{error}</p>}
        {message && <p className="success" role="status">{message}</p>}
        <form className="panel formrow" onSubmit={add}>
            <select aria-label="Service type" value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })}>
                {['Baptism', 'Wedding', 'Blessing', 'Counseling'].map(value => <option key={value} value={value}>{value}</option>)}
            </select>
            <input aria-label="Preferred date" type="date" value={form.preferred_date} onChange={e => setForm({ ...form, preferred_date: e.target.value })} required />
            <input aria-label="Preferred time" type="time" value={form.preferred_time} onChange={e => setForm({ ...form, preferred_time: e.target.value })} required />
            <input aria-label="Purpose" placeholder="Purpose" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
            <button type="submit" disabled={saving}>{saving ? 'Submitting...' : 'Submit'}</button>
        </form>
        <div className="panel table"><table>
            <thead><tr><th>Service</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>{appointments.map(item => <tr key={item.id}>
                <td>{item.service_type}</td><td>{item.preferred_date}</td><td>{item.preferred_time}</td>
                <td><span className={'badge ' + item.status}>{item.status}</span></td>
            </tr>)}</tbody>
        </table></div>
    </>;
}
