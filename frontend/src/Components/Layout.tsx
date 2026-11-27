import { Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header, { type HeaderVariant } from './Header';
import RouteFallback from './RouteFallback';

/** Organizer routes get the panel shell (sidebar); the rest gets the public header. */
const PANEL_PREFIXES = ['/campaigns', '/admin', '/network'];

const getLayoutVariant = (path: string): HeaderVariant =>
  PANEL_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)) ? 'panel' : 'public';

/**
 * On route change, move focus to the new page's <h1> (or to <main>), so keyboard and screen-reader
 * users start at the content (docs/design/components.md §13). Skips the first render.
 * Rendered inside the page's Suspense boundary, so it runs only after the lazy page has committed.
 */
const RouteFocus = ({ pathname }: { pathname: string }): null => {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return undefined;
    }
    const frame = window.requestAnimationFrame(() => {
      const main = document.getElementById('main');
      const target = main?.querySelector<HTMLElement>('h1') ?? main;
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
};

const Layout = () => {
  const { pathname } = useLocation();
  const variant = getLayoutVariant(pathname);

  return (
    <div className={variant === 'panel' ? 'min-h-dvh lg:pl-64' : 'flex min-h-dvh flex-col'}>
      <Header variant={variant} />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<RouteFallback inline />}>
          <Outlet />
          <RouteFocus pathname={pathname} />
        </Suspense>
      </main>
    </div>
  );
};

export default Layout;
