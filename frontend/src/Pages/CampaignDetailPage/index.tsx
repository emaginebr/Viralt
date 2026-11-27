import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar, faChartColumn, faCheck, faCode, faCopy, faEye, faPen, faTrophy, faUsers,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCampaign } from '../../hooks/useCampaign';
import type { CampaignInfo } from '../../types/campaign';
import { PageContainer, PageHeader } from '../../Components/ui/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../Components/ui/Card';
import { Button } from '../../Components/ui/Button';
import { Badge } from '../../Components/ui/Badge';
import { Alert } from '../../Components/ui/Alert';
import { Skeleton, SkeletonGroup, SkeletonText, SkeletonTitle } from '../../Components/ui/Skeleton';
import Breadcrumb from '../../Components/Breadcrumb';
import { CampaignStatusBadge, entryTypeKey } from '../../Components/CampaignStatusBadge';

interface StatCardProps {
  icon: IconDefinition;
  value: number;
  label: string;
  locale: string;
}

const StatCard = ({ icon, value, label, locale }: StatCardProps) => (
  <Card>
    <CardContent className="flex items-center gap-4">
      <span aria-hidden="true" className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-xl text-primary">
        <FontAwesomeIcon icon={icon} />
      </span>
      <div>
        <p className="font-display text-3xl font-extrabold tabular-nums">{(value ?? 0).toLocaleString(locale)}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

interface ActionCardProps {
  icon: IconDefinition;
  title: string;
  description: string;
  to: string;
  linkLabel: string;
}

const ActionCard = ({ icon, title, description, to, linkLabel }: ActionCardProps) => (
  <Card variant="interactive" className="flex flex-col">
    <CardHeader>
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-muted text-lg">
          <FontAwesomeIcon icon={icon} />
        </span>
        <div>
          <CardTitle as="h3">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="mt-auto">
      <Button asChild variant="outline" size="sm">
        <Link to={to}>{linkLabel}</Link>
      </Button>
    </CardContent>
  </Card>
);

const CampaignDetailPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaignIdNum = parseInt(campaignId || '0', 10);

  const { getCampaignById } = useCampaign();

  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [embedCopied, setEmbedCopied] = useState(false);

  useEffect(() => {
    if (campaignIdNum > 0) {
      setLoading(true);
      getCampaignById(campaignIdNum)
        .then((result) => {
          if (result.sucesso && result.campaign) {
            setCampaign(result.campaign);
          } else {
            setError(result.mensagem || t('campaignDetail.notFound'));
          }
        })
        .catch((err) => setError(err instanceof Error ? err.message : t('campaignDetail.loadFailed')))
        .finally(() => setLoading(false));
    }
  }, [campaignIdNum, getCampaignById, t]);

  const getEmbedCode = () => {
    if (!campaign?.slug) return '';
    const baseUrl = window.location.origin;
    return `<iframe src="${baseUrl}/c/${campaign.slug}" width="100%" height="600" frameborder="0"></iframe>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode()).then(() => {
      setEmbedCopied(true);
      toast.success(t('embedCode.copiedToast'));
      setTimeout(() => setEmbedCopied(false), 2000);
    });
  };

  const breadcrumbLabel = t('shared.breadcrumb');

  if (loading) {
    return (
      <PageContainer>
        <SkeletonGroup label={t('campaignDetail.loading')} className="flex flex-col gap-6">
          <Skeleton className="h-4 w-40" />
          <SkeletonTitle />
          <SkeletonText lines={2} />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </SkeletonGroup>
      </PageContainer>
    );
  }

  if (error || !campaign) {
    return (
      <PageContainer>
        <PageHeader
          breadcrumb={<Breadcrumb className="mb-1" label={breadcrumbLabel} items={[{ label: t('layout.nav.campaigns'), to: '/campaigns' }, { label: t('campaignDetail.notFoundTitle') }]} />}
          title={t('campaignDetail.notFoundTitle')}
        />
        <Alert variant="danger" className="mb-6">{error || t('campaignDetail.notFound')}</Alert>
        <Link to="/campaigns">{t('campaignDetail.backToCampaigns')}</Link>
      </PageContainer>
    );
  }

  const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString(i18n.language) : null);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={
          <Breadcrumb
            className="mb-1"
            label={breadcrumbLabel}
            items={[
              { label: t('layout.nav.campaigns'), to: '/campaigns' },
              { label: campaign.title },
            ]}
          />
        }
        title={campaign.title}
        description={campaign.description}
        actions={
          <Button
            leftIcon={<FontAwesomeIcon icon={faPen} aria-hidden="true" />}
            onClick={() => navigate(`/campaigns/${campaignIdNum}/edit`)}
          >
            {t('campaignDetail.edit')}
          </Button>
        }
      />

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <CampaignStatusBadge status={campaign.status} />
        {campaign.slug && <Badge variant="info" className="font-mono">/{campaign.slug}</Badge>}
        <Badge variant="neutral">{t(entryTypeKey(campaign.entryType))}</Badge>
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <FontAwesomeIcon icon={faCalendar} aria-hidden="true" />
          <span className="sr-only">{t('campaignDetail.period')}:</span>
          <span className="tabular-nums">
            {formatDate(campaign.startTime) ?? t('campaignDetail.noStartDate')}
            {' – '}
            {formatDate(campaign.endTime) ?? t('campaignDetail.noEndDate')}
          </span>
        </span>
      </div>

      <section aria-labelledby="campaign-stats" className="mb-8">
        <h2 id="campaign-stats" className="sr-only">{t('campaignDetail.statsTitle')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={faUsers} value={campaign.totalParticipants} label={t('campaignDetail.participants')} locale={i18n.language} />
          <StatCard icon={faChartColumn} value={campaign.totalEntries} label={t('campaignDetail.totalEntries')} locale={i18n.language} />
          <StatCard icon={faEye} value={campaign.viewCount} label={t('campaignDetail.views')} locale={i18n.language} />
        </div>
      </section>

      <section aria-labelledby="campaign-actions" className="mb-8">
        <h2 id="campaign-actions" className="mb-4 font-display text-xl font-bold">{t('campaignDetail.manageTitle')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <ActionCard
            icon={faUsers}
            title={t('campaignDetail.manageParticipants')}
            description={t('campaignDetail.manageParticipantsHint')}
            to={`/campaigns/${campaignIdNum}/participants`}
            linkLabel={t('campaignDetail.viewParticipants')}
          />
          <ActionCard
            icon={faTrophy}
            title={t('campaignDetail.selectWinners')}
            description={t('campaignDetail.selectWinnersHint')}
            to={`/campaigns/${campaignIdNum}/winners`}
            linkLabel={t('campaignDetail.selectWinners')}
          />
          <ActionCard
            icon={faPen}
            title={t('campaignDetail.editCampaign')}
            description={t('campaignDetail.editCampaignHint')}
            to={`/campaigns/${campaignIdNum}/edit`}
            linkLabel={t('campaignDetail.editCampaign')}
          />
        </div>
      </section>

      {campaign.slug && (
        <Card as="section" aria-labelledby="campaign-embed">
          <CardHeader>
            <div>
              <CardTitle id="campaign-embed" className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCode} aria-hidden="true" />
                {t('embedCode.title')}
              </CardTitle>
              <CardDescription>{t('campaignDetail.embedDescription')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <pre className="overflow-x-auto rounded-md bg-muted p-4 font-mono text-sm">
              <code>{getEmbedCode()}</code>
            </pre>
            <div>
              <Button
                variant={embedCopied ? 'secondary' : 'outline'}
                leftIcon={<FontAwesomeIcon icon={embedCopied ? faCheck : faCopy} aria-hidden="true" />}
                onClick={copyEmbedCode}
              >
                {embedCopied ? t('embedCode.copied') : t('embedCode.copy')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
};

export default CampaignDetailPage;
