import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        api.get('/dashboard').then(({ data }) => {
            if (!active) return;
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                throw new Error('Unexpected dashboard response from the server.');
            }
            setStats(data);
            setError('');
        }).catch(err => {
            if (active) setError(err.message?.startsWith('Unexpected') ? err.message : getApiErrorMessage(err));
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, []);

    return <>
        <header><h1>Dashboard</h1><p>Welcome to ParishConnect.</p></header>
        {loading && <p role="status">Loading dashboard...</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <div className="stats">
            {Object.entries(stats).map(([key, value]) => <div className="stat" key={key}>
                <strong>{value == null ? '—' : String(value)}</strong>
                <span>{key.replaceAll('_', ' ')}</span>
            </div>)}
        </div>
    </>;
}
