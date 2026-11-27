import { Spinner } from './ui/Spinner';
import { cn } from './ui/cn';

interface RouteFallbackProps {
  /** `inline`: inside the Layout's <main> (header stays visible). Otherwise fills the viewport. */
  inline?: boolean;
}

/** Suspense fallback while a lazy route chunk loads. The Spinner exposes role="status". */
const RouteFallback = ({ inline = false }: RouteFallbackProps) => (
  <div
    data-testid="route-fallback"
    className={cn('flex items-center justify-center', inline ? 'py-16' : 'min-h-dvh')}
  >
    <Spinner size="lg" />
  </div>
);

export default RouteFallback;
