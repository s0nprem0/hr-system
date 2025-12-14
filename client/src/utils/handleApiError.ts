import axios from 'axios';

export interface ApiError {
  message: string;
  details?: unknown;
}

export default function handleApiError(err: unknown): ApiError {
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

  if (err instanceof Error) return { message: err.message };
  return { message: 'Unknown error' };
}
