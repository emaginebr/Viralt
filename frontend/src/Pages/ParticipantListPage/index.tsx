import { useState, useEffect, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBan, faCircleCheck, faClock, faCode, faFileCsv, faTrash, faTrophy, faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useClient } from '../../hooks/useClient';
import type { ClientInfo } from '../../types/client';
import { getApiUrl, getHeaders } from '../../Services/apiHelpers';
import { PageContainer, PageHeader } from '../../Components/ui/PageContainer';
import { Button } from '../../Components/ui/Button';
import { Input } from '../../Components/ui/Input';
import { Badge } from '../../Components/ui/Badge';
import { Alert } from '../../Components/ui/Alert';
import { Table, type TableColumn } from '../../Components/ui/Table';
import { Pagination } from '../../Components/ui/Pagination';
import { useConfirm } from '../../Components/ui/ConfirmModal';
import Breadcrumb from '../../Components/Breadcrumb';
import { usePaginationLabels } from '../../hooks/usePaginationLabels';

const PAGE_SIZE = 20;

const ParticipantListPage = () => {
  const { t, i18n } = useTranslation();
  const confirm = useConfirm();
  const paginationLabels = usePaginationLabels(t('participantList.paginationNav'));
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaignIdNum = parseInt(campaignId || '0', 10);

  const { clients, loading, error, loadClients, disqualifyClient, deleteClient, clearError } = useClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (campaignIdNum > 0) {
      loadClients(campaignIdNum).catch(() => { /* handled by context */ });
    }
  }, [campaignIdNum, loadClients]);

  // Client-side filter
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter((c) =>
      c.name?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredClients.slice(start, start + PAGE_SIZE);
  }, [filteredClients, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDisqualify = useCallback(async (client: ClientInfo) => {
    const who = client.name || client.email;
    const confirmed = await confirm({
      title: t('participantList.disqualifyTitle', { name: who }),
      description: t('participantList.disqualifyDescription'),
      confirmLabel: t('participantList.disqualify'),
      cancelLabel: t('shared.cancel'),
      tone: 'danger',
    });
    if (!confirmed) return;
    setActionError(null);
    try {
      const result = await disqualifyClient(client.clientId);
      if (result?.sucesso) toast.success(t('participantList.disqualified', { name: who }));
      else setActionError(result?.mensagem || t('participantList.disqualifyFailed'));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('participantList.disqualifyFailed'));
    }
  }, [disqualifyClient, confirm, t]);

  const handleDelete = useCallback(async (client: ClientInfo) => {
    const who = client.name || client.email;
    const confirmed = await confirm({
      title: t('participantList.deleteTitle', { name: who }),
      description: t('participantList.deleteDescription'),
      confirmLabel: t('participantList.delete'),
      cancelLabel: t('shared.cancel'),
      tone: 'danger',
    });
    if (!confirmed) return;
    setActionError(null);
    try {
      const result = await deleteClient(client.clientId);
      if (result?.sucesso) toast.success(t('participantList.deleted', { name: who }));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('participantList.deleteFailed'));
    }
  }, [deleteClient, confirm, t]);

  const handleExport = useCallback((format: 'csv' | 'json') => {
    const url = `${getApiUrl()}/api/Client/export/${campaignIdNum}?format=${format}`;
    // Use fetch with auth headers for download
    fetch(url, { headers: getHeaders(true) })
      .then((res) => {
        if (!res.ok) throw new Error(t('participantList.exportFailed'));
        return res.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `participants-${campaignIdNum}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch((err) => setActionError(err instanceof Error ? err.message : t('participantList.exportFailed')));
  }, [campaignIdNum, t]);

  const getStatusBadge = (client: ClientInfo) => {
    if (client.isDisqualified) {
      return <Badge variant="danger" icon={<FontAwesomeIcon icon={faBan} />}>{t('participantList.status.disqualified')}</Badge>;
    }
    if (client.isWinner) {
      return <Badge variant="success" icon={<FontAwesomeIcon icon={faTrophy} />}>{t('participantList.status.winner')}</Badge>;
    }
    if (client.emailVerified) {
      return <Badge variant="primary" icon={<FontAwesomeIcon icon={faCircleCheck} />}>{t('participantList.status.verified')}</Badge>;
    }
    return <Badge variant="neutral" icon={<FontAwesomeIcon icon={faClock} />}>{t('participantList.status.pending')}</Badge>;
  };

  const columns: TableColumn<ClientInfo>[] = [
    {
      key: 'name',
      header: t('participantList.columns.name'),
      rowHeader: true,
      accessor: (client) => client.name || '—',
    },
    {
      key: 'email',
      header: t('participantList.columns.email'),
      className: 'break-all',
      accessor: (client) => client.email || '—',
    },
    {
      key: 'totalEntries',
      header: t('participantList.columns.totalEntries'),
      numeric: true,
      accessor: (client) => (client.totalEntries ?? 0).toLocaleString(i18n.language),
    },
    {
      key: 'status',
      header: t('participantList.columns.status'),
      accessor: (client) => getStatusBadge(client),
    },
    {
      key: 'createdAt',
      header: t('participantList.columns.createdAt'),
      className: 'tabular-nums',
      accessor: (client) => new Date(client.createdAt).toLocaleDateString(i18n.language),
    },
    {
      key: 'actions',
      header: t('participantList.columns.actions'),
      actions: true,
      className: 'px-2 py-1',
      accessor: (client) => {
        const who = client.name || client.email;
        return (
          <div className="flex items-center justify-end">
            {!client.isDisqualified && (
              <Button
                variant="ghost"
                size="icon"
                className="text-warning hover:bg-warning-subtle"
                aria-label={t('participantList.disqualifyNamed', { name: who })}
                title={t('participantList.disqualify')}
                onClick={() => handleDisqualify(client)}
              >
                <FontAwesomeIcon icon={faBan} aria-hidden="true" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-danger hover:bg-danger-subtle"
              aria-label={t('participantList.deleteNamed', { name: who })}
              title={t('participantList.delete')}
              onClick={() => handleDelete(client)}
            >
              <FontAwesomeIcon icon={faTrash} aria-hidden="true" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={
          <Breadcrumb
            className="mb-1"
            label={t('shared.breadcrumb')}
            items={[
              { label: t('layout.nav.campaigns'), to: '/campaigns' },
              { label: t('participantList.campaign'), to: `/campaigns/${campaignIdNum}` },
              { label: t('participantList.title') },
            ]}
          />
        }
        title={t('participantList.title')}
        description={t('participantList.description')}
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<FontAwesomeIcon icon={faFileCsv} aria-hidden="true" />}
              onClick={() => handleExport('csv')}
            >
              {t('participantList.exportCsv')}
            </Button>
            <Button
              variant="outline"
              leftIcon={<FontAwesomeIcon icon={faCode} aria-hidden="true" />}
              onClick={() => handleExport('json')}
            >
              {t('participantList.exportJson')}
            </Button>
          </>
        }
      />

      {(error || actionError) && (
        <Alert
          variant="danger"
          className="mb-6"
          dismissible
          dismissLabel={t('shared.dismissAlert')}
          onDismiss={() => { clearError(); setActionError(null); }}
        >
          {error || actionError}
        </Alert>
      )}

      <form
        role="search"
        aria-label={t('participantList.searchLabel')}
        onSubmit={(e) => e.preventDefault()}
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <Input
          variant="search"
          label={t('participantList.searchLabel')}
          hideLabel={false}
          placeholder={t('participantList.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          wrapperClassName="w-full sm:max-w-md"
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {loading ? '' : t('participantList.found', { count: filteredClients.length })}
        </p>
      </form>

      <Table
        columns={columns}
        rows={paginatedClients}
        caption={t('participantList.caption', { page: currentPage, total: totalPages })}
        rowKey={(client) => client.clientId}
        loading={loading}
        className="[&_table]:min-w-3xl"
        empty={
          <div className="flex flex-col items-center gap-3 py-4">
            <FontAwesomeIcon icon={faUsers} className="text-2xl" aria-hidden="true" />
            <p>{searchTerm ? t('participantList.emptyFiltered') : t('participantList.empty')}</p>
          </div>
        }
      />

      {totalPages > 1 && (
        <Pagination
          className="mt-4"
          page={currentPage}
          totalPages={totalPages}
          totalItems={filteredClients.length}
          pageSize={PAGE_SIZE}
          onChange={setCurrentPage}
          labels={paginationLabels}
        />
      )}
    </PageContainer>
  );
};

export default ParticipantListPage;
