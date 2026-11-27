import { useState, useEffect, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faCircleQuestion, faHourglassHalf, faImages, faXmark, type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SubmissionInfo } from '../../types/submission';
import { SubmissionStatus, SubmissionFileType } from '../../types/submission';
import { getApiUrl, getHeaders } from '../../Services/apiHelpers';
import { PageContainer, PageHeader } from '../../Components/ui/PageContainer';
import { Card, CardContent, CardFooter } from '../../Components/ui/Card';
import { Button } from '../../Components/ui/Button';
import { Badge, type BadgeVariant } from '../../Components/ui/Badge';
import { Select } from '../../Components/ui/Select';
import { Alert } from '../../Components/ui/Alert';
import { Skeleton, SkeletonGroup } from '../../Components/ui/Skeleton';
import Breadcrumb from '../../Components/Breadcrumb';

const ALL_STATUSES = -1;

const STATUS_BADGE: Record<number, { key: string; variant: BadgeVariant; icon: IconDefinition }> = {
  [SubmissionStatus.Pending]: { key: 'pending', variant: 'warning', icon: faHourglassHalf },
  [SubmissionStatus.Approved]: { key: 'approved', variant: 'success', icon: faCheck },
  [SubmissionStatus.Rejected]: { key: 'rejected', variant: 'danger', icon: faXmark },
};

const UNKNOWN_BADGE = { key: 'unknown', variant: 'neutral' as BadgeVariant, icon: faCircleQuestion };

