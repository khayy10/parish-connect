import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';

export default function Parishioners() {
    const [parishioners, setParishioners] = useState([]);
    const [query, setQuery] = useState('');
    const [error, setError] = useState('');

    const load = async (search = '', isActive = () => true) => {
        try {
            const { data } = await api.get('/parishioners', { params: { q: search } });
            if (!isActive()) return;
            if (!Array.isArray(data?.data)) throw new Error('Unexpected parishioners response from the server.');
            setParishioners(data.data);
            setError('');
        } catch (err) {
            if (isActive()) setError(err.message?.startsWith('Unexpected') ? err.message : getApiErrorMessage(err));
        }
    };

    useEffect(() => {
        let active = true;
        void load('', () => active);
        return () => { active = false; };
    }, []);

    return <>
        <header><h1>Parishioners</h1></header>
        {error && <p className="error" role="alert">{error}</p>}
        <form className="panel search" onSubmit={e => { e.preventDefault(); void load(query); }}>
            <input aria-label="Search name" placeholder="Search name" value={query} onChange={e => setQuery(e.target.value)} />
            <button type="submit">Search</button>
        </form>
        <div className="panel table"><table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th></tr></thead>
            <tbody>{parishioners.map(person => <tr key={person.id}>
                <td>{[person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ')}</td>
                <td>{person.user?.email}</td><td>{person.phone}</td><td>{person.address}</td>
            </tr>)}</tbody>
        </table></div>
    </>;
}
