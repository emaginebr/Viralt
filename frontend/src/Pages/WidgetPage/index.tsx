import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare, faCopy, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import { publicService, type ClientEntry } from '../../Services/publicService';
import { loadParticipantToken, saveParticipantToken } from '../../Services/apiHelpers';
import type { CampaignInfo } from '../../types/campaign';
import CountdownTimer from '../../Components/CountdownTimer';
import CampaignJoinForm from '../../Components/CampaignJoinForm';
import { CampaignStatusBadge } from '../../Components/CampaignStatusBadge';
import LanguageSelect from '../../Components/LanguageSelect';
import { campaignThemeStyle } from '../../Components/campaignTheme';
import { Alert, Button, Spinner, buttonClasses } from '../../Components/ui';

const WidgetPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const refToken = searchParams.get('ref');
  // Anonymous visitors: the campaign comes from the public GraphQL query, not the admin context.
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignInfo | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const [myToken, setMyToken] = useState<string | null>(null);
  const [myEntries, setMyEntries] = useState<ClientEntry[]>([]);
  const focusSuccessRef = useRef(false);

  // Load campaign by slug on mount
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const loadCampaign = async () => {
      try {
        const result = await publicService.getCampaign(slug);
        if (!cancelled && result) {
          setSelectedCampaign(result);
          // Returning participant: reuse the token saved at registration
          const storedToken = loadParticipantToken(slug);
          if (storedToken) {
            setMyToken(storedToken);
            publicService.getMyEntries(storedToken)
              .then((entries) => { if (!cancelled) setMyEntries(entries); })
              .catch(() => { /* ok */ });
          }
        }
      } catch {
        /* silent fail for widget */
      }
    };
    loadCampaign();
    return () => { cancelled = true; };
  }, [slug]);

  // Send the content height to the parent (contracts/widget-embed.md). The root element is
  // measured, not documentElement.scrollHeight, so the iframe can also shrink.
  useEffect(() => {
    const root = rootRef.current;
    if (!slug || !root) return undefined;

    const sendHeight = (): void => {
      const height = Math.ceil(root.getBoundingClientRect().height);
      window.parent.postMessage({ type: 'viralt-resize', slug, height }, '*');
    };

    sendHeight();
    window.addEventListener('resize', sendHeight);
    const observer = new ResizeObserver(sendHeight);
    observer.observe(root);

    return () => {
      window.removeEventListener('resize', sendHeight);
      observer.disconnect();
    };
  }, [slug]);

  // Apply theme CSS variables from campaign data
  useEffect(() => {
    if (!selectedCampaign) return;
    const root = document.documentElement;
    if (selectedCampaign.themePrimaryColor) root.style.setProperty('--theme-primary', selectedCampaign.themePrimaryColor);
    if (selectedCampaign.themeSecondaryColor) root.style.setProperty('--theme-secondary', selectedCampaign.themeSecondaryColor);
    if (selectedCampaign.themeBgColor) root.style.setProperty('--theme-bg', selectedCampaign.themeBgColor);
    if (selectedCampaign.themeFont) root.style.setProperty('--theme-font', selectedCampaign.themeFont);

    return () => {
      root.style.removeProperty('--theme-primary');
      root.style.removeProperty('--theme-secondary');
      root.style.removeProperty('--theme-bg');
      root.style.removeProperty('--theme-font');
    };
  }, [selectedCampaign]);

  // Set Open Graph meta tags
  useEffect(() => {
    if (!selectedCampaign) return;
    document.title = selectedCampaign.title;

    const setMeta = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('og:title', selectedCampaign.title);
    if (selectedCampaign.description) setMeta('og:description', selectedCampaign.description.replace(/<[^>]*>/g, ''));
    if (selectedCampaign.topImage) setMeta('og:image', selectedCampaign.topImage);
    if (selectedCampaign.slug) setMeta('og:url', `${window.location.origin}/c/${selectedCampaign.slug}`);
    setMeta('og:type', 'website');
  }, [selectedCampaign]);

  const handleRegistered = useCallback(async (token: string) => {
    if (slug) saveParticipantToken(slug, token);
    focusSuccessRef.current = true;
    setMyToken(token);
    try {
      const entries = await publicService.getMyEntries(token);
      setMyEntries(entries);
    } catch { /* ok */ }
  }, [slug]);

  // The form is replaced by the success state: move focus there instead of losing it to <body>
  // (not when a stored token is restored on load).
  useEffect(() => {
    if (myToken && focusSuccessRef.current) {
      focusSuccessRef.current = false;
      document.getElementById('w-success')?.focus();
    }
  }, [myToken]);

  const handleCopy = useCallback(async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t('public.link_copied'), { description: t('public.link_copied_description') });
    } catch {
      toast.error(t('public.errors.copy_failed'));
    }
  }, [t]);

  const campaign = selectedCampaign;
  const campaignSlug = campaign?.slug ?? slug;
  const fullPageUrl = campaignSlug ? `${window.location.origin}/c/${campaignSlug}` : null;
  const referralLink = myToken && fullPageUrl ? `${fullPageUrl}?ref=${myToken}` : null;
  const totalPoints = myEntries.reduce((sum, entry) => sum + (entry.points || 0), 0);

  return (
    // Root measured by the ResizeObserver: no viewport-based height here (contract).
    <div ref={rootRef} className="bg-background p-3 sm:p-4">
      {!campaign ? (
        <div className="flex justify-center p-4">
          <Spinner size="sm" label={t('loading')} />
        </div>
      ) : (
        <main
          className="mx-auto w-full max-w-md overflow-hidden rounded-xl border-2 border-foreground bg-surface shadow-pop"
          style={campaignThemeStyle(campaign.themePrimaryColor)}
        >
          {/* Compact header */}
          <div className="relative isolate overflow-hidden bg-secondary px-4 pb-4 pt-5 text-secondary-foreground">
            <span aria-hidden="true" className="absolute -right-10 -top-10 -z-10 size-48 rounded-full bg-primary opacity-40" />
            <div className="flex items-center gap-2">
              {campaign.logoImage ? (
                <img src={campaign.logoImage} alt="" className="h-8 w-auto max-w-24 rounded-sm bg-surface object-contain" />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-full border-2 border-secondary-foreground bg-accent font-display text-sm font-extrabold text-accent-foreground"
                >
                  {campaign.title.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="ml-auto">
                <CampaignStatusBadge status={campaign.status} hideUnknown />
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-extrabold">{campaign.title}</h1>
            {campaign.endTime && (
              <p className="mt-2 flex items-center gap-2 text-sm text-secondary-muted-foreground">
                <FontAwesomeIcon icon={faHourglassHalf} aria-hidden="true" />
                <span>
                  {t('public.ends_in')}{' '}
                  <span className="text-secondary-foreground">
                    <CountdownTimer endDate={campaign.endTime} variant="compact" />
                  </span>
                </span>
              </p>
            )}
          </div>

          {campaign.topImage && <img src={campaign.topImage} alt="" className="block h-auto w-full" />}

          {campaign.description && (
            <div
              className="border-b border-border px-4 py-3 text-sm"
              dangerouslySetInnerHTML={{ __html: campaign.description }}
            />
          )}

          {!myToken ? (
            <section aria-labelledby="w-join" className="flex flex-col gap-4 p-4">
              <h2 id="w-join" className="font-sans text-base font-bold">{t('widget.join_title')}</h2>
              <CampaignJoinForm
                campaign={campaign}
                refToken={refToken}
                onRegistered={handleRegistered}
                idPrefix="w"
                labelledBy="w-join"
                compact
              />
              {campaign.totalParticipants > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  <b className="text-foreground tabular-nums">{campaign.totalParticipants.toLocaleString()}</b>{' '}
                  {t('public.participants_suffix')}
                </p>
              )}
            </section>
          ) : (
            <section aria-label={t('public.success_title')} className="flex flex-col gap-4 p-4">
              <Alert
                id="w-success"
                tabIndex={-1}
                variant="success"
                title={t('public.success_title')}
                className="focus:outline-none"
              >
                {t('widget.success_points', { count: totalPoints })}
              </Alert>
              {referralLink && (
                <Button
                  variant="accent"
                  fullWidth
                  leftIcon={<FontAwesomeIcon icon={faCopy} aria-hidden="true" />}
                  onClick={() => handleCopy(referralLink)}
                >
                  {t('widget.copy_referral')}
                </Button>
              )}
              {fullPageUrl && (
                <a
                  href={fullPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses({ variant: 'outline', fullWidth: true })}
                >
                  {t('widget.open_full_page')}
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" className="text-xs" />
                  <span className="sr-only"> {t('shared.opensNewTab')}</span>
                </a>
              )}
            </section>
          )}

          {/* Widget footer */}
          <footer className="flex items-center justify-between gap-2 border-t border-border px-4 py-1 text-xs text-muted-foreground">
            <LanguageSelect variant="footer" />
            <p className="inline-flex min-h-11 items-center gap-1 px-1">
              {t('public.made_with')} <b className="font-display text-foreground">Viralt</b>
            </p>
          </footer>
        </main>
      )}
    </div>
  );
};

export default WidgetPage;
