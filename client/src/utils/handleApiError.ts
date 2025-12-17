import axios from 'axios';

export interface ApiError {
  message: string;
  details?: unknown;
}

function isErrorPayload(obj: unknown): obj is { error: { message?: string; details?: unknown } } {
  if (!obj || typeof obj !== 'object') return false;
  const asRec = obj as unknown as Record<string, unknown>;
  const maybe = asRec['error'];
  return typeof maybe === 'object' && maybe !== null;
}

export default function handleApiError(err: unknown): ApiError {
  // Axios errors: they include `response.data.error` in our API shape
  if (axios.isAxiosError(err)) {
    const respData = err.response?.data;
    if (isErrorPayload(respData)) {
      return { message: respData.error.message || 'Request failed', details: respData.error.details };
    }

    const message = err instanceof Error ? err.message : String(err) || 'Request failed';
    return { message };
  }

  // Structured non-Axios objects that may contain a response.data.error
  if (err && typeof err === 'object') {
    const asObj = err as Record<string, unknown>;
    const resp = asObj['response'];
    const data = resp && typeof resp === 'object' ? (resp as Record<string, unknown>)['data'] : undefined;
    if (isErrorPayload(data)) {
      return { message: data.error.message || 'Request failed', details: data.error.details };
    }
  }

  if (err instanceof Error) return { message: err.message };
  return { message: 'Unknown error' };
}
