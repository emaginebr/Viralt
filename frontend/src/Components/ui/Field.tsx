import { useId, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { cn, describedBy, focusRing } from './cn';

/** Control classes shared by Input, Textarea and Select (docs/design/components.md §2). */
export const controlClasses = cn(
  'block w-full min-h-11 rounded-md border border-input bg-surface px-3 py-2',
  'text-base text-foreground placeholder:text-muted-foreground',
  'transition-colors duration-150 hover:border-foreground',
  focusRing,
  'focus-visible:border-ring',
  'disabled:opacity-50 disabled:pointer-events-none',
  'read-only:bg-muted read-only:border-border',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-danger',
);

export interface FieldIds {
  id: string;
  hintId?: string;
  errorId?: string;
  describedBy?: string;
}

/** Builds the ids used to link label, hint and error to a control. */
export const useFieldIds = (
  id: string | undefined,
  hint: ReactNode,
  error: ReactNode,
  extraDescribedBy?: string,
): FieldIds => {
  const generated = useId();
  const controlId = id ?? `field-${generated.replace(/:/g, '')}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  return {
    id: controlId,
    hintId,
    errorId,
    describedBy: describedBy(hintId, errorId, extraDescribedBy),
  };
};

export interface FieldLabelProps {
  htmlFor?: string;
  id?: string;
  required?: boolean;
  hidden?: boolean;
  children: ReactNode;
  className?: string;
}

export const FieldLabel = ({ htmlFor, id, required, hidden, children, className }: FieldLabelProps) => (
  <label
    htmlFor={htmlFor}
    id={id}
    className={cn(hidden ? 'sr-only' : 'text-sm font-semibold text-foreground', className)}
  >
    {children}
    {required && (
      <>
        {' '}
        <span className="text-danger" aria-hidden="true">*</span>
        <span className="sr-only">(obrigatório)</span>
      </>
    )}
  </label>
);

export interface FieldMessageProps {
  id?: string;
  children?: ReactNode;
}

export const FieldHint = ({ id, children }: FieldMessageProps) =>
  children ? (
    <p id={id} className="text-sm text-muted-foreground">
      {children}
    </p>
  ) : null;

export const FieldError = ({ id, children }: FieldMessageProps) =>
  children ? (
    <p id={id} className="flex items-start gap-1.5 text-sm font-medium text-danger">
      <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5" aria-hidden="true" />
      <span>{children}</span>
    </p>
  ) : null;

export interface FieldProps {
  ids: FieldIds;
  label: ReactNode;
  hideLabel?: boolean;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Wrapper: label, control, hint and error stacked (docs/design/components.md §2). */
export const Field = ({ ids, label, hideLabel, required, hint, error, className, children }: FieldProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <FieldLabel htmlFor={ids.id} required={required} hidden={hideLabel}>
      {label}
    </FieldLabel>
    {children}
    <FieldHint id={ids.hintId}>{hint}</FieldHint>
    <FieldError id={ids.errorId}>{error}</FieldError>
  </div>
);
