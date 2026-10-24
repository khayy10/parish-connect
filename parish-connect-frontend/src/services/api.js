import axios from 'axios';

// Default: Vercel same-origin /api rewrite (and Vite proxy locally).
// Optional override: Set VITE_API_URL to the full real Render API URL
// e.g. https://YOUR-RENDER-SERVICE.onrender.com/api if Vercel rewrites fail.
// Do not use https://api.example.com (placeholder); no trailing slash needed.
const configuredURL = (import.meta.env.VITE_API_URL || '').trim();
const baseURL = configuredURL ? configuredURL.replace(/\/+$/, '') : '/api';

const api = axios.create({
    baseURL,
    timeout: 90000, // Allows time for a sleeping Render service to start.
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && !['/login', '/register'].includes(config.url)) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export function getApiErrorMessage(error, fallback = 'Request failed. Please try again.') {
    const validationErrors = error.response?.data?.errors;
    if (validationErrors && typeof validationErrors === 'object') {
        return Object.values(validationErrors).flat().join(' ');
    }

    const apiMessage = error.response?.data?.message;
    if (apiMessage && error.response.status < 500) return apiMessage;

    const status = error.response?.status;
    if (status === 404) return 'API endpoint not found (404). Verify the Vercel Root Directory, /api rewrites, and Render backend URL.';
    if (status === 429) return 'Too many attempts. Please wait a minute and try again.';
    if (status === 502 || status === 503 || status === 504) {
        return 'The backend or database is unavailable. Please check /api/health and the Render deployment.';
    }
    if (status >= 500) return 'The server encountered an error. Check Render logs and database settings.';
    if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Try again.';
    if (!error.response) return 'Cannot connect to the API. Check /api/health and the backend service.';
    return apiMessage || fallback;
}

export default api;
