import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBullhorn,
    faCode,
    faEllipsisVertical,
    faEye,
    faFilterCircleXmark,
    faImages,
    faPen,
    faPlus,
    faTrash,
    faTrophy,
    faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { useCampaign } from "../../hooks/useCampaign";
import type { CampaignInfo } from "../../types/campaign";
import { PageContainer, PageHeader } from "../../Components/ui/PageContainer";
import { Button, buttonClasses } from "../../Components/ui/Button";
import { Input } from "../../Components/ui/Input";
import { Select } from "../../Components/ui/Select";
import { Alert } from "../../Components/ui/Alert";
import { Table, type TableColumn } from "../../Components/ui/Table";
import { Pagination } from "../../Components/ui/Pagination";
import { DropdownMenu } from "../../Components/ui/DropdownMenu";
import { useConfirm } from "../../Components/ui/ConfirmModal";
import { focusRing } from "../../Components/ui/cn";
import Breadcrumb from "../../Components/Breadcrumb";
import { CAMPAIGN_STATUS_VALUES, CampaignStatusBadge, campaignStatusKey, entryTypeKey } from "../../Components/CampaignStatusBadge";
import { usePaginationLabels } from "../../hooks/usePaginationLabels";

const PAGE_SIZE = 9;

const CampaignSearchPage = () => {

    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const confirm = useConfirm();
    const paginationLabels = usePaginationLabels(t('campaignSearch.paginationNav'));

    const { campaigns, loading, error, loadCampaigns, deleteCampaign, clearError } = useCampaign();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        // GraphQL MaxPageSize is 50 (offset paging)
        loadCampaigns(50).catch(() => { /* handled by context */ });
    }, [loadCampaigns]);

    // Filter campaigns
    const filteredCampaigns = campaigns.filter((c) => {
        const matchesSearch = !searchTerm.trim() ||
            c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.slug?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === null || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
    const paginatedCampaigns = filteredCampaigns.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const hasFilters = Boolean(searchTerm) || statusFilter !== null;

    const handleDelete = async (campaign: CampaignInfo) => {
        const confirmed = await confirm({
            title: t('campaignSearch.deleteTitle', { title: campaign.title }),
            description: t('campaignSearch.deleteDescription', { count: campaign.totalParticipants ?? 0 }),
            confirmLabel: t('campaignSearch.deleteConfirm'),
            cancelLabel: t('shared.cancel'),
            tone: 'danger',
        });
        if (!confirmed) return;
        setDeleteError(null);
        try {
            const result = await deleteCampaign(campaign.campaignId);
            if (result?.sucesso) {
                toast.success(t('campaignSearch.deleted', { title: campaign.title }));
            }
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : t('campaignSearch.deleteFailed'));
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter(null);
        setCurrentPage(1);
    };

    const formatDate = (value: string | null) =>
        value ? new Date(value).toLocaleDateString(i18n.language) : '—';

    const iconLink = (to: string, icon: typeof faEye, label: string) => (
        <Link to={to} aria-label={label} title={label} className={buttonClasses({ variant: 'ghost', size: 'icon' })}>
            <FontAwesomeIcon icon={icon} aria-hidden="true" />
        </Link>
    );

    const columns: TableColumn<CampaignInfo>[] = [
        {
            key: 'title',
            header: t('campaignSearch.columns.campaign'),
            rowHeader: true,
            className: 'font-normal',
            accessor: (campaign) => (
                <>
                    <Link
                        to={`/campaigns/${campaign.campaignId}`}
                        className={`rounded-sm font-semibold text-foreground hover:text-primary hover:underline ${focusRing}`}
                    >
                        {campaign.title}
                    </Link>
                    {campaign.slug && (
                        <span className="block font-mono text-xs font-normal text-muted-foreground">/c/{campaign.slug}</span>
                    )}
                </>
            ),
        },
        {
            key: 'status',
            header: t('campaignSearch.columns.status'),
            accessor: (campaign) => <CampaignStatusBadge status={campaign.status} />,
        },
        {
            key: 'entryType',
            header: t('campaignSearch.columns.type'),
            accessor: (campaign) => t(entryTypeKey(campaign.entryType)),
        },
        {
            key: 'totalParticipants',
            header: t('campaignSearch.columns.participants'),
            numeric: true,
            accessor: (campaign) => (campaign.totalParticipants ?? 0).toLocaleString(i18n.language),
        },
        {
            key: 'totalEntries',
            header: t('campaignSearch.columns.entries'),
            numeric: true,
            accessor: (campaign) => (campaign.totalEntries ?? 0).toLocaleString(i18n.language),
        },
        {
            key: 'endTime',
            header: t('campaignSearch.columns.endsAt'),
            className: 'tabular-nums',
            accessor: (campaign) => formatDate(campaign.endTime),
        },
        {
            key: 'actions',
            header: t('campaignSearch.columns.actions'),
            actions: true,
            className: 'px-2 py-1',
            accessor: (campaign) => (
                <div className="flex items-center justify-end">
                    {iconLink(`/campaigns/${campaign.campaignId}`, faEye, t('campaignSearch.actions.viewNamed', { title: campaign.title }))}
                    {iconLink(`/campaigns/${campaign.campaignId}/edit`, faPen, t('campaignSearch.actions.editNamed', { title: campaign.title }))}
                    <DropdownMenu
                        align="end"
                        trigger={
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={t('campaignSearch.actions.moreNamed', { title: campaign.title })}
                            >
                                <FontAwesomeIcon icon={faEllipsisVertical} aria-hidden="true" />
                            </Button>
                        }
                        items={[
                            {
                                label: t('campaignSearch.actions.participants'),
                                icon: <FontAwesomeIcon icon={faUsers} className="w-4 text-muted-foreground" />,
                                onSelect: () => navigate(`/campaigns/${campaign.campaignId}/participants`),
                            },
                            {
                                label: t('campaignSearch.actions.submissions'),
                                icon: <FontAwesomeIcon icon={faImages} className="w-4 text-muted-foreground" />,
                                onSelect: () => navigate(`/campaigns/${campaign.campaignId}/submissions`),
                            },
                            {
                                label: t('campaignSearch.actions.winners'),
                                icon: <FontAwesomeIcon icon={faTrophy} className="w-4 text-muted-foreground" />,
                                onSelect: () => navigate(`/campaigns/${campaign.campaignId}/winners`),
                            },
                            {
                                label: t('campaignSearch.actions.embed'),
                                icon: <FontAwesomeIcon icon={faCode} className="w-4 text-muted-foreground" />,
                                onSelect: () => navigate(`/campaigns/${campaign.campaignId}`),
                            },
                            { type: 'separator' },
                            {
                                label: t('campaignSearch.actions.delete'),
                                icon: <FontAwesomeIcon icon={faTrash} className="w-4" />,
                                destructive: true,
                                // Deferred so the menu finishes closing before the AlertDialog opens.
                                onSelect: () => { window.setTimeout(() => { void handleDelete(campaign); }, 0); },
                            },
                        ]}
                    />
                </div>
            ),
        },
    ];

    const caption = t('campaignSearch.caption', { page: currentPage, total: totalPages });

    return (
        <PageContainer>
            <PageHeader
                breadcrumb={
                    <Breadcrumb
                        className="mb-1"
                        label={t('shared.breadcrumb')}
                        items={[
                            { label: t('layout.nav.dashboard'), to: '/admin/dashboard' },
                            { label: t('campaignSearch.title') },
                        ]}
                    />
                }
                title={t('campaignSearch.title')}
                description={t('campaignSearch.description')}
                actions={
                    <Button
                        asChild
                        leftIcon={<FontAwesomeIcon icon={faPlus} aria-hidden="true" />}
                    >
                        <Link to="/campaigns/new">{t('layout.nav.newCampaign')}</Link>
                    </Button>
                }
            />

            {(error || deleteError) && (
                <Alert
                    variant="danger"
                    className="mb-6"
                    dismissible
                    dismissLabel={t('shared.dismissAlert')}
                    onDismiss={() => { clearError(); setDeleteError(null); }}
                >
                    {error || deleteError}
                </Alert>
            )}

            <form
                role="search"
                aria-label={t('campaignSearch.filtersLabel')}
                onSubmit={(e) => e.preventDefault()}
                className="mb-4 grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end"
            >
                <Input
                    variant="search"
                    label={t('campaignSearch.searchLabel')}
                    hideLabel={false}
                    placeholder={t('campaignSearch.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <Select
                    label={t('campaignSearch.statusLabel')}
                    value={statusFilter === null ? '' : String(statusFilter)}
                    onChange={(e) => {
                        setStatusFilter(e.target.value === '' ? null : parseInt(e.target.value, 10));
                        setCurrentPage(1);
                    }}
                    options={[
                        { value: '', label: t('campaignSearch.allStatuses') },
                        ...CAMPAIGN_STATUS_VALUES.map((status) => ({ value: String(status), label: t(campaignStatusKey(status)) })),
                    ]}
                />
                <Button
                    type="button"
                    variant="ghost"
                    disabled={!hasFilters}
                    leftIcon={<FontAwesomeIcon icon={faFilterCircleXmark} aria-hidden="true" />}
                    onClick={clearFilters}
                >
                    {t('shared.clearFilters')}
                </Button>
            </form>

            <p className="sr-only" aria-live="polite">
                {loading ? '' : t('campaignSearch.resultCount', { count: filteredCampaigns.length })}
            </p>

            <Table
                columns={columns}
                rows={paginatedCampaigns}
                caption={caption}
                rowKey={(campaign) => campaign.campaignId}
                loading={loading}
                className="[&_table]:min-w-4xl"
                empty={
                    <div className="flex flex-col items-center gap-3 py-4">
                        <FontAwesomeIcon icon={faBullhorn} className="text-2xl" aria-hidden="true" />
                        <p>{hasFilters ? t('campaignSearch.emptyFiltered') : t('campaignSearch.empty')}</p>
                        {hasFilters ? (
                            <Button variant="outline" size="sm" onClick={clearFilters}>{t('shared.clearFilters')}</Button>
                        ) : (
                            <Button asChild size="sm" leftIcon={<FontAwesomeIcon icon={faPlus} aria-hidden="true" />}>
                                <Link to="/campaigns/new">{t('layout.nav.newCampaign')}</Link>
                            </Button>
                        )}
                    </div>
                }
            />

            {totalPages > 1 && (
                <Pagination
                    className="mt-4"
                    page={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredCampaigns.length}
                    pageSize={PAGE_SIZE}
                    onChange={setCurrentPage}
                    labels={paginationLabels}
                />
            )}
        </PageContainer>
    );
};

export default CampaignSearchPage;
