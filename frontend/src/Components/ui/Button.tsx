import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn, focusRing } from './cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Public-page signature: hard shadow + border (CTA "Participar agora"). */
  pop?: boolean;
  loading?: boolean;
  /** Label shown while loading (e.g. "Enviando…"). Defaults to the children. */
  loadingText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  /** Renders the single child (`<a>` or `<Link>`) with the button classes. */
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
  outline: 'border border-input bg-surface text-foreground hover:bg-muted',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  danger: 'bg-danger text-danger-foreground hover:bg-danger-hover',
  accent: 'bg-accent text-accent-foreground hover:bg-accent-hover',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-11 px-4 text-base',
  lg: 'min-h-13 px-6 text-lg',
  icon: 'size-11 p-0',
};

const popClasses =
  'shadow-pop border-2 border-foreground motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:shadow-pop-sm';

export const buttonClasses = ({
  variant = 'primary',
  size = 'md',
  pop = false,
  fullWidth = false,
  className,
}: Pick<ButtonProps, 'variant' | 'size' | 'pop' | 'fullWidth' | 'className'> = {}): string =>
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans font-semibold',
    'cursor-pointer select-none transition-colors duration-150 ease-snappy',
    focusRing,
    'disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress aria-disabled:pointer-events-none aria-disabled:opacity-50',
    'motion-safe:active:translate-y-px',
    variantClasses[variant],
    sizeClasses[size],
    pop && popClasses,
    fullWidth && 'w-full',
    className,
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      pop = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      asChild = false,
      className,
      children,
      disabled,
      type,
      ...rest
    },
    ref,
  ) => {
    const classes = buttonClasses({ variant, size, pop, fullWidth, className });

    if (asChild) {
      const child = Children.only(children);
      if (isValidElement(child)) {
        type ChildProps = { className?: string; children?: ReactNode };
        const element = child as ReactElement<ChildProps>;
        const childProps = {
          ...rest,
          className: cn(classes, element.props.className),
          children: (
            <>
              {leftIcon}
              {element.props.children}
              {rightIcon}
            </>
          ),
        } as ChildProps;
        return cloneElement(element, childProps);
      }
    }

    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? <Spinner size="sm" decorative /> : leftIcon}
        {loading && loadingText ? loadingText : children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
