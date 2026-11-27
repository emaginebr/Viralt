import { cn } from './cn';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  /** Text for screen readers (and visible when `showLabel`). Required: the spinner stops under reduced motion. */
  label?: string;
  showLabel?: boolean;
  /** Renders only the decorative circle (inside Button, where aria-busy announces the state). */
  decorative?: boolean;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-5 border-2',
  lg: 'size-8 border-3',
};

export const Spinner = ({
  size = 'md',
  label = 'Carregando…',
  showLabel = false,
  decorative = false,
  className,
}: SpinnerProps) => {
  const circle = (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block shrink-0 rounded-full border-current border-r-transparent motion-safe:animate-spin',
        sizeClasses[size],
      )}
    />
  );

  if (decorative) {
    return <span className={cn('inline-flex', className)}>{circle}</span>;
  }

  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-muted-foreground', className)}>
      {circle}
      <span className={showLabel ? undefined : 'sr-only'}>{label}</span>
    </span>
  );
};

export default Spinner;
