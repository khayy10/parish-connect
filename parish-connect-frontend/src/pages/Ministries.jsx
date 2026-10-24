import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';

export default function Ministries() {
    const [ministries, setMinistries] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        api.get('/ministries').then(({ data }) => {
            if (!active) return;
            if (!Array.isArray(data)) throw new Error('Unexpected ministries response from the server.');
            setMinistries(data);
        }).catch(err => {
            if (active) setError(err.message?.startsWith('Unexpected') ? err.message : getApiErrorMessage(err));
        });
        return () => { active = false; };
    }, []);

    return <>
        <header><h1>Ministries</h1><p>Parish ministries, coordinators and members.</p></header>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="grid">
            {ministries.map(ministry => <div className="panel" key={ministry.id}>
                <h3>{ministry.name}</h3><p>{ministry.description}</p>
                <small>Coordinator: {ministry.coordinator?.name || 'Not assigned'}</small>
                <p>{ministry.members?.length || 0} member(s)</p>
            </div>)}
        </div>
    </>;
}
