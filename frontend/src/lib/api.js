import axios from 'axios';

// In dev, Vite proxies '/api' to the local backend. In production (e.g. Vercel),
// the backend lives on a separate host, so VITE_API_URL must point at it.
const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const api = axios.create({ baseURL });

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('af_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('af_token');
      localStorage.removeItem('af_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
