import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { cn } from './cn';
import { Field, controlClasses, useFieldIds } from './Field';

export interface SelectOption {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  /** Becomes a disabled `<option value="">`. */
  placeholder?: string;
  /** Simple options. For `<optgroup>`, pass `<option>`/`<optgroup>` as children instead. */
  options?: SelectOption[];
  wrapperClassName?: string;
}

/** Native `<select>` styled with the design system (docs/design/components.md §4). */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      hideLabel,
      hint,
      error,
      required,
      placeholder,
      options,
      className,
      wrapperClassName,
      children,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const ids = useFieldIds(id, hint, error, ariaDescribedBy);
    const hasError = Boolean(error);

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
        <div className="relative">
          <select
            ref={ref}
            id={ids.id}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={ids.describedBy}
            className={cn(controlClasses, 'appearance-none pr-10 cursor-pointer', className)}
            {...rest}
          >
            {placeholder !== undefined && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options?.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
            {children}
          </select>
          <FontAwesomeIcon
            icon={faChevronDown}
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2',
              hasError ? 'text-danger' : 'text-muted-foreground',
            )}
          />
        </div>
      </Field>
    );
  },
);

Select.displayName = 'Select';

export default Select;
