export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    // log and return null so callers can handle missing value
    // avoid throwing to prevent breaking app in restrictive environments
    // eslint-disable-next-line no-console
    console.warn(`storage:getItem failed for ${key}:`, err);
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`storage:setItem failed for ${key}:`, err);
    return false;
  }
}

export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`storage:removeItem failed for ${key}:`, err);
    return false;
  }
}

export default { safeGetItem, safeSetItem, safeRemoveItem };
