import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { cn, focusRing } from './ui/cn';

export interface BreadcrumbItem {
  label: ReactNode;
  /** Omit on the current page (last item). */
  to?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Accessible name of the nav. Defaults to `shared.breadcrumb` ("Trilha"). */
  label?: string;
  className?: string;
}

/**
 * Breadcrumb for the PageHeader (mockups admin-list / admin-form, docs/design/components.md).
 * The last item, or any item without `to`, is rendered as text; only the last one is `aria-current`.
 */
export const Breadcrumb = ({ items, label, className }: BreadcrumbProps) => {
  const { t } = useTranslation();

  return (
    <nav aria-label={label ?? t('shared.breadcrumb')} className={cn('text-sm text-muted-foreground', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {isLast || !item.to ? (
                <span aria-current={isLast ? 'page' : undefined} className="font-semibold text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-sm underline-offset-2 hover:text-foreground hover:underline',
                    focusRing,
                  )}
                >
                  {item.label}
                </Link>
              )}
              {!isLast && <FontAwesomeIcon icon={faChevronRight} className="text-xs" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
