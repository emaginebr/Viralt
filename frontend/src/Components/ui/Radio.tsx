import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { cn, describedBy } from './cn';
import { FieldError, useFieldIds } from './Field';
import { choiceInputClasses, choiceLabelClasses, type ChoiceVariant } from './Checkbox';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
  /** Optional icon for the `card` variant (campaign type). */
  icon?: ReactNode;
  variant?: ChoiceVariant;
  wrapperClassName?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      id,
      label,
      description,
      icon,
      variant = 'default',
      disabled,
      className,
      wrapperClassName,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const ids = useFieldIds(id, description, undefined, ariaDescribedBy);
    const isCard = variant === 'card';

    return (
      <label htmlFor={ids.id} className={cn(choiceLabelClasses(variant, disabled), 'group', wrapperClassName)}>
        <input
          ref={ref}
          id={ids.id}
          type="radio"
          disabled={disabled}
          aria-describedby={describedBy(ids.hintId, ariaDescribedBy)}
          className={cn(choiceInputClasses, 'rounded-full', className)}
          {...rest}
        />
        {isCard && icon && (
          <span aria-hidden="true" className="mt-0.5 text-lg text-primary">
            {icon}
          </span>
        )}
        <span className="flex-1 text-base text-foreground">
          <span className={isCard ? 'font-semibold' : undefined}>{label}</span>
          {description && (
            <span id={ids.hintId} className="block text-sm text-muted-foreground">
              {description}
            </span>
          )}
        </span>
        {isCard && (
          <FontAwesomeIcon
            icon={faCircleCheck}
            aria-hidden="true"
            className="mt-0.5 hidden text-primary group-has-[:checked]:inline-block"
          />
        )}
      </label>
    );
  },
);

Radio.displayName = 'Radio';

export interface RadioGroupProps {
  legend: ReactNode;
  hideLegend?: boolean;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** `<fieldset>` + `<legend>` for a radio group; the error is linked to the fieldset. */
export const RadioGroup = ({ legend, hideLegend, error, className, children }: RadioGroupProps) => {
  const generated = useId().replace(/:/g, '');
  const errorId = error ? `radiogroup-${generated}-error` : undefined;

  return (
    <fieldset
      aria-describedby={errorId}
      aria-invalid={Boolean(error) || undefined}
      className={cn('flex flex-col gap-2', className)}
    >
      <legend className={hideLegend ? 'sr-only' : 'mb-1 text-sm font-semibold text-foreground'}>{legend}</legend>
      {children}
      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  );
};

export default Radio;
