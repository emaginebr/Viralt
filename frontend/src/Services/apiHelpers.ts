const AUTH_STORAGE_KEY = 'login-with-metamask:auth';
const PARTICIPANT_TOKEN_PREFIX = 'viralt:participant:';

/**
 * Get the API base URL from environment (no trailing slash).
 * Empty `VITE_API_URL` = same origin: requests go to `/api/...` and `/graphql` on the current host.
 */
export const getApiUrl = (): string => {
  return (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
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

/** Logged-in user id from the stored session, or null. */
export const getSessionUserId = (): number | null => {
  const session = loadSession<{ userId?: number }>();
  return session && typeof session.userId === 'number' ? session.userId : null;
};

/**
 * Participant token (returned by POST /api/Public/register), kept per campaign slug so a returning
 * visitor keeps their entries. Storage errors (private mode, blocked third-party storage in the
 * widget iframe) are ignored: the token then lives only in memory.
 */
export const saveParticipantToken = (slug: string, token: string): void => {
  try {
    localStorage.setItem(`${PARTICIPANT_TOKEN_PREFIX}${slug}`, token);
  } catch {
    /* storage unavailable */
  }
};

/** Stored participant token for a campaign slug, or null. */
export const loadParticipantToken = (slug: string): string | null => {
  try {
    return localStorage.getItem(`${PARTICIPANT_TOKEN_PREFIX}${slug}`);
  } catch {
    return null;
  }
};

/** Forget the participant token of a campaign slug. */
export const clearParticipantToken = (slug: string): void => {
  try {
    localStorage.removeItem(`${PARTICIPANT_TOKEN_PREFIX}${slug}`);
  } catch {
    /* storage unavailable */
  }
};
