import axios from 'axios';

export interface ApiError {
  message: string;
  details?: any;
}

export default function handleApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const resp = (err.response as any)?.data?.error;
    const message = resp?.message || err.message || 'Request failed';
    const details = resp?.details;
    return { message, details };
  }
  if (err instanceof Error) return { message: err.message };
  return { message: 'Unknown error' };
}
