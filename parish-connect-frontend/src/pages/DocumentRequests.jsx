import { useEffect, useState } from 'react';
import { ClipboardList, FileText, Send, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import api, { getApiErrorMessage } from '../services/api';

const DOCUMENT_TYPES = [
    'Baptismal Certificate',
    'Confirmation Certificate',
    'Marriage Certificate',
    'Burial Certificate',
    'Other Parish Record',
];
const STATUS_OPTIONS = [
    ['pending', 'Pending'],
    ['in_review', 'Under Review'],
    ['ready_for_pickup', 'Ready for Pick-up'],
    ['released', 'Released'],
    ['rejected', 'Rejected'],
];
const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS);
const initialForm = {
    document_type: 'Baptismal Certificate',
    record_name: '',
    event_date: '',
    purpose: '',
    contact_number: '',
};

function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
}

function formatDate(value) {
    if (!value) return 'Not provided';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toLocaleDateString();
}

function StatusBadge({ status }) {
    return <span className={`badge document-status ${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export default function DocumentRequests() {
    const user = getCurrentUser();
    const isParishioner = user.role === 'parishioner';
    const [requests, setRequests] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [drafts, setDrafts] = useState({});
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        let active = true;
        api.get('/document-requests')
            .then(({ data }) => {
                if (!active) return;
                if (!Array.isArray(data)) throw new Error('Unexpected response from the document request API.');
                setRequests(data);
            })
            .catch(err => { if (active) setError(getApiErrorMessage(err)); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const refresh = async () => {
        const { data } = await api.get('/document-requests');
        if (!Array.isArray(data)) throw new Error('Unexpected response from the document request API.');
        setRequests(data);
    };

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');
        try {
            const payload = { ...form, event_date: form.event_date || null, contact_number: form.contact_number || null };
            await api.post('/document-requests', payload);
            setForm(initialForm);
            await refresh();
            setMessage('Request submitted! You can check its status below. The parish office will verify the records.');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const updateRequest = async (item) => {
        setSavingId(item.id);
        setError('');
        setMessage('');
        const draft = drafts[item.id] || {};
        try {
            await api.patch(`/document-requests/${item.id}`, {
                status: draft.status ?? item.status,
                staff_remarks: draft.staff_remarks ?? item.staff_remarks ?? '',
            });
            await refresh();
            setDrafts(previous => {
                const updated = { ...previous };
                delete updated[item.id];
                return updated;
            });
            setMessage(`Request #${item.id} updated successfully.`);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSavingId(null);
        }
    };

    const visible = filter === 'all' ? requests : requests.filter(item => item.status === filter);
    const pendingCount = requests.filter(item => item.status === 'pending').length;
    const readyCount = requests.filter(item => item.status === 'ready_for_pickup').length;

    return <>
        <header className="documents-heading">
            <h1><FileText aria-hidden="true" /> Church Document Requests</h1>
            <p>{isParishioner
                ? 'Request parish certificates and follow the progress of your application.'
                : 'Review and process church document requests from parishioners.'}</p>
        </header>

        <div className="document-overview">
            <div className="document-overview-card"><ClipboardList aria-hidden="true" /><div><strong>{requests.length}</strong><span>{isParishioner ? 'My requests' : 'Total requests'}</span></div></div>
            <div className="document-overview-card"><Clock3 aria-hidden="true" /><div><strong>{pendingCount}</strong><span>Pending</span></div></div>
            <div className="document-overview-card"><CheckCircle2 aria-hidden="true" /><div><strong>{readyCount}</strong><span>Ready for pick-up</span></div></div>
        </div>
        {error && <div className="error" role="alert">{error}</div>}
        {message && <div className="success" role="status">{message}</div>}

        {isParishioner && <section className="panel document-request-form" aria-labelledby="document-request-form-title">
            <div className="section-heading">
                <div><h2 id="document-request-form-title">Request a parish document</h2><p>Fill in the details as accurately as possible.</p></div>
                <span className="section-icon"><FileText aria-hidden="true" /></span>
            </div>
            <form onSubmit={submit}>
                <div className="document-fields">
                    <label>Document type *
                        <select value={form.document_type} onChange={event => setForm({ ...form, document_type: event.target.value })} required>
                            {DOCUMENT_TYPES.map(type => <option value={type} key={type}>{type}</option>)}
                        </select>
                    </label>
                    <label>Name on church record *
                        <input value={form.record_name} onChange={event => setForm({ ...form, record_name: event.target.value })} maxLength={255} placeholder="Full name as written on the record" required />
                    </label>
                    <label>Date of sacrament / event (if known)
                        <input type="date" value={form.event_date} onChange={event => setForm({ ...form, event_date: event.target.value })} />
                    </label>
                    <label>Contact number (optional)
                        <input type="tel" value={form.contact_number} maxLength={30} onChange={event => setForm({ ...form, contact_number: event.target.value })} placeholder="Mobile number" />
                    </label>
                    <label className="document-fields-wide">Purpose of request *
                        <textarea rows={3} value={form.purpose} maxLength={500} onChange={event => setForm({ ...form, purpose: event.target.value })} placeholder="e.g. School requirement, marriage preparation" required />
                    </label>
                </div>
                <div className="document-form-bottom">
                    <p><ShieldCheck aria-hidden="true" /> Submitting a request does not automatically issue an official certificate. The parish office must verify the record first.</p>
                    <button type="submit" disabled={saving}><Send aria-hidden="true" /> {saving ? 'Submitting...' : 'Submit Request'}</button>
                </div>
            </form>
        </section>}

        <section className="panel document-list" aria-labelledby="document-list-title">
            <div className="document-list-heading">
                <div><h2 id="document-list-title">{isParishioner ? 'My document requests' : 'Parishioner requests'}</h2><p>Track each request and its current status.</p></div>
                <label htmlFor="document-status-filter">Filter status
                    <select id="document-status-filter" value={filter} onChange={event => setFilter(event.target.value)}>
                        <option value="all">All statuses</option>
                        {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </label>
            </div>
            {loading ? <p>Loading requests...</p>
                : visible.length === 0 ? <div className="document-empty"><FileText aria-hidden="true" /><strong>No document requests found</strong><p>{isParishioner ? 'Use the form above to submit your first request.' : 'There are no requests matching this filter.'}</p></div>
                    : <div className="document-request-list">
                        {visible.map(item => {
                            const draft = drafts[item.id] || {};
                            return <article className="document-request-item" key={item.id}>
                                <div className="document-request-item-top">
                                    <div><span className="document-request-number">REQUEST #{item.id}</span><h3>{item.document_type}</h3><p>{item.record_name}</p></div>
                                    <StatusBadge status={item.status} />
                                </div>
                                <div className="document-request-meta">
                                    <span><b>Submitted:</b> {formatDate(item.created_at)}</span>
                                    <span><b>Event date:</b> {formatDate(item.event_date)}</span>
                                    {item.user && <span><b>Requested by:</b> {item.user.name} ({item.user.email})</span>}
                                    {item.contact_number && <span><b>Contact:</b> {item.contact_number}</span>}
                                    <span><b>Purpose:</b> {item.purpose}</span>
                                </div>
                                {isParishioner ? item.staff_remarks && <p className="document-office-note"><b>Parish office:</b> {item.staff_remarks}</p>
                                    : <div className="document-review">
                                        <label>Update status
                                            <select value={draft.status ?? item.status} onChange={event => setDrafts(previous => ({ ...previous, [item.id]: { ...previous[item.id], status: event.target.value } }))}>
                                                {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                            </select>
                                        </label>
                                        <label>Message to parishioner (optional)
                                            <textarea rows={2} maxLength={2000} value={draft.staff_remarks ?? item.staff_remarks ?? ''} onChange={event => setDrafts(previous => ({ ...previous, [item.id]: { ...previous[item.id], staff_remarks: event.target.value } }))} placeholder="e.g. Please bring a valid ID when claiming the document." />
                                        </label>
                                        <button type="button" disabled={savingId === item.id} onClick={() => updateRequest(item)}>
                                            {savingId === item.id ? 'Saving...' : 'Save Update'}
                                        </button>
                                    </div>}
                            </article>;
                        })}
                    </div>}
        </section>
    </>;
}
