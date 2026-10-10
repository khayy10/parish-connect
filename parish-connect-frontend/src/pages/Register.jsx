import {
    useState
}
from 'react';
import {
    Link, useNavigate
}
from 'react-router-dom';
import api from '../services/api';
export default function Register() {
    const [d, setD] = useState({
        name: '', email: '', phone: '', password: '', password_confirmation: ''
    }), [err, setErr] = useState(''), n = useNavigate();
    const go = async (e) => {
        e.preventDefault();
        try {
            const r = await api.post('/register', d);
            localStorage.setItem('token', r.data.token);
            localStorage.setItem('user', JSON.stringify(r.data.user));
            n('/');
        }
        catch (x) {
            setErr(Object.values(x.response?.data?.errors || {
            }).flat().join(' ') || x.response?.data?.message || 'Registration failed');
        }
    };
    return <div className='auth'>
    <form className='card' onSubmit={go}>
    <h1>Create Account</h1>
    {
        err && <div className='error'>
        {
            err
        }
        </div>
    }
    {
        ['name', 'email', 'phone', 'password', 'password_confirmation'].map(k => <label key={k}>
        {
            k.replace('_', ' ')
        }
        <input type={k.includes('password') ? 'password' : k === 'email' ? 'email' : 'text'} value={d[k]} onChange={e => setD({
            ...d, [k]: e.target.value
        })
    }
    /></label>)
}
<button>Register</button>
<p>
<Link to='/login'>Back to login</Link>
</p>
</form>
</div>;
}
