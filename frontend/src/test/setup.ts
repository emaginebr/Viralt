// Vitest setup: jest-dom matchers (toBeInTheDocument, toHaveFocus, toHaveAttribute…).
import '@testing-library/jest-dom/vitest';

// jsdom lacks a few browser APIs used by Radix (Popper/DropdownMenu) and by the Toaster.
if (typeof window !== 'undefined') {
  if (!('ResizeObserver' in window)) {
    class ResizeObserverStub {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    (window as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver = ResizeObserverStub;
  }

  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: (): void => undefined,
        removeListener: (): void => undefined,
        addEventListener: (): void => undefined,
        removeEventListener: (): void => undefined,
        dispatchEvent: (): boolean => false,
      }) as MediaQueryList;
  }

  // jsdom defines scrollTo but only logs "Not implemented"; ScrollToTop calls it on every route.
  window.scrollTo = (() => undefined) as typeof window.scrollTo;

  if (typeof Element !== 'undefined' && typeof Element.prototype.scrollIntoView !== 'function') {
    Element.prototype.scrollIntoView = (): void => undefined;
  }

  if (!('IntersectionObserver' in window)) {
    class IntersectionObserverStub {
      readonly root: Element | null = null;
      readonly rootMargin = '';
      readonly thresholds: ReadonlyArray<number> = [];
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }
    (window as unknown as { IntersectionObserver: typeof IntersectionObserverStub }).IntersectionObserver =
      IntersectionObserverStub;
  }
}
