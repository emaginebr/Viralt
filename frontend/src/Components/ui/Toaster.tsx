import { useEffect, useState } from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { buttonClasses } from './Button';

export interface ToasterProps {
  /**
   * Forces a position. Default: top-center on mobile and inside the widget iframe,
   * bottom-right on desktop (lg, ≥ 1024 px) — docs/design/components.md §11.
   */
  position?: 'top-center' | 'bottom-right';
}

const DESKTOP_QUERY = '(min-width: 1024px)';

const useIsDesktop = (): boolean => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(DESKTOP_QUERY).matches
      : false,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isDesktop;
};

const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

/** App-wide toast region (sonner). Use `toast.success/info/warning/error` from 'sonner'. */
export const Toaster = ({ position }: ToasterProps) => {
  const isDesktop = useIsDesktop();
  const resolved = position ?? (isDesktop && !isInIframe() ? 'bottom-right' : 'top-center');

  return (
    <SonnerToaster
      position={resolved}
      closeButton
      duration={5000}
      visibleToasts={3}
      icons={{
        success: <FontAwesomeIcon icon={faCircleCheck} className="text-success" aria-hidden="true" />,
        info: <FontAwesomeIcon icon={faCircleInfo} className="text-info" aria-hidden="true" />,
        warning: <FontAwesomeIcon icon={faTriangleExclamation} className="text-warning" aria-hidden="true" />,
        error: <FontAwesomeIcon icon={faCircleExclamation} className="text-danger" aria-hidden="true" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'relative flex w-full items-start gap-3 rounded-md border border-border bg-surface p-4 pr-12 text-sm text-foreground shadow-md',
          title: 'font-semibold',
          description: 'text-muted-foreground',
          icon: 'mt-0.5 shrink-0',
          success: 'border-l-4 border-l-success',
          error: 'border-l-4 border-l-danger',
          warning: 'border-l-4 border-l-warning',
          info: 'border-l-4 border-l-info',
          closeButton: buttonClasses({ variant: 'ghost', size: 'icon', className: 'absolute right-0.5 top-0.5' }),
          actionButton: buttonClasses({ variant: 'outline', size: 'sm' }),
          cancelButton: buttonClasses({ variant: 'ghost', size: 'sm' }),
        },
      }}
    />
  );
};

export default Toaster;
