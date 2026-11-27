import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { cn } from './cn';
import { buttonClasses } from './Button';

export interface PaginationLabels {
  nav: string;
  previous: string;
  next: string;
  page: (page: number) => string;
  current: (page: number) => string;
  /** "2 de 7" (compact view below sm). */
  compact: (page: number, totalPages: number) => string;
  /** "Mostrando 10–18 de 57". */
  summary?: (from: number, to: number, total: number) => string;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  siblingCount?: number;
  labels?: Partial<PaginationLabels>;
  className?: string;
}

const defaultLabels: PaginationLabels = {
  nav: 'Paginação',
  previous: 'Página anterior',
  next: 'Próxima página',
  page: (page) => `Página ${page}`,
  current: (page) => `Página ${page}, atual`,
  compact: (page, totalPages) => `${page} de ${totalPages}`,
  summary: (from, to, total) => `Mostrando ${from}–${to} de ${total}`,
};

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/** Page numbers with ellipsis: first, last, current ± siblingCount. */
export const getPageItems = (page: number, totalPages: number, siblingCount = 1): PageItem[] => {
  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(page - siblingCount, 2);
  const end = Math.min(page + siblingCount, totalPages - 1);
  const items: PageItem[] = [1];

  if (start > 2) items.push('ellipsis-start');
  for (let current = start; current <= end; current += 1) items.push(current);
  if (end < totalPages - 1) items.push('ellipsis-end');
  items.push(totalPages);

  return items;
};

/** Pagination (docs/design/components.md §14): aria-label, aria-current and live summary. */
export const Pagination = ({
  page,
  totalPages,
  onChange,
  totalItems,
  pageSize,
  siblingCount = 1,
  labels,
  className,
}: PaginationProps) => {
  const text: PaginationLabels = { ...defaultLabels, ...labels };
  if (totalPages < 1) return null;

  const isFirst = page <= 1;
  const isLast = page >= totalPages;
  const items = getPageItems(page, totalPages, siblingCount);

  const showSummary = typeof totalItems === 'number' && typeof pageSize === 'number' && text.summary;
  const from = showSummary ? Math.min((page - 1) * pageSize + 1, totalItems) : 0;
  const to = showSummary ? Math.min(page * pageSize, totalItems) : 0;

  const go = (target: number) => {
    if (target < 1 || target > totalPages || target === page) return;
    onChange(target);
  };

  const arrowClass = buttonClasses({ variant: 'outline', size: 'icon' });

  return (
    <nav aria-label={text.nav} className={cn('flex flex-col items-center justify-between gap-3 sm:flex-row', className)}>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {showSummary ? text.summary(from, to, totalItems) : <span className="sr-only">{text.current(page)}</span>}
      </p>
      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            className={arrowClass}
            aria-label={text.previous}
            aria-disabled={isFirst || undefined}
            onClick={() => go(page - 1)}
          >
            <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" />
          </button>
        </li>

        <li className="px-2 text-sm text-muted-foreground tabular-nums sm:hidden" aria-hidden="true">
          {text.compact(page, totalPages)}
        </li>

        {items.map((item) =>
          typeof item === 'number' ? (
            <li key={item} className="hidden sm:block">
              <button
                type="button"
                onClick={() => go(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={item === page ? text.current(item) : text.page(item)}
                className={cn(
                  buttonClasses({ variant: 'ghost', size: 'icon' }),
                  'tabular-nums',
                  item === page && 'bg-secondary font-bold text-secondary-foreground hover:bg-secondary-hover',
                )}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} aria-hidden="true" className="hidden px-1 text-muted-foreground sm:block">
              …
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            className={arrowClass}
            aria-label={text.next}
            aria-disabled={isLast || undefined}
            onClick={() => go(page + 1)}
          >
            <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
