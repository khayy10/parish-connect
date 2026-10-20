
import axios from 'axios';

const baseURL = (
    import.meta.env.VITE_API_URL ||
    'https://parish-connect-backend.onrender.com/api'
).replace(/\/+$/, '');

const api = axios.create({
    baseURL: baseURL,
    timeout: 60000,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
});

// ADD TOKEN TO AUTHENTICATED REQUESTS

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        const publicRoutes = [
            '/login',
            '/register'
        ];

        if (
            token &&
            !publicRoutes.includes(config.url)
        ) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// HANDLE API ERRORS

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

export default api;
