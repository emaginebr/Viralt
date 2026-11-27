import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export type CardVariant = 'default' | 'interactive' | 'ticket' | 'inverted';
export type CardElement = 'section' | 'article' | 'div';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  as?: CardElement;
  /** Shortcut: rendered inside CardHeader. */
  header?: ReactNode;
  /** Shortcut: rendered inside CardFooter. */
  footer?: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'rounded-lg border border-border bg-surface text-surface-foreground shadow-sm',
  interactive:
    'relative rounded-lg border border-border bg-surface text-surface-foreground shadow-sm transition-shadow duration-150 hover:shadow-md',
  ticket: 'ticket rounded-lg border-2 border-foreground bg-surface text-surface-foreground shadow-pop',
  inverted: 'rounded-lg border border-secondary bg-secondary text-secondary-foreground shadow-sm',
};

export const Card = ({ variant = 'default', as = 'div', header, footer, className, children, ...rest }: CardProps) => {
  const Element = as;
  return (
    <Element className={cn(variantClasses[variant], className)} {...rest}>
      {header !== undefined && <CardHeader>{header}</CardHeader>}
      {children}
      {footer !== undefined && <CardFooter>{footer}</CardFooter>}
    </Element>
  );
};

export interface CardPartProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = ({ className, ...rest }: CardPartProps) => (
  <div className={cn('flex items-start justify-between gap-4 px-5 pt-5 md:px-6 md:pt-6', className)} {...rest} />
);

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4';
}

export const CardTitle = ({ as = 'h2', className, ...rest }: CardTitleProps) => {
  const Heading = as;
  return <Heading className={cn('font-display text-lg font-bold', className)} {...rest} />;
};

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = ({ className, ...rest }: CardDescriptionProps) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...rest} />
);

export const CardContent = ({ className, ...rest }: CardPartProps) => (
  <div className={cn('p-5 md:p-6', className)} {...rest} />
);

export const CardFooter = ({ className, ...rest }: CardPartProps) => (
  <div
    className={cn(
      'flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-4 md:px-6',
      className,
    )}
    {...rest}
  />
);

export default Card;
