import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faArrowRight, faCamera, faCircleInfo, faEye, faEyeSlash, faGear,
  faPaintbrush, faPlus, faRankingStar, faRocket, faTag, faTicket, faTrash, faTrophy, faClipboardCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCampaign } from '../../hooks/useCampaign';
import { usePrize } from '../../hooks/usePrize';
import type { CampaignInfo, CampaignInsertInfo, CampaignUpdateInfo } from '../../types/campaign';
import { getSessionUserId } from '../../Services/apiHelpers';
import type { PrizeInsertInfo } from '../../types/prize';
import { PageContainer, PageHeader } from '../../Components/ui/PageContainer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../Components/ui/Card';
import { Button } from '../../Components/ui/Button';
import { Input } from '../../Components/ui/Input';
import { Textarea } from '../../Components/ui/Textarea';
import { Select } from '../../Components/ui/Select';
import { Checkbox } from '../../Components/ui/Checkbox';
import { Radio, RadioGroup } from '../../Components/ui/Radio';
import { ColorInput } from '../../Components/ui/ColorInput';
import { Alert } from '../../Components/ui/Alert';
import { Badge } from '../../Components/ui/Badge';
import { Tabs, type TabItem, type TabStatus } from '../../Components/ui/Tabs';
import { useConfirm } from '../../Components/ui/ConfirmModal';
import Breadcrumb from '../../Components/Breadcrumb';
import { CampaignStatusBadge, entryTypeKey } from '../../Components/CampaignStatusBadge';

interface PrizeFormItem {
  key: number;
  /** Set for prizes loaded from the server (edit mode): updated instead of inserted again. */
  prizeId?: number;
  /** Server value, kept on update (the form has no field for it). */
  minEntriesRequired?: number | null;
  title: string;
  description: string;
  image: string;
  quantity: number;
  prizeType: number;
  couponCode: string;
  sortOrder: number;
}

const ENTRY_TYPE_OPTIONS = [
  { value: 0, icon: faTicket },
  { value: 1, icon: faRankingStar },
  { value: 2, icon: faCamera },
  { value: 3, icon: faTag },
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
];

const PRIZE_TYPES = [
  { value: 0, key: 'physical' },
  { value: 1, key: 'digital' },
  { value: 2, key: 'coupon' },
];

const TABS = ['basic', 'appearance', 'prizes', 'settings', 'review'];

const DESKTOP_QUERY = '(min-width: 1024px)';

let prizeKeyCounter = 0;

/** Vertical tabs on lg+, horizontal and scrollable below (docs/design/components.md §21). */
const useIsDesktop = (): boolean => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(DESKTOP_QUERY).matches
      : true,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return isDesktop;
};

interface ReviewRowProps {
  label: ReactNode;
  children: ReactNode;
}

const ReviewRow = ({ label, children }: ReviewRowProps) => (
  <div className="grid gap-1 py-2 sm:grid-cols-[12rem_1fr] sm:gap-4">
    <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
    <dd className="min-w-0 break-words">{children}</dd>
  </div>
);

interface SwatchProps {
  color: string;
}

const Swatch = ({ color }: SwatchProps) => (
  <span className="inline-flex items-center gap-2 font-mono text-sm uppercase">
    <span
      aria-hidden="true"
      className="inline-block size-4 rounded-sm border border-foreground/20"
      style={{ backgroundColor: color }}
    />
    {color}
  </span>
);

const CampaignBuilderPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const isDesktop = useIsDesktop();
  const { campaignId } = useParams<{ campaignId: string }>();
  const isEditing = !!campaignId;

  const { getCampaignById, insertCampaign, updateCampaign } = useCampaign();
  const { loadPrizesByCampaign, prizes: existingPrizes, insertPrize, updatePrize, deletePrize } = usePrize();

  const [activeTab, setActiveTab] = useState('basic');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // Edit mode: campaign as loaded, so fields without a form control are sent back unchanged
  const [loadedCampaign, setLoadedCampaign] = useState<CampaignInfo | null>(null);

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timezone, setTimezone] = useState('');
  const [entryType, setEntryType] = useState<number>(0);
  const [winnerCount, setWinnerCount] = useState<number>(1);
  const [password, setPassword] = useState('');

  // Step 2: Appearance
  const [themePrimaryColor, setThemePrimaryColor] = useState('#3b82f6');
  const [themeSecondaryColor, setThemeSecondaryColor] = useState('#10b981');
  const [themeBgColor, setThemeBgColor] = useState('#ffffff');
  const [themeFont, setThemeFont] = useState('');
  const [logoImage, setLogoImage] = useState('');
  const [customCss, setCustomCss] = useState('');

  // Step 3: Prizes
  const [prizeItems, setPrizeItems] = useState<PrizeFormItem[]>([]);

  // Step 4: Settings
  const [termsUrl, setTermsUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [geoCountries, setGeoCountries] = useState('');
  const [blockVpn, setBlockVpn] = useState(false);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [welcomeEmailEnabled, setWelcomeEmailEnabled] = useState(false);
  const [welcomeEmailSubject, setWelcomeEmailSubject] = useState('');
  const [welcomeEmailBody, setWelcomeEmailBody] = useState('');
  const [gaTrackingId, setGaTrackingId] = useState('');
  const [fbPixelId, setFbPixelId] = useState('');
  const [tiktokPixelId, setTiktokPixelId] = useState('');
  const [gtmId, setGtmId] = useState('');

  // Load existing campaign data for editing
  useEffect(() => {
    if (isEditing) {
      const id = parseInt(campaignId!, 10);
      getCampaignById(id).then((result) => {
        if (result.sucesso && result.campaign) {
          const c = result.campaign;
          setLoadedCampaign(c);
          setTitle(c.title || '');
          setDescription(c.description || '');
          setStartTime(c.startTime || '');
          setEndTime(c.endTime || '');
          setTimezone(c.timezone || '');
          setEntryType(c.entryType ?? 0);
          setWinnerCount(c.winnerCount ?? 1);
          setPassword(c.password || '');
          setThemePrimaryColor(c.themePrimaryColor || '#3b82f6');
          setThemeSecondaryColor(c.themeSecondaryColor || '#10b981');
          setThemeBgColor(c.themeBgColor || '#ffffff');
          setThemeFont(c.themeFont || '');
          setLogoImage(c.logoImage || '');
          setCustomCss(c.customCss || '');
          setTermsUrl(c.termsUrl || '');
          setRedirectUrl(c.redirectUrl || '');
          setGeoCountries(c.geoCountries || '');
          setBlockVpn(c.blockVpn);
          setRequireEmailVerification(c.requireEmailVerification);
          setWelcomeEmailEnabled(c.welcomeEmailEnabled);
          setWelcomeEmailSubject(c.welcomeEmailSubject || '');
          setWelcomeEmailBody(c.welcomeEmailBody || '');
          setGaTrackingId(c.gaTrackingId || '');
          setFbPixelId(c.fbPixelId || '');
          setTiktokPixelId(c.tiktokPixelId || '');
          setGtmId(c.gtmId || '');
        }
      }).catch(() => setError(t('campaignBuilder.loadFailed')));

      loadPrizesByCampaign(id).catch(() => { /* ignore */ });
    }
  }, [campaignId, isEditing, getCampaignById, loadPrizesByCampaign, t]);

  // Sync existing prizes into form
  useEffect(() => {
    if (isEditing && existingPrizes.length > 0 && prizeItems.length === 0) {
      setPrizeItems(existingPrizes.map((p) => ({
        key: ++prizeKeyCounter,
        prizeId: p.prizeId,
        minEntriesRequired: p.minEntriesRequired,
        title: p.title,
        description: p.description || '',
        image: p.image || '',
        quantity: p.quantity,
        prizeType: p.prizeType,
        couponCode: p.couponCode || '',
        sortOrder: p.sortOrder,
      })));
    }
  }, [existingPrizes, isEditing, prizeItems.length]);

  const addPrize = useCallback(() => {
    setPrizeItems((prev) => [...prev, {
      key: ++prizeKeyCounter,
      title: '',
      description: '',
      image: '',
      quantity: 1,
      prizeType: 0,
      couponCode: '',
      sortOrder: prev.length + 1,
    }]);
  }, []);

  const removePrize = useCallback((key: number) => {
    setPrizeItems((prev) => prev.filter((p) => p.key !== key));
  }, []);

  const updatePrizeField = useCallback((key: number, field: keyof PrizeFormItem, value: string | number) => {
    setPrizeItems((prev) => prev.map((p) =>
      p.key === key ? { ...p, [field]: value } : p
    ));
  }, []);

  const goNext = () => {
    const idx = TABS.indexOf(activeTab);
    if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1]);
  };

  const goPrev = () => {
    const idx = TABS.indexOf(activeTab);
    if (idx > 0) setActiveTab(TABS[idx - 1]);
  };

  const handlePublish = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const campaignData: CampaignInsertInfo = {
        userId: 0,
        title,
        description,
        startTime: startTime || null,
        endTime: endTime || null,
        status: 1,
        nameRequired: true,
        emailRequired: true,
        phoneRequired: false,
        minAge: null,
        bgImage: '',
        topImage: '',
        youtubeUrl: '',
        customCss,
        minEntry: null,
        slug: null,
        timezone: timezone || null,
        maxEntriesPerUser: null,
        winnerCount,
        isPublished: true,
        password: password || null,
        themePrimaryColor: themePrimaryColor || null,
        themeSecondaryColor: themeSecondaryColor || null,
        themeBgColor: themeBgColor || null,
        themeFont: themeFont || null,
        logoImage: logoImage || null,
        termsUrl: termsUrl || null,
        redirectUrl: redirectUrl || null,
        welcomeEmailEnabled,
        welcomeEmailSubject: welcomeEmailSubject || null,
        welcomeEmailBody: welcomeEmailBody || null,
        geoCountries: geoCountries || null,
        blockVpn,
        requireEmailVerification,
        entryType,
        gaTrackingId: gaTrackingId || null,
        fbPixelId: fbPixelId || null,
        tiktokPixelId: tiktokPixelId || null,
        gtmId: gtmId || null,
        brandId: null,
        language: null,
      };

      let resultCampaignId: number;

      if (isEditing) {
        // The backend overwrites the whole row: fields without a form control (status, slug,
        // required flags, images, counters…) come from the loaded campaign; userId from the session
        // (it is not readable through GraphQL).
        const base = loadedCampaign;
        const updateData: CampaignUpdateInfo = {
          ...campaignData,
          campaignId: parseInt(campaignId!, 10),
          userId: base?.userId || getSessionUserId() || 0,
          ...(base ? {
            status: base.status,
            nameRequired: base.nameRequired,
            emailRequired: base.emailRequired,
            phoneRequired: base.phoneRequired,
            minAge: base.minAge,
            bgImage: base.bgImage,
            topImage: base.topImage,
            youtubeUrl: base.youtubeUrl,
            minEntry: base.minEntry,
            slug: base.slug,
            maxEntriesPerUser: base.maxEntriesPerUser,
            isPublished: base.isPublished,
            brandId: base.brandId,
            language: base.language,
            totalEntries: base.totalEntries,
            totalParticipants: base.totalParticipants,
            viewCount: base.viewCount,
          } : {}),
        };
        const result = await updateCampaign(updateData);
        if (!result.sucesso) throw new Error(result.mensagem || t('campaignBuilder.updateFailed'));
        resultCampaignId = parseInt(campaignId!, 10);
      } else {
        const result = await insertCampaign(campaignData);
        if (!result.sucesso || !result.campaign) throw new Error(result.mensagem || t('campaignBuilder.createFailed'));
        resultCampaignId = result.campaign.campaignId;
      }

      // Save prizes: loaded ones are updated (not inserted again), new ones inserted,
      // and loaded ones removed from the form are deleted.
      for (const prize of prizeItems) {
        const prizeData: PrizeInsertInfo = {
          campaignId: resultCampaignId,
          title: prize.title,
          description: prize.description || null,
          image: prize.image || null,
          quantity: prize.quantity,
          prizeType: prize.prizeType,
          couponCode: prize.couponCode || null,
          sortOrder: prize.sortOrder,
          minEntriesRequired: prize.minEntriesRequired ?? null,
        };
        const saved = isEditing && prize.prizeId
          ? await updatePrize({ ...prizeData, prizeId: prize.prizeId })
          : await insertPrize(prizeData);
        if (!saved.sucesso) throw new Error(saved.mensagem || t('campaignBuilder.genericError'));
      }
      if (isEditing) {
        const keptIds = new Set(prizeItems.map((p) => p.prizeId).filter((id) => id));
        for (const prize of existingPrizes) {
          if (!keptIds.has(prize.prizeId)) await deletePrize(prize.prizeId);
        }
      }

      setSuccess(isEditing ? t('campaignBuilder.updated') : t('campaignBuilder.published'));
      setTimeout(() => navigate('/campaigns'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('campaignBuilder.genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  const requestPublish = async () => {
    const confirmed = await confirm({
      title: isEditing
        ? t('campaignBuilder.confirmUpdateTitle', { title })
        : t('campaignBuilder.confirmPublishTitle', { title }),
      description: isEditing
        ? t('campaignBuilder.confirmUpdateDescription')
        : t('campaignBuilder.confirmPublishDescription'),
      confirmLabel: isEditing ? t('campaignBuilder.update') : t('campaignBuilder.publish'),
      cancelLabel: t('shared.cancel'),
    });
    if (confirmed) await handlePublish();
  };

  const notSet = <em className="text-muted-foreground">{t('shared.notSet')}</em>;
  const yesNo = (value: boolean) => (value ? t('shared.yes') : t('shared.no'));
  const stepLabel = (id: string) => t(`campaignBuilder.steps.${id}`);

  const renderFooter = (id: string) => {
    const idx = TABS.indexOf(id);
    const isFirst = idx === 0;
    const isLast = idx === TABS.length - 1;
    return (
      <CardFooter className="justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={isFirst}
          leftIcon={<FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />}
        >
          {t('shared.previous')}
        </Button>
        {isLast ? (
          <Button
            variant="primary"
            onClick={requestPublish}
            disabled={!title}
            loading={submitting}
            loadingText={t('campaignBuilder.publishing')}
            leftIcon={<FontAwesomeIcon icon={faRocket} aria-hidden="true" />}
          >
            {isEditing ? t('campaignBuilder.update') : t('campaignBuilder.publish')}
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={goNext}
            rightIcon={<FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />}
          >
            {t('campaignBuilder.nextStep', { step: stepLabel(TABS[idx + 1]) })}
          </Button>
        )}
      </CardFooter>
    );
  };

  const renderStep = (id: string, descriptionText: ReactNode, body: ReactNode, headerAction?: ReactNode) => (
    <Card as="section" aria-labelledby={`step-${id}-title`}>
      <CardHeader>
        <div>
          <CardTitle id={`step-${id}-title`} className="text-xl">{stepLabel(id)}</CardTitle>
          <CardDescription>{descriptionText}</CardDescription>
        </div>
        {headerAction}
      </CardHeader>
      <CardContent className="flex flex-col gap-5">{body}</CardContent>
      {renderFooter(id)}
    </Card>
  );

  const basicStep = renderStep('basic', t('campaignBuilder.basic.description'), (
    <>
      <Input
        label={t('campaignBuilder.basic.title')}
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('campaignBuilder.basic.titlePlaceholder')}
        error={!title && activeTab === 'review' ? t('campaignBuilder.basic.titleRequired') : undefined}
      />
      <Textarea
        label={t('campaignBuilder.basic.descriptionLabel')}
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('campaignBuilder.basic.descriptionPlaceholder')}
      />
      <RadioGroup legend={t('campaignBuilder.basic.entryType')}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ENTRY_TYPE_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="entryType"
              variant="card"
              value={option.value}
              checked={entryType === option.value}
              onChange={() => setEntryType(option.value)}
              icon={<FontAwesomeIcon icon={option.icon} />}
              label={t(entryTypeKey(option.value))}
              description={t(`campaignBuilder.basic.entryTypeHint.${option.value}`)}
            />
          ))}
        </div>
      </RadioGroup>
      <div className="grid gap-5 md:grid-cols-2">
        <Input
          type="datetime-local"
          label={t('campaignBuilder.basic.startDate')}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <Input
          type="datetime-local"
          label={t('campaignBuilder.basic.endDate')}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Select
          label={t('campaignBuilder.basic.timezone')}
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          options={[
            { value: '', label: t('campaignBuilder.basic.timezonePlaceholder') },
            ...TIMEZONES.map((tz) => ({ value: tz, label: tz })),
          ]}
        />
        <Input
          type="number"
          min={1}
          className="tabular-nums"
          label={t('campaignBuilder.basic.winnerCount')}
          value={winnerCount}
          onChange={(e) => setWinnerCount(parseInt(e.target.value, 10) || 1)}
        />
        <Input
          type={showPassword ? 'text' : 'password'}
          autoComplete="off"
          label={<>{t('campaignBuilder.basic.password')} <span className="font-normal text-muted-foreground">{t('shared.optional')}</span></>}
          hint={t('campaignBuilder.basic.passwordHint')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightAddon={
            <Button
              variant="outline"
              size="icon"
              aria-pressed={showPassword}
              aria-label={showPassword ? t('shared.hidePassword') : t('shared.showPassword')}
              onClick={() => setShowPassword((v) => !v)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} aria-hidden="true" />
            </Button>
          }
        />
      </div>
    </>
  ));

  const appearanceStep = renderStep('appearance', t('campaignBuilder.appearance.description'), (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        <ColorInput
          label={t('campaignBuilder.appearance.primaryColor')}
          pickerLabel={t('campaignBuilder.appearance.pickerLabel', { name: t('campaignBuilder.appearance.primaryColor') })}
          invalidMessage={t('campaignBuilder.appearance.invalidColor')}
          value={themePrimaryColor}
          onChange={setThemePrimaryColor}
        />
        <ColorInput
          label={t('campaignBuilder.appearance.secondaryColor')}
          pickerLabel={t('campaignBuilder.appearance.pickerLabel', { name: t('campaignBuilder.appearance.secondaryColor') })}
          invalidMessage={t('campaignBuilder.appearance.invalidColor')}
          value={themeSecondaryColor}
          onChange={setThemeSecondaryColor}
        />
        <ColorInput
          label={t('campaignBuilder.appearance.backgroundColor')}
          pickerLabel={t('campaignBuilder.appearance.pickerLabel', { name: t('campaignBuilder.appearance.backgroundColor') })}
          invalidMessage={t('campaignBuilder.appearance.invalidColor')}
          contrastWith={null}
          value={themeBgColor}
          onChange={setThemeBgColor}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label={t('campaignBuilder.appearance.font')}
          value={themeFont}
          onChange={(e) => setThemeFont(e.target.value)}
          placeholder={t('campaignBuilder.appearance.fontPlaceholder')}
        />
        <Input
          type="url"
          label={t('campaignBuilder.appearance.logo')}
          value={logoImage}
          onChange={(e) => setLogoImage(e.target.value)}
          placeholder="https://example.com/logo.png"
        />
      </div>
      <Textarea
        label={t('campaignBuilder.appearance.customCss')}
        rows={5}
        className="font-mono text-sm"
        spellCheck={false}
        value={customCss}
        onChange={(e) => setCustomCss(e.target.value)}
        placeholder="/* Custom CSS */"
      />
    </>
  ));

  const prizesStep = renderStep(
    'prizes',
    t('campaignBuilder.prizes.description'),
    prizeItems.length === 0 ? (
      <div className="flex flex-col items-center gap-3 rounded-md border-2 border-dashed border-input px-4 py-8 text-center text-muted-foreground">
        <FontAwesomeIcon icon={faTrophy} className="text-2xl" aria-hidden="true" />
        <p>{t('campaignBuilder.prizes.empty')}</p>
        <Button variant="outline" size="sm" onClick={addPrize} leftIcon={<FontAwesomeIcon icon={faPlus} aria-hidden="true" />}>
          {t('campaignBuilder.prizes.add')}
        </Button>
      </div>
    ) : (
      <ol className="flex flex-col gap-4">
        {prizeItems.map((prize, idx) => {
          const prizeName = prize.title || t('campaignBuilder.prizes.prizeNumber', { number: idx + 1 });
          return (
            <li key={prize.key}>
              <fieldset className="rounded-md border border-border p-4">
                <legend className="px-1 font-display text-base font-bold">
                  {t('campaignBuilder.prizes.prizeNumber', { number: idx + 1 })}
                </legend>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-danger-subtle"
                    onClick={() => removePrize(prize.key)}
                    aria-label={t('campaignBuilder.prizes.removeNamed', { name: prizeName })}
                    leftIcon={<FontAwesomeIcon icon={faTrash} aria-hidden="true" />}
                  >
                    {t('campaignBuilder.prizes.remove')}
                  </Button>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
                    <Input
                      label={t('campaignBuilder.prizes.title')}
                      value={prize.title}
                      onChange={(e) => updatePrizeField(prize.key, 'title', e.target.value)}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="tabular-nums"
                      label={t('campaignBuilder.prizes.quantity')}
                      value={prize.quantity}
                      onChange={(e) => updatePrizeField(prize.key, 'quantity', parseInt(e.target.value, 10) || 1)}
                    />
                    <Select
                      label={t('campaignBuilder.prizes.type')}
                      value={prize.prizeType}
                      onChange={(e) => updatePrizeField(prize.key, 'prizeType', parseInt(e.target.value, 10))}
                      options={PRIZE_TYPES.map((type) => ({ value: type.value, label: t(`campaignBuilder.prizes.types.${type.key}`) }))}
                    />
                  </div>
                  <Textarea
                    label={t('campaignBuilder.prizes.descriptionLabel')}
                    rows={2}
                    value={prize.description}
                    onChange={(e) => updatePrizeField(prize.key, 'description', e.target.value)}
                  />
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input
                      type="url"
                      label={t('campaignBuilder.prizes.image')}
                      value={prize.image}
                      onChange={(e) => updatePrizeField(prize.key, 'image', e.target.value)}
                    />
                    <Input
                      label={t('campaignBuilder.prizes.couponCode')}
                      className="font-mono"
                      value={prize.couponCode}
                      onChange={(e) => updatePrizeField(prize.key, 'couponCode', e.target.value)}
                    />
                    <Input
                      type="number"
                      className="tabular-nums"
                      label={t('campaignBuilder.prizes.sortOrder')}
                      value={prize.sortOrder}
                      onChange={(e) => updatePrizeField(prize.key, 'sortOrder', parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>
    ),
    prizeItems.length > 0 ? (
      <Button variant="outline" size="sm" onClick={addPrize} leftIcon={<FontAwesomeIcon icon={faPlus} aria-hidden="true" />}>
        {t('campaignBuilder.prizes.add')}
      </Button>
    ) : undefined,
  );

  const settingsStep = renderStep('settings', t('campaignBuilder.settings.description'), (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <Input
          type="url"
          label={t('campaignBuilder.settings.termsUrl')}
          value={termsUrl}
          onChange={(e) => setTermsUrl(e.target.value)}
          placeholder="https://example.com/terms"
        />
        <Input
          type="url"
          label={t('campaignBuilder.settings.redirectUrl')}
          value={redirectUrl}
          onChange={(e) => setRedirectUrl(e.target.value)}
          placeholder="https://example.com/thanks"
        />
      </div>
      <Input
        label={t('campaignBuilder.settings.geoCountries')}
        hint={t('campaignBuilder.settings.geoCountriesHint')}
        value={geoCountries}
        onChange={(e) => setGeoCountries(e.target.value)}
        placeholder="US, BR, GB"
      />
      <fieldset className="flex flex-col">
        <legend className="mb-1 text-sm font-semibold">{t('campaignBuilder.settings.protection')}</legend>
        <Checkbox
          label={t('campaignBuilder.settings.requireEmailVerification')}
          description={t('campaignBuilder.settings.requireEmailVerificationHint')}
          checked={requireEmailVerification}
          onChange={(e) => setRequireEmailVerification(e.target.checked)}
        />
        <Checkbox
          label={t('campaignBuilder.settings.blockVpn')}
          description={t('campaignBuilder.settings.blockVpnHint')}
          checked={blockVpn}
          onChange={(e) => setBlockVpn(e.target.checked)}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-border pt-5">
        <legend className="sr-only">{t('campaignBuilder.settings.welcomeEmail')}</legend>
        <h3 className="font-display text-lg font-bold" aria-hidden="true">{t('campaignBuilder.settings.welcomeEmail')}</h3>
        <Checkbox
          label={t('campaignBuilder.settings.enableWelcomeEmail')}
          checked={welcomeEmailEnabled}
          onChange={(e) => setWelcomeEmailEnabled(e.target.checked)}
        />
        {welcomeEmailEnabled && (
          <>
            <Input
              label={t('campaignBuilder.settings.subject')}
              value={welcomeEmailSubject}
              onChange={(e) => setWelcomeEmailSubject(e.target.value)}
            />
            <Textarea
              label={t('campaignBuilder.settings.body')}
              rows={4}
              value={welcomeEmailBody}
              onChange={(e) => setWelcomeEmailBody(e.target.value)}
            />
          </>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-border pt-5">
        <legend className="sr-only">{t('campaignBuilder.settings.tracking')}</legend>
        <h3 className="font-display text-lg font-bold" aria-hidden="true">{t('campaignBuilder.settings.tracking')}</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label={t('campaignBuilder.settings.gaTrackingId')}
            className="font-mono"
            value={gaTrackingId}
            onChange={(e) => setGaTrackingId(e.target.value)}
            placeholder="G-XXXXXXXXXX"
          />
          <Input
            label={t('campaignBuilder.settings.fbPixelId')}
            className="font-mono"
            value={fbPixelId}
            onChange={(e) => setFbPixelId(e.target.value)}
          />
          <Input
            label={t('campaignBuilder.settings.tiktokPixelId')}
            className="font-mono"
            value={tiktokPixelId}
            onChange={(e) => setTiktokPixelId(e.target.value)}
          />
          <Input
            label={t('campaignBuilder.settings.gtmId')}
            className="font-mono"
            value={gtmId}
            onChange={(e) => setGtmId(e.target.value)}
            placeholder="GTM-XXXXXXX"
          />
        </div>
      </fieldset>
    </>
  ));

  const reviewStep = renderStep('review', t('campaignBuilder.review.description'), (
    <>
      {!title && (
        <Alert variant="danger" title={t('campaignBuilder.review.missingTitle')}>
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-sm font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={() => setActiveTab('basic')}
          >
            {t('campaignBuilder.review.goToBasic')}
          </button>
        </Alert>
      )}

      <section aria-labelledby="review-basic">
        <h3 id="review-basic" className="font-display text-lg font-bold">{stepLabel('basic')}</h3>
        <dl className="mt-2 divide-y divide-border">
          <ReviewRow label={t('campaignBuilder.basic.title')}>{title || notSet}</ReviewRow>
          <ReviewRow label={t('campaignBuilder.basic.descriptionLabel')}>{description || notSet}</ReviewRow>
          <ReviewRow label={t('campaignBuilder.basic.startDate')}>{startTime || notSet}</ReviewRow>
          <ReviewRow label={t('campaignBuilder.basic.endDate')}>{endTime || notSet}</ReviewRow>
          <ReviewRow label={t('campaignBuilder.basic.timezone')}>{timezone || notSet}</ReviewRow>
          <ReviewRow label={t('campaignBuilder.basic.entryType')}>{t(entryTypeKey(entryType))}</ReviewRow>
          <ReviewRow label={t('campaignBuilder.basic.winnerCount')}><span className="tabular-nums">{winnerCount}</span></ReviewRow>
          {password && <ReviewRow label={t('campaignBuilder.review.passwordProtected')}>{t('shared.yes')}</ReviewRow>}
        </dl>
      </section>

      <section aria-labelledby="review-appearance">
        <h3 id="review-appearance" className="font-display text-lg font-bold">{stepLabel('appearance')}</h3>
        <dl className="mt-2 divide-y divide-border">
          <ReviewRow label={t('campaignBuilder.appearance.primaryColor')}><Swatch color={themePrimaryColor} /></ReviewRow>
          <ReviewRow label={t('campaignBuilder.appearance.secondaryColor')}><Swatch color={themeSecondaryColor} /></ReviewRow>
          <ReviewRow label={t('campaignBuilder.appearance.backgroundColor')}><Swatch color={themeBgColor} /></ReviewRow>
          {themeFont && <ReviewRow label={t('campaignBuilder.appearance.font')}>{themeFont}</ReviewRow>}
          {logoImage && <ReviewRow label={t('campaignBuilder.appearance.logo')}>{logoImage}</ReviewRow>}
          {customCss && (
            <ReviewRow label={t('campaignBuilder.appearance.customCss')}>
              {t('campaignBuilder.review.customCssChars', { count: customCss.length })}
            </ReviewRow>
          )}
        </dl>
      </section>

      <section aria-labelledby="review-prizes">
        <h3 id="review-prizes" className="font-display text-lg font-bold">
          {t('campaignBuilder.review.prizesCount', { count: prizeItems.length })}
        </h3>
        {prizeItems.length === 0 ? (
          <p className="mt-2 text-muted-foreground">{t('campaignBuilder.review.noPrizes')}</p>
        ) : (
          <ul className="mt-2 list-disc pl-5">
            {prizeItems.map((p, i) => (
              <li key={p.key}>
                {p.title || t('campaignBuilder.prizes.prizeNumber', { number: i + 1 })}
                {' — '}
                <span className="tabular-nums">{t('campaignBuilder.review.quantity', { count: p.quantity })}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="review-settings">
        <h3 id="review-settings" className="font-display text-lg font-bold">{stepLabel('settings')}</h3>
        <dl className="mt-2 divide-y divide-border">
          {termsUrl && <ReviewRow label={t('campaignBuilder.settings.termsUrl')}>{termsUrl}</ReviewRow>}
          {redirectUrl && <ReviewRow label={t('campaignBuilder.settings.redirectUrl')}>{redirectUrl}</ReviewRow>}
          {geoCountries && <ReviewRow label={t('campaignBuilder.settings.geoCountries')}>{geoCountries}</ReviewRow>}
          <ReviewRow label={t('campaignBuilder.settings.blockVpn')}>{yesNo(blockVpn)}</ReviewRow>
          <ReviewRow label={t('campaignBuilder.review.emailVerification')}>
            {requireEmailVerification ? t('campaignBuilder.review.required') : t('campaignBuilder.review.notRequired')}
          </ReviewRow>
          <ReviewRow label={t('campaignBuilder.settings.welcomeEmail')}>
            {welcomeEmailEnabled ? t('shared.enabled') : t('shared.disabled')}
          </ReviewRow>
          {gaTrackingId && <ReviewRow label="GA">{gaTrackingId}</ReviewRow>}
          {fbPixelId && <ReviewRow label="Facebook Pixel">{fbPixelId}</ReviewRow>}
          {tiktokPixelId && <ReviewRow label="TikTok Pixel">{tiktokPixelId}</ReviewRow>}
          {gtmId && <ReviewRow label="GTM">{gtmId}</ReviewRow>}
        </dl>
      </section>
    </>
  ));

  const basicStatus: TabStatus | undefined = title ? 'complete' : activeTab === 'review' ? 'error' : undefined;

  const tabItems: TabItem[] = [
    { id: 'basic', label: stepLabel('basic'), icon: <FontAwesomeIcon icon={faCircleInfo} />, status: basicStatus, content: basicStep },
    { id: 'appearance', label: stepLabel('appearance'), icon: <FontAwesomeIcon icon={faPaintbrush} />, content: appearanceStep },
    {
      id: 'prizes',
      label: stepLabel('prizes'),
      icon: <FontAwesomeIcon icon={faTrophy} />,
      status: prizeItems.length > 0 ? 'complete' : undefined,
      badge: prizeItems.length > 0 ? (
        <Badge variant="neutral" className="ml-auto tabular-nums" aria-hidden="true">{prizeItems.length}</Badge>
      ) : undefined,
      content: prizesStep,
    },
    { id: 'settings', label: stepLabel('settings'), icon: <FontAwesomeIcon icon={faGear} />, content: settingsStep },
    { id: 'review', label: stepLabel('review'), icon: <FontAwesomeIcon icon={faClipboardCheck} />, content: reviewStep },
  ];

  const pageTitle = isEditing ? t('campaignBuilder.editTitle') : t('campaignBuilder.newTitle');

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={
          <Breadcrumb
            className="mb-1"
            label={t('shared.breadcrumb')}
            items={[
              { label: t('layout.nav.campaigns'), to: '/campaigns' },
              { label: pageTitle },
            ]}
          />
        }
        title={pageTitle}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {!isEditing && <CampaignStatusBadge status={0} />}
            <span>{t('campaignBuilder.pageDescription')}</span>
          </span>
        }
      />

      {error && (
        <Alert
          variant="danger"
          className="mb-6"
          title={t('campaignBuilder.errorTitle')}
          dismissible
          dismissLabel={t('shared.dismissAlert')}
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-6" title={success}>
          {t('campaignBuilder.redirecting')}
        </Alert>
      )}

      <Tabs
        items={tabItems}
        label={t('campaignBuilder.stepsLabel')}
        value={activeTab}
        onValueChange={setActiveTab}
        orientation={isDesktop ? 'vertical' : 'horizontal'}
        steps
        statusLabels={{ complete: t('campaignBuilder.stepComplete'), error: t('campaignBuilder.stepError') }}
        listClassName={isDesktop ? undefined : '-mx-4 px-4'}
      />
    </PageContainer>
  );
};

export default CampaignBuilderPage;
