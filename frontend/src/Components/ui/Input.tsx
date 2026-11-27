import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { cn } from './cn';
import { Field, controlClasses, useFieldIds } from './Field';

export type InputVariant = 'default' | 'search';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: ReactNode;
  /** Visually hides the label (search fields). The label stays for screen readers. */
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  variant?: InputVariant;
  /** Decorative icon inside the field, on the left. */
  leftIcon?: ReactNode;
  /** Element inside the field, on the right (e.g. "show password" or a Spinner). */
  rightSlot?: ReactNode;
  /** Fixed text joined to the field on the left (InputGroup: "https://", "R$"). */
  leftAddon?: ReactNode;
  /** Text or Button joined to the field on the right (InputGroup: "%", "Buscar"). */
  rightAddon?: ReactNode;
  wrapperClassName?: string;
}

const addonClasses =
  'inline-flex min-h-11 shrink-0 items-center border border-input bg-muted px-3 text-sm text-muted-foreground';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      hideLabel,
      hint,
      error,
      required,
      variant = 'default',
      leftIcon,
      rightSlot,
      leftAddon,
      rightAddon,
      className,
      wrapperClassName,
      type,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const ids = useFieldIds(id, hint, error, ariaDescribedBy);
    const isSearch = variant === 'search';
    const icon = leftIcon ?? (isSearch ? <FontAwesomeIcon icon={faMagnifyingGlass} /> : null);
    const hasError = Boolean(error);

    const input = (
      <input
        ref={ref}
        id={ids.id}
        type={type ?? (isSearch ? 'search' : 'text')}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={ids.describedBy}
        className={cn(
          controlClasses,
          icon && 'pl-10',
          rightSlot && 'pr-12',
          leftAddon && 'rounded-l-none',
          rightAddon && 'rounded-r-none',
          className,
        )}
        {...rest}
      />
    );

    const inner =
      icon || rightSlot ? (
        <div className="relative min-w-0 flex-1">
          {icon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {icon}
            </span>
          )}
          {input}
          {rightSlot && (
            <span className="absolute inset-y-0 right-0 flex items-center">{rightSlot}</span>
          )}
        </div>
      ) : (
        input
      );

    const control =
      leftAddon || rightAddon ? (
        <div className="flex">
          {leftAddon && (
            <span className={cn(addonClasses, 'rounded-l-md border-r-0', hasError && 'border-danger')}>
              {leftAddon}
            </span>
          )}
          <div className="min-w-0 flex-1">{inner}</div>
          {rightAddon &&
            (typeof rightAddon === 'string' ? (
              <span className={cn(addonClasses, 'rounded-r-md border-l-0', hasError && 'border-danger')}>
                {rightAddon}
              </span>
            ) : (
              <div className="-ml-px flex shrink-0 [&>*]:rounded-l-none focus-within:z-10">{rightAddon}</div>
            ))}
        </div>
      ) : (
        inner
      );

    return (
      <Field
        ids={ids}
        label={label}
        hideLabel={hideLabel ?? isSearch}
        required={required}
        hint={hint}
        error={error}
        className={wrapperClassName}
      >
        {control}
      </Field>
    );
  },
);

Input.displayName = 'Input';

export default Input;
