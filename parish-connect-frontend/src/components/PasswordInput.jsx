import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/** Reusable, accessible show/hide field. Does not change form values or API requests. */
export default function PasswordInput({ id, name, value, onChange, label = 'password', ...inputProps }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="password-field">
            <input
                {...inputProps}
                id={id}
                name={name}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
            />
            <button
                className="password-toggle"
                type="button"
                aria-label={`${visible ? 'Hide' : 'Show'} ${label}`}
                aria-pressed={visible}
                aria-controls={id}
                title={`${visible ? 'Hide' : 'Show'} ${label}`}
                onClick={() => setVisible(current => !current)}
            >
                {visible ? <EyeOff aria-hidden="true" size={19} /> : <Eye aria-hidden="true" size={19} />}
            </button>
        </div>
    );
}
