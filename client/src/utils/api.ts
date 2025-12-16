import axios from 'axios';
import { safeGetItem, safeSetItem, safeRemoveItem } from './storage';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

if (!import.meta.env.VITE_API_URL) {
  // warn in dev that env var is missing and fallback is used
  // keep a small console warning to help catch config mistakes
  // (this is safe in dev; you can remove for production builds)
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
  const token = safeGetItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: handle 401 globally
// Token refresh flow: when a request gets 401, attempt to refresh access token using refresh token.
let isRefreshing = false;
type Subscriber = { resolve: (token: string) => void; reject: (err: unknown) => void };
let refreshSubscribers: Subscriber[] = [];

function subscribeToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    refreshSubscribers.push({ resolve, reject });
  });
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((s) => s.resolve(token));
  refreshSubscribers = [];
}

function onRefreshFailed(err: unknown) {
  refreshSubscribers.forEach((s) => s.reject(err));
  refreshSubscribers = [];
}

async function refreshAuth(): Promise<string> {
  const refreshToken = safeGetItem('refreshToken');
  if (!refreshToken) return Promise.reject({ response: { data: { error: { message: 'No refresh token' } } }, status: 401 });
  const resp = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
  if (!resp.data?.success) {
    const remoteErr = resp.data?.error;
    return Promise.reject({ response: { data: { error: { message: remoteErr?.message || 'Refresh failed', details: remoteErr?.details } } }, status: resp.status ?? 401 });
  }
  const newToken = resp.data?.data?.token;
  const newRefresh = resp.data?.data?.refreshToken;
  if (!newToken) return Promise.reject({ response: { data: { error: { message: 'No token in refresh response' } } }, status: 500 });
  safeSetItem('token', newToken);
  if (newRefresh) safeSetItem('refreshToken', newRefresh);
  return newToken;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const status = err?.response?.status;
    // avoid trying to refresh if the failing request was the refresh endpoint itself
    const isRefreshEndpoint = originalRequest?.url?.includes('/api/auth/refresh');
    if (status === 401 && !originalRequest?._retry && !isRefreshEndpoint) {
      // mark request as retried to avoid loops
      originalRequest._retry = true;

      // create subscriber promise first so we don't miss the resolution
      const pending = subscribeToken();

      // start refresh if not already in progress (do not await here)
      if (!isRefreshing) {
        isRefreshing = true;
        refreshAuth()
          .then((newToken) => {
            isRefreshing = false;
            onRefreshed(newToken);
          })
          .catch((refreshErr) => {
            isRefreshing = false;
            safeRemoveItem('token');
            safeRemoveItem('refreshToken');
            onRefreshFailed(refreshErr);
            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { reason: 'refresh_failed' } }));
          });
      }

      try {
        const token = await pending;
        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return Promise.reject(err);
  },
);

export default api;