const SubmissionModerationPage = () => {
  const { t, i18n } = useTranslation();
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaignIdNum = parseInt(campaignId || '0', 10);

  const [submissions, setSubmissions] = useState<SubmissionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<number>(ALL_STATUSES);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const apiBase = `${getApiUrl()}/api/Submission`;

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/listbycampaign/${campaignIdNum}`, {
        headers: getHeaders(true),
      });
      if (!response.ok) throw new Error(t('submissionModeration.loadFailed'));
      const data = await response.json();
      if (data.sucesso) {
        setSubmissions(data.submissions || []);
      } else {
        throw new Error(data.mensagem || t('submissionModeration.loadFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submissionModeration.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [apiBase, campaignIdNum, t]);

  useEffect(() => {
    if (campaignIdNum > 0) {
      loadSubmissions();
    }
  }, [campaignIdNum, loadSubmissions]);

  const filteredSubmissions = useMemo(() => {
    if (statusFilter === ALL_STATUSES) return submissions;
    return submissions.filter((s) => s.status === statusFilter);
  }, [submissions, statusFilter]);

  const handleModerate = useCallback(async (submissionId: number, newStatus: SubmissionStatus) => {
    setActionLoading(submissionId);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/moderate`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ submissionId, status: newStatus }),
      });
      if (!response.ok) throw new Error(t('submissionModeration.actionFailed'));
      // Update local state
      setSubmissions((prev) => prev.map((s) =>
        s.submissionId === submissionId ? { ...s, status: newStatus } : s
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submissionModeration.actionFailed'));
    } finally {
      setActionLoading(null);
    }
  }, [apiBase, t]);

  const getStatusBadge = (status: number) => {
    const info = STATUS_BADGE[status] || UNKNOWN_BADGE;
    return (
      <Badge variant={info.variant} icon={<FontAwesomeIcon icon={info.icon} />}>
        {t(`submissionModeration.status.${info.key}`)}
      </Badge>
    );
  };

  const statusOptions = [
    { value: ALL_STATUSES, label: t('submissionModeration.allStatuses') },
    { value: SubmissionStatus.Pending, label: t('submissionModeration.status.pending') },
    { value: SubmissionStatus.Approved, label: t('submissionModeration.status.approved') },
    { value: SubmissionStatus.Rejected, label: t('submissionModeration.status.rejected') },
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
              { label: t('submissionModeration.title') },
            ]}
          />
        }
        title={t('submissionModeration.title')}
        description={t('submissionModeration.description')}
        actions={
          <Select
            label={t('submissionModeration.filterLabel')}
            value={statusFilter}
            onChange={(e) => setStatusFilter(parseInt(e.target.value, 10))}
            options={statusOptions}
            wrapperClassName="min-w-48"
          />
        }
      />

      {error && (
        <Alert
          variant="danger"
          className="mb-6"
          dismissible
          dismissLabel={t('shared.dismissAlert')}
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <p className="sr-only" aria-live="polite">
        {loading ? '' : t('submissionModeration.resultCount', { count: filteredSubmissions.length })}
      </p>

      {loading ? (
        <SkeletonGroup label={t('submissionModeration.loading')} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="aspect-4/5 rounded-lg" />
          ))}
        </SkeletonGroup>
      ) : filteredSubmissions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-input px-4 py-12 text-center text-muted-foreground">
          <FontAwesomeIcon icon={faImages} className="text-2xl" aria-hidden="true" />
          <p>
            {statusFilter !== ALL_STATUSES
              ? t('submissionModeration.emptyFiltered')
              : t('submissionModeration.empty')}
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubmissions.map((submission) => {
            const isVideo = submission.fileType === SubmissionFileType.Video;
            const isActioning = actionLoading === submission.submissionId;
            const name = submission.caption || t('submissionModeration.submissionNumber', { id: submission.submissionId });

            return (
              <li key={submission.submissionId}>
                <Card as="article" className="flex h-full flex-col overflow-hidden" aria-busy={isActioning || undefined}>
                  <div className="relative aspect-4/3 bg-foreground">
                    {isVideo ? (
                      <video
                        src={submission.fileUrl}
                        className="absolute inset-0 size-full object-cover"
                        controls
                        muted
                        playsInline
                        aria-label={name}
                      />
                    ) : (
                      <img
                        src={submission.fileUrl}
                        alt={submission.caption || t('submissionModeration.imageAlt')}
                        className="absolute inset-0 size-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute right-2 top-2">{getStatusBadge(submission.status)}</div>
                  </div>
                  <CardContent className="flex flex-1 flex-col gap-2">
                    {submission.caption && <p className="font-semibold">{submission.caption}</p>}
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <dt>{t('submissionModeration.votes')}</dt>
                      <dd className="tabular-nums text-foreground">{submission.voteCount}</dd>
                      {submission.judgeScore !== null && (
                        <>
                          <dt>{t('submissionModeration.judgeScore')}</dt>
                          <dd className="tabular-nums text-foreground">{submission.judgeScore}</dd>
                        </>
                      )}
                      <dt>{t('submissionModeration.submittedAt')}</dt>
                      <dd className="tabular-nums text-foreground">
                        {new Date(submission.submittedAt).toLocaleString(i18n.language)}
                      </dd>
                    </dl>
                  </CardContent>
                  <CardFooter className="justify-start">
                    {submission.status !== SubmissionStatus.Approved && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={isActioning}
                        aria-label={t('submissionModeration.approveNamed', { name })}
                        leftIcon={<FontAwesomeIcon icon={faCheck} aria-hidden="true" />}
                        onClick={() => handleModerate(submission.submissionId, SubmissionStatus.Approved)}
                      >
                        {t('submissionModeration.approve')}
                      </Button>
                    )}
                    {submission.status !== SubmissionStatus.Rejected && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-danger hover:bg-danger-subtle"
                        disabled={isActioning}
                        aria-label={t('submissionModeration.rejectNamed', { name })}
                        leftIcon={<FontAwesomeIcon icon={faXmark} aria-hidden="true" />}
                        onClick={() => handleModerate(submission.submissionId, SubmissionStatus.Rejected)}
                      >
                        {t('submissionModeration.reject')}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </PageContainer>
  );
};

export default SubmissionModerationPage;
