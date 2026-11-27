// T042: smoke test of every route declared in src/App.tsx.
// Renders the real App (real providers) inside a MemoryRouter, with the network and i18n mocked.
import { Suspense, type ReactNode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import ScrollToTop from '../Components/ScrollToTop';

// fetch (new services, GraphQL client, pages): every call resolves to an empty JSON object.
// Installed in vi.hoisted so it exists before any module captures the global.
vi.hoisted(() => {
  const emptyResponse = (): Response =>
    ({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({}),
      text: async () => '{}',
      blob: async () => new Blob([]),
      clone: () => emptyResponse(),
    }) as unknown as Response;

  globalThis.fetch = (async () => emptyResponse()) as typeof fetch;
});

// axios (legacy HttpClient): every verb resolves to an empty payload.
vi.mock('axios', () => {
  const response = { data: {}, status: 200, statusText: 'OK', headers: {}, config: {} };
  const resolve = () => Promise.resolve(response);
  const instance = {
    get: resolve,
    post: resolve,
    put: resolve,
    patch: resolve,
    delete: resolve,
    request: resolve,
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: () => 0, eject: (): void => undefined },
      response: { use: () => 0, eject: (): void => undefined },
    },
  };
  const axiosMock = { ...instance, create: () => instance, isAxiosError: () => false };
  return { default: axiosMock, ...axiosMock };
});

// Translations are not loaded: the i18next backend is a no-op.
vi.mock('i18next-http-backend', () => ({
  default: {
    type: 'backend',
    init: (): void => undefined,
    read: (_language: string, _namespace: string, callback: (error: unknown, data: object) => void): void =>
      callback(null, {}),
  },
}));

// react-i18next: t() returns the key.
vi.mock('react-i18next', async () => {
  const { createElement, Fragment } = await import('react');
  const t = (key: string | string[]): string => (Array.isArray(key) ? key[0] : key);
  const i18n = {
    language: 'pt',
    resolvedLanguage: 'pt',
    languages: ['pt'],
    changeLanguage: () => Promise.resolve(t),
    on: (): void => undefined,
    off: (): void => undefined,
    exists: () => true,
  };
  return {
    useTranslation: () => ({ t, i18n, ready: true }),
    Trans: ({ i18nKey, children }: { i18nKey?: string; children?: ReactNode }) =>
      createElement(Fragment, null, i18nKey ?? children),
    I18nextProvider: ({ children }: { children?: ReactNode }) => createElement(Fragment, null, children),
    initReactI18next: { type: '3rdParty', init: (): void => undefined },
  };
});

/** Every route of src/App.tsx (one concrete URL per route). */
const ROUTES = [
  '/',
  '/campaigns',
  '/campaigns/new',
  '/campaigns/1',
  '/campaigns/1/edit',
  '/campaigns/1/participants',
  '/campaigns/1/submissions',
  '/campaigns/1/winners',
  '/network',
  '/network/search',
  '/account',
  '/account/login',
  '/account/new-account',
  '/account/edit-account',
  '/account/recovery-password',
  '/account/change-password',
  '/admin',
  '/admin/dashboard',
  '/admin/network',
  '/admin/teams',
  '/admin/teams/2',
  '/admin/orders',
  '/admin/invoices',
  '/admin/products',
  '/admin/products/new',
  '/admin/products/1',
  '/admin/team-structure',
  '/admin/team-structure/new',
  '/admin/team-structure/1',
  '/c/abc',
  '/widget/abc',
  '/rota-inexistente',
];

/** Routes rendered without the Layout shell (no <main id="main">). */
const STANDALONE = ['/c/abc', '/widget/abc', '/rota-inexistente'];

/** Same tree as src/index.tsx, with MemoryRouter instead of BrowserRouter. */
const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ScrollToTop />
      <Suspense fallback="loading...">
        <App />
      </Suspense>
    </MemoryRouter>,
  );

/** Lets the mocked requests resolve and the resulting re-renders run. */
const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

describe('App routes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Routes are lazy (React.lazy): wait until every Suspense fallback is gone, i.e. the page chunk loaded.
  it.each(ROUTES)(
    'renders %s without throwing',
    async (path) => {
      const { container } = renderAt(path);

      await waitFor(() => expect(screen.queryByTestId('route-fallback')).not.toBeInTheDocument(), {
        timeout: 10000,
      });
      await flush();

      expect(container.firstChild).not.toBeNull();
      if (!STANDALONE.includes(path)) {
        expect(document.getElementById('main')).toBeInTheDocument();
      }
    },
    20000,
  );
});
