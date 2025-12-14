import axios from 'axios';

export interface ApiError {
  message: string;
  details?: unknown;
}

export default function handleApiError(err: unknown): ApiError {
  // Axios errors: they include `response.data.error` in our API shape
  if (axios.isAxiosError(err)) {
    const respData = err.response?.data as unknown;
    let respError: { message?: string; details?: unknown } | undefined;

    if (respData && typeof respData === 'object' && 'error' in (respData as Record<string, unknown>)) {
      const maybe = (respData as Record<string, unknown>)['error'];
      if (maybe && typeof maybe === 'object') respError = maybe as { message?: string; details?: unknown };
    }

    const message = respError?.message || (err instanceof Error ? err.message : String(err)) || 'Request failed';
    const details = respError?.details;
    return { message, details };
  }

  // Structured non-Axios errors (e.g., created by our refresh flow) with the same shape
  if (err && typeof err === 'object') {
    const asObj = err as Record<string, unknown>;
    const resp = asObj['response'] as unknown;
    if (resp && typeof resp === 'object') {
      const data = (resp as Record<string, unknown>)['data'] as unknown;
      if (data && typeof data === 'object' && 'error' in (data as Record<string, unknown>)) {
        const maybe = (data as Record<string, unknown>)['error'];
        if (maybe && typeof maybe === 'object') {
          const me = maybe as { message?: string; details?: unknown };
          return { message: me.message || 'Request failed', details: me.details };
        }
      }
    }
  }

  if (err instanceof Error) return { message: err.message };
  return { message: 'Unknown error' };
}
