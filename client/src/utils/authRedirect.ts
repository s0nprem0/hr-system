import { safeGetItem, safeSetItem, safeRemoveItem } from './storage';

const REDIRECT_KEY = 'postLoginRedirect';

export function setPostLoginRedirect(path: string) {
  try {
    safeSetItem(REDIRECT_KEY, path);
  } catch {
    // ignore
  }
}

export function getAndClearPostLoginRedirect(): string | null {
  try {
    const v = safeGetItem(REDIRECT_KEY);
    safeRemoveItem(REDIRECT_KEY);
    return v || null;
  } catch {
    return null;
  }
}

export function redirectToLogin(navigate?: (to: string, opts?: any) => void, currentPath?: string) {
  const path = currentPath ?? (typeof window !== 'undefined' ? window.location.pathname + (window.location.search || '') : '/');
  setPostLoginRedirect(path);
  if (navigate) {
    navigate('/login');
  } else if (typeof window !== 'undefined' && typeof window.location?.replace === 'function') {
    window.location.replace('/login');
  }
}

export function handleUnauthorized(redirectFn?: (path: string) => void) {
  try {
    safeRemoveItem('token');
    safeRemoveItem('refreshToken');
  } catch {
    // ignore
  }
  if (redirectFn) {
    redirectFn('/login');
  } else {
    redirectToLogin();
  }
}
