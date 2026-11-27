import { forwardRef, useEffect, useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn, describedBy, focusRing } from './cn';
import { FieldError, useFieldIds } from './Field';

export type ChoiceVariant = 'default' | 'card';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  indeterminate?: boolean;
  variant?: ChoiceVariant;
  wrapperClassName?: string;
}

/** Label classes shared by Checkbox and Radio: the 44 px target includes the text. */
export const choiceLabelClasses = (variant: ChoiceVariant, disabled?: boolean): string =>
  cn(
    'flex min-h-11 cursor-pointer items-start gap-3',
    variant === 'card'
      ? 'rounded-md border border-input bg-surface p-4 transition-colors duration-150 hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary-subtle'
      : 'py-2.5',
    disabled && 'opacity-50 pointer-events-none',
  );

export const choiceInputClasses = cn('mt-0.5 size-5 shrink-0 cursor-pointer border-input accent-primary', focusRing);

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      label,
      description,
      error,
      indeterminate = false,
      variant = 'default',
      disabled,
      className,
      wrapperClassName,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const ids = useFieldIds(id, description, error, ariaDescribedBy);
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    return (
      <div className={cn('flex flex-col gap-1', wrapperClassName)}>
        <label htmlFor={ids.id} className={choiceLabelClasses(variant, disabled)}>
          <input
            ref={innerRef}
            id={ids.id}
            type="checkbox"
            disabled={disabled}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy(ids.hintId, ids.errorId, ariaDescribedBy)}
            className={cn(choiceInputClasses, 'rounded-sm', className)}
            {...rest}
          />
          <span className="text-base text-foreground">
            {label}
            {description && (
              <span id={ids.hintId} className="block text-sm text-muted-foreground">
                {description}
              </span>
            )}
          </span>
        </label>
        <FieldError id={ids.errorId}>{error}</FieldError>
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
