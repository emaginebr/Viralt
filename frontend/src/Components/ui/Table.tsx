import { useId, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { cn, focusRing } from './cn';
import { Skeleton } from './Skeleton';

export type TableAlign = 'left' | 'center' | 'right';
export type SortDirection = 'ascending' | 'descending';

export interface TableColumn<T> {
  /** Unique key; also passed to onSort. */
  key: string;
  header: ReactNode;
  /** Cell content. Defaults to `row[key]`. */
  accessor?: (row: T, index: number) => ReactNode;
  align?: TableAlign;
  /** Numeric column: right-aligned with tabular-nums. */
  numeric?: boolean;
  /** Actions column: shrinks to content, right-aligned. */
  actions?: boolean;
  /** First cell is a row header (`<th scope="row">`). */
  rowHeader?: boolean;
  sortable?: boolean;
  className?: string;
}

export interface TableSort {
  key: string;
  direction: SortDirection;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  /** Accessible caption (sr-only by default); include the pagination context. */
  caption: ReactNode;
  showCaption?: boolean;
  rowKey?: (row: T, index: number) => string | number;
  /** Content of the empty state row (icon, text and action). */
  empty?: ReactNode;
  loading?: boolean;
  loadingRows?: number;
  sort?: TableSort;
  onSort?: (key: string) => void;
  className?: string;
}

const alignClass = (column: { align?: TableAlign; numeric?: boolean; actions?: boolean }): string => {
  if (column.actions) return 'w-px whitespace-nowrap text-right';
  if (column.numeric) return 'text-right tabular-nums';
  if (column.align === 'center') return 'text-center';
  if (column.align === 'right') return 'text-right';
  return 'text-left';
};

const readCell = <T,>(row: T, key: string): ReactNode => {
  const value = (row as unknown as Record<string, unknown>)[key];
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'boolean') return String(value);
  return null;
};

/** Data table (docs/design/components.md §8): `<th scope>`, caption, empty and loading states. */
export const Table = <T,>({
  columns,
  rows,
  caption,
  showCaption = false,
  rowKey,
  empty,
  loading = false,
  loadingRows = 5,
  sort,
  onSort,
  className,
}: TableProps<T>) => {
  const captionId = `table-${useId().replace(/:/g, '')}-caption`;

  return (
    <div
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      className={cn('overflow-x-auto rounded-lg border border-border bg-surface shadow-sm', focusRing, className)}
    >
      <table className="w-full border-collapse text-left text-sm" aria-busy={loading || undefined}>
        <caption
          id={captionId}
          className={showCaption ? 'px-4 py-3 text-left font-semibold text-foreground' : 'sr-only'}
        >
          {caption}
        </caption>
        <thead className="bg-muted">
          <tr>
            {columns.map((column) => {
              const sorted = sort?.key === column.key ? sort.direction : undefined;
              const sortIcon = sorted === 'ascending' ? faSortUp : sorted === 'descending' ? faSortDown : faSort;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={column.sortable ? sorted ?? 'none' : undefined}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                    alignClass(column),
                    column.className,
                  )}
                >
                  {column.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(column.key)}
                      className={cn(
                        'inline-flex min-h-11 items-center gap-1.5 rounded-sm uppercase hover:text-foreground',
                        focusRing,
                      )}
                    >
                      {column.header}
                      <FontAwesomeIcon icon={sortIcon} aria-hidden="true" />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading &&
            Array.from({ length: loadingRows }, (_, index) => (
              <tr key={`skeleton-${index}`}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                {empty ?? 'Nenhum registro encontrado.'}
              </td>
            </tr>
          )}

          {!loading &&
            rows.map((row, rowIndex) => (
              <tr
                key={rowKey ? rowKey(row, rowIndex) : rowIndex}
                className="transition-colors duration-150 hover:bg-muted/60"
              >
                {columns.map((column) => {
                  const content = column.accessor ? column.accessor(row, rowIndex) : readCell(row, column.key);
                  const cellClass = cn('px-4 py-3 align-middle', alignClass(column), column.className);
                  return column.rowHeader ? (
                    <th key={column.key} scope="row" className={cn(cellClass, 'font-semibold text-foreground')}>
                      {content}
                    </th>
                  ) : (
                    <td key={column.key} className={cellClass}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
