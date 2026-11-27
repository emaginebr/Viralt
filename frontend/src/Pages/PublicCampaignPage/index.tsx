import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faEnvelope, faHourglassHalf, faTicket } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { publicService, toLocalClientEntry } from '../../Services/publicService';
import { loadParticipantToken, saveParticipantToken } from '../../Services/apiHelpers';
import type { CampaignInfo } from '../../types/campaign';
import type { PrizeInfo } from '../../types/prize';
import type { LeaderboardEntry, ClientEntry } from '../../Services/publicService';
import type { EntryMethodData } from '../../types/campaignEntry';
import EntryMethodCard from '../../Components/EntryMethodCard';
import PrizeCard from '../../Components/PrizeCard';
import CountdownTimer from '../../Components/CountdownTimer';
import LeaderboardTable from '../../Components/LeaderboardTable';
import CampaignJoinForm from '../../Components/CampaignJoinForm';
import { CampaignStatusBadge } from '../../Components/CampaignStatusBadge';
import LanguageSelect from '../../Components/LanguageSelect';
import { campaignThemeStyle, getYoutubeEmbedUrl } from '../../Components/campaignTheme';
import { Alert, Button, Input, PageContainer, Spinner, buttonClasses } from '../../Components/ui';

const PublicCampaignPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const refToken = searchParams.get('ref');

  // Campaign state
  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [prizes, setPrizes] = useState<PrizeInfo[]>([]);
  const [entryMethods, setEntryMethods] = useState<EntryMethodData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration state
  const [registered, setRegistered] = useState(false);
  const [myToken, setMyToken] = useState<string | null>(null);
  const [myEntries, setMyEntries] = useState<ClientEntry[]>([]);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [liveMessage, setLiveMessage] = useState('');
  const successTitleRef = useRef<HTMLHeadingElement>(null);
  const focusSuccessRef = useRef(false);

  // Load campaign data on mount
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        setLoading(true);
        // One query: campaign + prizes + entry actions (both sorted by sortOrder).
        const details = await publicService.getCampaignDetails(slug);
        const campaignData = details ? details.campaign : null;
        setCampaign(campaignData);
        setPrizes(details ? details.prizes : []);
        setEntryMethods(details ? details.entryMethods : []);

        // Load leaderboard
        try {
          const lb = await publicService.getLeaderboard(slug, 10);
          setLeaderboard(lb);
        } catch { /* leaderboard optional */ }

        if (campaignData) {
          // Track view
          publicService.trackView({
            campaignSlug: campaignData.slug ?? slug,
            referrer: document.referrer || null,
          }).catch(() => { /* non-critical */ });

          // Returning participant: reuse the token saved at registration
          const storedToken = loadParticipantToken(slug);
          if (storedToken) {
            setMyToken(storedToken);
            setRegistered(true);
            publicService.getMyEntries(storedToken).then(setMyEntries).catch(() => { /* ok */ });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('public.errors.load_failed'));
      } finally {
        setLoading(false);
      }
    })();
    // The translation function only provides the fallback message; reloading on language change is not wanted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Registration succeeded (the form already called publicService.register)
  const handleRegistered = useCallback(async (token: string) => {
    if (slug) saveParticipantToken(slug, token);
    focusSuccessRef.current = true;
    setMyToken(token);
    setRegistered(true);
    setServerTotal(0);
    setLiveMessage(t('public.success_title'));
    // Load participant entries
    try {
      const entries = await publicService.getMyEntries(token);
      setMyEntries(entries);
    } catch { /* ok */ }
  }, [slug, t]);

  // Focus goes to the success heading once the form is replaced (not when a stored token is restored)
  useEffect(() => {
    if (registered && focusSuccessRef.current) {
      focusSuccessRef.current = false;
      successTitleRef.current?.focus();
    }
  }, [registered]);

  // Handle entry completion (entryMethodId = CampaignEntry.entryId)
  const handleCompleteEntry = useCallback(async (entryMethodId: number) => {
    if (!myToken) return;
    try {
      setCompletingId(entryMethodId);
      setError(null);
      const result = await publicService.completeEntry({
        token: myToken,
        entryId: entryMethodId,
        entryValue: null,
      });
      if (!result.sucesso) {
        setError(result.mensagem || t('public.errors.entry_failed'));
        return;
      }
      if (typeof result.totalEntries === 'number') setServerTotal(result.totalEntries);
      setMyEntries((prev) => [...prev, toLocalClientEntry(entryMethodId, result.entriesEarned ?? 0)]);
      // The response has no ClientEntry: refresh from the server (keeps the local row if it fails)
      publicService.getMyEntries(myToken).then(setMyEntries).catch(() => { /* ok */ });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('public.errors.entry_failed'));
    } finally {
      setCompletingId(null);
    }
  }, [myToken, t]);

  const handleCopy = useCallback(async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t('public.link_copied'), { description: t('public.link_copied_description') });
    } catch {
      toast.error(t('public.errors.copy_failed'));
    }
  }, [t]);

  // Determine completed entry method IDs
  const completedEntryMethodIds = new Set(myEntries.map((e) => e.entryMethodId));
  // The server total also counts referral bonuses; before any completion, the sum of the entries is used.
  const entriesSum = myEntries.reduce((sum, entry) => sum + (entry.points || 0), 0);
  const totalPoints = serverTotal !== null ? Math.max(serverTotal, entriesSum) : entriesSum;

  // Loading state
  if (loading) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-4">
        <Spinner size="lg" showLabel label={t('public.loading_campaign')} />
      </main>
    );
  }

  // Error state
  if (error && !campaign) {
    return (
      <main id="main">
        <PageContainer variant="public" className="py-10">
          <Alert variant="danger" title={t('public.errors.load_title')}>{error}</Alert>
        </PageContainer>
      </main>
    );
  }

  // Campaign not found
  if (!campaign) {
    return (
      <main id="main">
        <PageContainer variant="public" className="py-10">
          <Alert variant="warning" title={t('public.not_found')} />
        </PageContainer>
      </main>
    );
  }

  const youtubeEmbed = getYoutubeEmbedUrl(campaign.youtubeUrl);
  const referralLink = myToken && campaign.slug
    ? `${window.location.origin}/c/${campaign.slug}?ref=${myToken}`
    : null;
  const shareText = referralLink ? t('public.share_message', { link: referralLink }) : '';
  const showActions = registered || entryMethods.length > 0;

  return (
    <div className="flex min-h-dvh flex-col" style={campaignThemeStyle(campaign.themePrimaryColor)}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold focus:shadow-lg"
      >
        {t('public.skip_to_content')}
      </a>

      {/* Public header */}
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {campaign.logoImage ? (
            <img src={campaign.logoImage} alt="" className="h-9 w-auto max-w-32 object-contain" />
          ) : (
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-foreground bg-accent font-display text-lg font-extrabold text-accent-foreground"
            >
              {campaign.title.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate font-display text-lg font-bold">{campaign.title}</span>
        </div>
        <LanguageSelect />
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 focus:outline-none sm:px-6">
        <p className="sr-only" aria-live="polite">{liveMessage}</p>

        <div className="grid gap-8 lg:grid-cols-3 lg:grid-rows-[auto_1fr] lg:gap-10">
          {/* Hero */}
          <section aria-labelledby="campaign-title" className="lg:col-span-2 lg:row-start-1">
            <div className="relative isolate overflow-hidden rounded-xl border-2 border-foreground bg-secondary shadow-pop">
              {campaign.topImage && (
                <>
                  <img src={campaign.topImage} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-linear-to-b from-overlay/0 from-10% via-overlay/72 via-45% to-overlay/85"
                  />
                </>
              )}
              <div className="flex min-h-80 flex-col justify-end gap-3 p-5 text-primary-foreground sm:min-h-96 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <CampaignStatusBadge status={campaign.status} hideUnknown />
                </div>
                <h1 id="campaign-title" className="font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                  {campaign.title}
                </h1>
                {campaign.description && <p className="max-w-prose text-base sm:text-lg">{campaign.description}</p>}
              </div>
            </div>
          </section>

          {/* Conversion column: countdown + form/success (right after the hero on mobile) */}
          <aside aria-label={t('public.join_region')} className="lg:col-start-3 lg:row-span-2 lg:row-start-1">
            <div className="flex flex-col gap-6 lg:sticky lg:top-6">
              {campaign.endTime && (
                <section aria-labelledby="countdown-title" className="rounded-lg border border-border bg-surface p-5 shadow-sm">
                  <h2 id="countdown-title" className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold">
                    <FontAwesomeIcon icon={faHourglassHalf} className="text-primary" aria-hidden="true" />
                    {t('public.ends_in')}
                  </h2>
                  <CountdownTimer endDate={campaign.endTime} />
                  {campaign.totalParticipants > 0 && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      <b className="font-semibold text-foreground tabular-nums">{campaign.totalParticipants.toLocaleString()}</b>{' '}
                      {t('public.participants_suffix')}
                    </p>
                  )}
                </section>
              )}

              {!registered ? (
                <section aria-labelledby="join-title" className="rounded-lg border-2 border-foreground bg-surface p-5 shadow-pop sm:p-6">
                  <h2 id="join-title" className="font-display text-2xl font-bold">{t('public.join_title')}</h2>
                  <p className="mb-5 mt-1 text-sm text-muted-foreground">{t('public.join_required_note')}</p>
                  <CampaignJoinForm
                    campaign={campaign}
                    refToken={refToken}
                    onRegistered={handleRegistered}
                    idPrefix="join"
                    labelledBy="join-title"
                  />
                </section>
              ) : (
                <section aria-labelledby="success-title" className="rounded-lg border-2 border-foreground bg-surface shadow-pop">
                  <div className="rounded-t-lg bg-success-subtle p-5 text-center sm:p-6">
                    <span
                      aria-hidden="true"
                      className="mx-auto grid size-14 place-items-center rounded-full border-2 border-foreground bg-accent text-2xl text-accent-foreground shadow-pop-sm"
                    >
                      <FontAwesomeIcon icon={faTicket} />
                    </span>
                    <h2 id="success-title" ref={successTitleRef} tabIndex={-1} className="mt-3 font-display text-2xl font-bold focus:outline-none">
                      {t('public.success_title')}
                    </h2>
                    <p className="mt-1 text-sm">{t('public.success_description')}</p>
                  </div>
                  <div className="perforation mx-5" />
                  <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('public.points_label')}</p>
                      <p className="font-display text-4xl font-extrabold tabular-nums" aria-live="polite">
                        {t('public.points_value', { count: totalPoints })}
                      </p>
                    </div>
                    <p className="max-w-40 text-right text-sm text-muted-foreground">{t('public.points_hint')}</p>
                  </div>

                  {referralLink && (
                    <div className="border-t border-border p-5 sm:px-6">
                      <h3 className="font-sans text-sm font-semibold">{t('public.refer_title')}</h3>
                      <p className="mb-2 mt-1 text-sm text-muted-foreground">{t('public.refer_description')}</p>
                      <Input
                        id="ref-link"
                        label={t('public.referral_link_label')}
                        hideLabel
                        readOnly
                        value={referralLink}
                        className="font-mono text-sm"
                        onFocus={(e) => e.currentTarget.select()}
                        rightAddon={
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<FontAwesomeIcon icon={faCopy} aria-hidden="true" />}
                            onClick={() => handleCopy(referralLink)}
                          >
                            {t('public.copy_link')}
                          </Button>
                        }
                      />
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonClasses({ variant: 'outline', size: 'sm' })}
                        >
                          <FontAwesomeIcon icon={faWhatsapp} aria-hidden="true" />
                          {t('public.share_whatsapp')}
                          <span className="sr-only"> {t('shared.opensNewTab')}</span>
                        </a>
                        <a
                          href={`mailto:?subject=${encodeURIComponent(campaign.title)}&body=${encodeURIComponent(shareText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonClasses({ variant: 'outline', size: 'sm' })}
                        >
                          <FontAwesomeIcon icon={faEnvelope} aria-hidden="true" />
                          {t('public.share_email')}
                        </a>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          </aside>

          <div className="flex flex-col gap-8 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:gap-10">
            {/* Campaign video */}
            {youtubeEmbed && (
              <section aria-label={t('public.video_title')}>
                <div className="aspect-video overflow-hidden rounded-xl border-2 border-foreground bg-secondary shadow-pop">
                  <iframe src={youtubeEmbed} title={t('public.video_title')} allowFullScreen className="size-full border-0" />
                </div>
              </section>
            )}

            {/* Entry actions */}
            {showActions && (
              <section aria-labelledby="actions-title">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <h2 id="actions-title" className="font-display text-2xl font-bold sm:text-3xl">{t('public.actions_title')}</h2>
                  {entryMethods.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {registered
                        ? t('public.actions_progress', { done: completedEntryMethodIds.size, total: entryMethods.length })
                        : t('public.actions_locked_hint')}
                    </p>
                  )}
                </div>
                {error && (
                  <Alert
                    variant="danger"
                    className="mt-4"
                    dismissible
                    dismissLabel={t('shared.dismissAlert')}
                    onDismiss={() => setError(null)}
                  >
                    {error}
                  </Alert>
                )}
                {entryMethods.length === 0 ? (
                  <p className="mt-4 text-muted-foreground">{t('public.actions_empty')}</p>
                ) : (
                  <ul className="mt-4 flex flex-col gap-3">
                    {entryMethods.map((entry) => (
                      <li key={entry.entryMethodId}>
                        <EntryMethodCard
                          entry={entry}
                          onComplete={handleCompleteEntry}
                          completed={completedEntryMethodIds.has(entry.entryMethodId)}
                          locked={!registered}
                          loading={completingId === entry.entryMethodId}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* Prizes */}
            {prizes.length > 0 && (
              <section aria-labelledby="prizes-title">
                <h2 id="prizes-title" className="font-display text-2xl font-bold sm:text-3xl">{t('public.prizes_title')}</h2>
                <ul className="mt-4 grid gap-5 sm:grid-cols-3">
                  {prizes.map((prize, index) => (
                    <li key={prize.prizeId}>
                      <PrizeCard prize={prize} position={index + 1} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <section aria-labelledby="lb-title">
                <h2 id="lb-title" className="mb-4 font-display text-2xl font-bold sm:text-3xl">{t('public.leaderboard_title')}</h2>
                <LeaderboardTable entries={leaderboard} />
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          {campaign.termsUrl ? (
            <nav aria-label={t('public.legal_links')}>
              <a
                href={campaign.termsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center px-2 underline underline-offset-2 hover:text-foreground focus-ring"
              >
                {t('public.terms')}
                <span className="sr-only"> {t('shared.opensNewTab')}</span>
              </a>
            </nav>
          ) : (
            <span />
          )}
          <p className="inline-flex min-h-11 items-center gap-1.5 px-2">
            {t('public.made_with')} <b className="font-display text-foreground">Viralt</b>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicCampaignPage;
