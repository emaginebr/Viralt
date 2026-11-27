import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
  faXmark,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { cn } from './cn';
import { Button } from './Button';

export type AlertVariant = 'success' | 'info' | 'warning' | 'danger';

export interface AlertProps {
  variant?: AlertVariant;
  /** Says the type in text ("Campanha publicada", "Não foi possível salvar"). */
  title?: ReactNode;
  children?: ReactNode;
  /** Shows the close button (docs/design/components.md §22). */
  dismissible?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Optional actions (Button size="sm"). */
  action?: ReactNode;
  id?: string;
  tabIndex?: number;
  className?: string;
}

interface VariantConfig {
  classes: string;
  icon: IconDefinition;
  iconClass: string;
}

const variants: Record<AlertVariant, VariantConfig> = {
  success: {
    classes: 'border-success/30 border-l-success bg-success-subtle',
    icon: faCircleCheck,
    iconClass: 'text-success',
  },
  info: {
    classes: 'border-info/30 border-l-info bg-info-subtle',
    icon: faCircleInfo,
    iconClass: 'text-info',
  },
  warning: {
    classes: 'border-warning/30 border-l-warning bg-warning-subtle',
    icon: faTriangleExclamation,
    iconClass: 'text-warning',
  },
  danger: {
    classes: 'border-danger/30 border-l-danger bg-danger-subtle',
    icon: faCircleExclamation,
    iconClass: 'text-danger',
  },
};

/**
 * Inline alert (docs/design/components.md §10). `danger` uses role="alert"; the others use
 * role="status" with aria-live="polite". The icon shape also tells the type, not only the color.
 */
export const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  dismissLabel = 'Fechar aviso',
  action,
  id,
  tabIndex,
  className,
}: AlertProps) => {
  const config = variants[variant];
  const isDanger = variant === 'danger';

  return (
    <div
      id={id}
      tabIndex={tabIndex}
      role={isDanger ? 'alert' : 'status'}
      aria-live={isDanger ? 'assertive' : 'polite'}
      className={cn(
        'relative flex gap-3 rounded-md border border-l-4 p-4 text-sm text-foreground',
        dismissible && 'pr-14',
        config.classes,
        className,
      )}
    >
      <FontAwesomeIcon icon={config.icon} aria-hidden="true" className={cn('mt-0.5 text-base', config.iconClass)} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-1' : undefined}>{children}</div>}
        {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
      </div>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="absolute right-1.5 top-1.5"
        >
          <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
        </Button>
      )}
    </div>
  );
};

export default Alert;
