import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { PaginationLabels } from '../Components/ui';

/**
 * Translated labels for ui/Pagination (the component defaults are pt-BR only).
 * `navLabel` is the already translated accessible name of the list ("Paginação das campanhas");
 * defaults to `pagination.nav`.
 */
export const usePaginationLabels = (navLabel?: string): PaginationLabels => {
  const { t } = useTranslation();
  return useMemo<PaginationLabels>(
    () => ({
      nav: navLabel ?? t('pagination.nav'),
      previous: t('pagination.previous'),
      next: t('pagination.next'),
      page: (page: number) => t('pagination.page', { page }),
      current: (page: number) => t('pagination.current', { page }),
      compact: (page: number, totalPages: number) => t('pagination.compact', { page, total: totalPages }),
      summary: (from: number, to: number, total: number) => t('pagination.summary', { from, to, total }),
    }),
    [t, navLabel],
  );
};

export default usePaginationLabels;
