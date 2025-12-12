import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

if (!import.meta.env.VITE_API_URL) {
  // warn in dev that env var is missing and fallback is used
  // keep a small console warning to help catch config mistakes
  // (this is safe in dev; you can remove for production builds)
  // eslint-disable-next-line no-console
  console.warn('VITE_API_URL is not set — falling back to http://localhost:5000');
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request: attach token if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore storage errors
  }
  return config;
});

// Response: handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem('token');
      } catch {
        // ignore storage errors
      }
      // Emit an event so application-level logic (AuthContext) can handle logout/redirect.
      // This decouples the API layer from navigation so the app can respond centrally.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(err);
  },
);

export default api;
