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
// Token refresh flow: when a request gets 401, attempt to refresh access token using refresh token.
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeToken(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAuth(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');
  const resp = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
  if (!resp.data?.success) throw new Error('Refresh failed');
  const newToken = resp.data?.data?.token;
  if (!newToken) throw new Error('No token in refresh response');
  try {
    localStorage.setItem('token', newToken);
  } catch {
    // ignore
  }
  return newToken;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const status = err?.response?.status;
    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAuth();
          isRefreshing = false;
          onRefreshed(newToken);
        } catch (refreshErr) {
          isRefreshing = false;
          // emit unauthorized for app to handle logout/redirect
          if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          return Promise.reject(refreshErr);
        }
      }

      return new Promise((resolve) => {
        subscribeToken((token: string) => {
          if (!originalRequest.headers) originalRequest.headers = {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axios(originalRequest));
        });
      });
    }
    return Promise.reject(err);
  },
);

export default api;
