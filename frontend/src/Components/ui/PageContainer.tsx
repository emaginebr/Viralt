import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export type PageContainerVariant = 'default' | 'narrow' | 'public' | 'wide';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PageContainerVariant;
}

const variantClasses: Record<PageContainerVariant, string> = {
  default: 'mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8',
  narrow: 'mx-auto w-full max-w-md px-4 py-10',
  public: 'mx-auto w-full max-w-5xl px-4 sm:px-6',
  wide: 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8',
};

/** Page width and spacing, replacing Container/Row/Col (docs/design/components.md §27.3). */
export const PageContainer = ({ variant = 'default', className, ...rest }: PageContainerProps) => (
  <div className={cn(variantClasses[variant], className)} {...rest} />
);

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, breadcrumb, actions, className }: PageHeaderProps) => (
  <div className={cn('flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between', className)}>
    <div className="min-w-0">
      {breadcrumb}
      <h1 tabIndex={-1} className="font-display text-2xl font-bold lg:text-3xl">
        {title}
      </h1>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export default PageContainer;
