import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'points';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Decorative icon before the text (always paired with text). */
  icon?: ReactNode;
  /** Text is mandatory: the badge never depends only on color. */
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-muted text-foreground',
  primary: 'bg-primary-subtle text-primary',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  info: 'bg-info-subtle text-info',
  points: 'bg-accent text-accent-foreground border-2 border-foreground shadow-pop-sm font-display tabular-nums',
};

export const Badge = ({ variant = 'neutral', icon, className, children, ...rest }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
      variantClasses[variant],
      className,
    )}
    {...rest}
  >
    {icon && <span aria-hidden="true">{icon}</span>}
    {children}
  </span>
);

export default Badge;
