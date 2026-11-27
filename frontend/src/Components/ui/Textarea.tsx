import { forwardRef, useState, type ChangeEvent, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn, describedBy } from './cn';
import { Field, controlClasses, useFieldIds } from './Field';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  /** Shows the "120/500" counter (requires maxLength). */
  showCount?: boolean;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      hideLabel,
      hint,
      error,
      required,
      showCount = false,
      maxLength,
      className,
      wrapperClassName,
      value,
      defaultValue,
      onChange,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const ids = useFieldIds(id, hint, error, ariaDescribedBy);
    const initialLength = String(value ?? defaultValue ?? '').length;
    const [uncontrolledLength, setUncontrolledLength] = useState(initialLength);
    const length = value !== undefined ? String(value).length : uncontrolledLength;
    const counting = showCount && typeof maxLength === 'number';
    const countId = counting ? `${ids.id}-count` : undefined;
    const ratio = counting ? length / maxLength : 0;
    const announce = counting && (ratio >= 1 || ratio >= 0.8);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      setUncontrolledLength(event.target.value.length);
      onChange?.(event);
    };

    return (
      <Field
        ids={ids}
        label={label}
        hideLabel={hideLabel}
        required={required}
        hint={hint}
        error={error}
        className={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={ids.id}
          required={required}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy(ids.describedBy, countId)}
          className={cn(controlClasses, 'min-h-24 py-2.5 resize-y leading-6', className)}
          {...rest}
        />
        {counting && (
          <>
            <p id={countId} className="text-sm text-muted-foreground tabular-nums">
              {length}/{maxLength}
            </p>
            <span className="sr-only" aria-live="polite">
              {announce ? `${length} de ${maxLength} caracteres` : ''}
            </span>
          </>
        )}
      </Field>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
