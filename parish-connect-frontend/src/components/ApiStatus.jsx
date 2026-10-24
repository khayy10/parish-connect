import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ApiStatus() {
    const [state, setState] = useState({ kind: 'checking', text: 'Checking connection to the parish server...' });
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let active = true;
        setState({ kind: 'checking', text: 'Checking connection to the parish server...' });
        api.get('/health', { timeout: 25000 })
            .then(({ data }) => {
                if (!active) return;
                setState(data?.status === 'ok' && data?.database === 'connected'
                    ? { kind: 'ok', text: 'Server and database connected.' }
                    : { kind: 'error', text: 'The server responded, but its database is not ready.' });
            })
            .catch((error) => {
                if (!active) return;
                const status = error.response?.status;
                setState({
                    kind: 'error',
                    text: status === 404
                        ? 'API not found (404). Check Vercel /api rewrites and Render backend URL.'
                        : status === 503
                            ? 'Database unavailable (503). Check Render database settings.'
                            : 'Cannot reach the server. Check the Render deployment and API routing.',
                });
            });
        return () => { active = false; };
    }, [retry]);

    return <div className={`api-status api-status--${state.kind}`} role="status">
        <span>{state.text}</span>
        {state.kind === 'error' && <button className="link-button" type="button" onClick={() => setRetry(n => n + 1)}>Retry</button>}
    </div>;
}
