import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faEnvelope, faMinus, faPaperPlane, faShuffle, faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import { useWinner } from '../../hooks/useWinner';
import type { DrawRequest, NotifyAllResult, WinnerInfo } from '../../types/winner';
import { PageContainer, PageHeader } from '../../Components/ui/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../Components/ui/Card';
import { Button } from '../../Components/ui/Button';
import { Input } from '../../Components/ui/Input';
import { Select } from '../../Components/ui/Select';
import { Alert } from '../../Components/ui/Alert';
import { Badge } from '../../Components/ui/Badge';
import { Table, type TableColumn } from '../../Components/ui/Table';
import Breadcrumb from '../../Components/Breadcrumb';

const SELECTION_METHODS: { value: number; key: string }[] = [
  { value: 0, key: 'random' },
  { value: 1, key: 'leaderboard' },
  { value: 2, key: 'manual' },
];

const WinnerSelectionPage = () => {
  const { t, i18n } = useTranslation();
  const { campaignId } = useParams<{ campaignId: string }>();
  const { winners, loading, error, loadWinners, drawWinners, notifyWinner, notifyAllWinners, clearError } = useWinner();

  const [winnerCount, setWinnerCount] = useState<number>(1);
  const [selectionMethod, setSelectionMethod] = useState<number>(0);
  const [notifyResult, setNotifyResult] = useState<NotifyAllResult | null>(null);

  const notifyFailures = notifyResult?.falhas ?? [];

  const campaignIdNum = Number(campaignId);

  useEffect(() => {
    if (campaignIdNum) {
      loadWinners(campaignIdNum).catch(() => { /* error handled by context */ });
    }
  }, [campaignIdNum, loadWinners]);

  const handleDraw = useCallback(async () => {
    if (!campaignIdNum) return;
    const request: DrawRequest = { winnerCount, selectionMethod };
    try {
      await drawWinners(campaignIdNum, request);
    } catch {
      /* error handled by context */
    }
  }, [campaignIdNum, winnerCount, selectionMethod, drawWinners]);

  const handleNotify = useCallback(async (winnerId: number) => {
    try {
      await notifyWinner(winnerId);
    } catch {
      /* error handled by context */
    }
  }, [notifyWinner]);

  const handleNotifyAll = useCallback(async () => {
    if (!campaignIdNum) return;
    setNotifyResult(null);
    try {
      const result = await notifyAllWinners(campaignIdNum);
      setNotifyResult(result);
    } catch {
      /* error handled by context */
    }
  }, [campaignIdNum, notifyAllWinners]);

  const getMethodLabel = (method: number): string => {
    const found = SELECTION_METHODS.find((m) => m.value === method);
    return found ? t(`winnerSelection.methods.${found.key}`) : t('shared.unknown');
  };

  const yesNoBadge = (value: boolean) =>
    value ? (
      <Badge variant="success" icon={<FontAwesomeIcon icon={faCheck} />}>{t('shared.yes')}</Badge>
    ) : (
      <Badge variant="neutral" icon={<FontAwesomeIcon icon={faMinus} />}>{t('shared.no')}</Badge>
    );

  const columns: TableColumn<WinnerInfo>[] = [
    { key: 'winnerId', header: t('winnerSelection.columns.winnerId'), rowHeader: true, numeric: true },
    { key: 'clientId', header: t('winnerSelection.columns.clientId'), numeric: true },
    {
      key: 'prizeId',
      header: t('winnerSelection.columns.prizeId'),
      numeric: true,
      accessor: (w) => w.prizeId ?? '—',
    },
    {
      key: 'selectionMethod',
      header: t('winnerSelection.columns.method'),
      accessor: (w) => getMethodLabel(w.selectionMethod),
    },
    {
      key: 'selectedAt',
      header: t('winnerSelection.columns.selectedAt'),
      className: 'tabular-nums',
      accessor: (w) => new Date(w.selectedAt).toLocaleString(i18n.language),
    },
    {
      key: 'notified',
      header: t('winnerSelection.columns.notified'),
      accessor: (w) => yesNoBadge(w.notified),
    },
    {
      key: 'claimed',
      header: t('winnerSelection.columns.claimed'),
      accessor: (w) => yesNoBadge(w.claimed),
    },
    {
      key: 'actions',
      header: t('winnerSelection.columns.actions'),
      actions: true,
      className: 'px-2 py-1',
      accessor: (w) =>
        !w.notified ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNotify(w.winnerId)}
            disabled={loading}
            aria-label={t('winnerSelection.notifyNamed', { id: w.winnerId })}
            leftIcon={<FontAwesomeIcon icon={faEnvelope} aria-hidden="true" />}
          >
            {t('winnerSelection.notify')}
          </Button>
        ) : null,
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
              { label: t('participantList.campaign'), to: `/campaigns/${campaignId}` },
              { label: t('winnerSelection.title') },
            ]}
          />
        }
        title={t('winnerSelection.title')}
        description={t('winnerSelection.campaignId', { id: campaignId })}
      />

      {error && (
        <Alert
          variant="danger"
          className="mb-6"
          dismissible
          dismissLabel={t('shared.dismissAlert')}
          onDismiss={clearError}
        >
          {error}
        </Alert>
      )}

      {notifyResult && (
        <Alert
          variant={notifyFailures.length > 0 ? 'warning' : 'success'}
          className="mb-6"
          title={notifyResult.mensagem}
          dismissible
          dismissLabel={t('winnerSelection.closeSummary')}
          onDismiss={() => setNotifyResult(null)}
        >
          {notifyFailures.length > 0 && (
            <>
              <p className="mb-1 mt-2 font-semibold">{t('winnerSelection.failures')}</p>
              <ul className="list-disc pl-5">
                {notifyFailures.map((f) => (
                  <li key={f.winnerId}>
                    {f.clientName ?? t('winnerSelection.noName')} ({f.email ?? t('winnerSelection.noEmail')}): {f.motivo}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Alert>
      )}

      {/* Draw Form */}
      <Card as="section" aria-labelledby="draw-title" className="mb-6">
        <CardHeader>
          <div>
            <CardTitle id="draw-title">{t('winnerSelection.drawTitle')}</CardTitle>
            <CardDescription>{t('winnerSelection.drawDescription')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-[10rem_16rem_auto] sm:items-end"
            onSubmit={(e) => { e.preventDefault(); void handleDraw(); }}
          >
            <Input
              type="number"
              id="winnerCount"
              min={1}
              className="tabular-nums"
              label={t('winnerSelection.winnerCount')}
              value={winnerCount}
              onChange={(e) => setWinnerCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
            <Select
              id="selectionMethod"
              label={t('winnerSelection.selectionMethod')}
              value={selectionMethod}
              onChange={(e) => setSelectionMethod(Number(e.target.value))}
              options={SELECTION_METHODS.map((m) => ({ value: m.value, label: t(`winnerSelection.methods.${m.key}`) }))}
            />
            <Button
              type="submit"
              loading={loading}
              loadingText={t('winnerSelection.drawing')}
              leftIcon={<FontAwesomeIcon icon={faShuffle} aria-hidden="true" />}
            >
              {t('winnerSelection.draw')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Winners List */}
      <section aria-labelledby="winners-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="winners-title" className="font-display text-xl font-bold">
            {t('winnerSelection.selectedWinners', { count: winners.length })}
          </h2>
          {winners.length > 0 && (
            <Button
              variant="outline"
              onClick={handleNotifyAll}
              disabled={loading}
              leftIcon={<FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" />}
            >
              {t('winnerSelection.notifyAll')}
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          rows={winners}
          caption={t('winnerSelection.caption')}
          rowKey={(w) => w.winnerId}
          loading={loading && winners.length === 0}
          loadingRows={3}
          className="[&_table]:min-w-208"
          empty={
            <div className="flex flex-col items-center gap-3 py-4">
              <FontAwesomeIcon icon={faTrophy} className="text-2xl" aria-hidden="true" />
              <p>{t('winnerSelection.empty')}</p>
            </div>
          }
        />
      </section>
    </PageContainer>
  );
};

export default WinnerSelectionPage;
