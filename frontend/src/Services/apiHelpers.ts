const AUTH_STORAGE_KEY = 'login-with-metamask:auth';

/** Get the API base URL from environment */
export const getApiUrl = (): string => {
  return process.env.REACT_APP_API_URL || 'https://localhost:44374';
};

/** Get the auth token from localStorage */
export const getToken = (): string | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.token || null;
  } catch {
    return null;
  }
};

/**
 * Get request headers.
 * @param auth If true, includes Authorization header with stored token.
 */
export const getHeaders = (auth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Basic ${token}`;
    }
  }
  return headers;
};

/** Save auth session to localStorage */
export const saveSession = (session: unknown): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

/** Load auth session from localStorage */
export const loadSession = <T>(): T | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

/** Clear auth session from localStorage */
export const clearSession = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
