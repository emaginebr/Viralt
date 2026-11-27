import { useCallback, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faTicket } from '@fortawesome/free-solid-svg-icons';
import { publicService, type RegisterData } from '../../Services/publicService';
import type { CampaignInfo } from '../../types/campaign';
import { Alert, Button, Checkbox, Input, cn } from '../ui';

interface CampaignJoinFormProps {
  campaign: CampaignInfo;
  refToken: string | null;
  /** Called with the participant token after a successful registration. */
  onRegistered: (token: string) => void;
  /** Prefix for the field ids (two forms never share the same document, but ids stay explicit). */
  idPrefix: string;
  /** Widget layout: tighter spacing, no hints and no privacy note. */
  compact?: boolean;
  /** Labels the <form> (id of the visible heading). */
  labelledBy?: string;
}

type JoinField = 'name' | 'email' | 'phone' | 'terms';
type JoinErrors = Partial<Record<JoinField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD_ORDER: JoinField[] = ['name', 'email', 'phone', 'terms'];

/**
 * Participant registration form (docs/design/components.md §18.4), shared by the public page and
 * the widget. Validates on submit and, after the first submit, on blur; field errors are linked by
 * aria-describedby (ui/Input) and the server error is an Alert `danger` above the fields.
 */
const CampaignJoinForm = ({ campaign, refToken, onRegistered, idPrefix, compact = false, labelledBy }: CampaignJoinFormProps) => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<JoinErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    terms: useRef<HTMLInputElement>(null),
  };

  const validate = useCallback((): JoinErrors => {
    const next: JoinErrors = {};
    if (campaign.nameRequired && !name.trim()) next.name = t('public.errors.name_required');
    if (campaign.emailRequired && !email.trim()) next.email = t('public.errors.email_required');
    else if (email.trim() && !EMAIL_PATTERN.test(email.trim())) next.email = t('public.errors.email_invalid');
    if (campaign.phoneRequired && !phone.trim()) next.phone = t('public.errors.phone_required');
    if (campaign.termsUrl && !acceptedTerms) next.terms = t('public.errors.terms_required');
    return next;
  }, [campaign, name, email, phone, acceptedTerms, t]);

  const revalidate = useCallback(
    (field: JoinField): void => {
      if (!submitted) return;
      const next = validate();
      setErrors((prev): JoinErrors => {
        const updated: JoinErrors = { ...prev };
        updated[field] = next[field];
        return updated;
      });
    },
    [submitted, validate],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setSubmitted(true);
      setServerError(null);

      const next = validate();
      setErrors(next);
      const firstInvalid = FIELD_ORDER.find((field) => next[field]);
      if (firstInvalid) {
        refs[firstInvalid].current?.focus();
        return;
      }

      try {
        setSubmitting(true);
        const data: RegisterData = {
          campaignSlug: campaign.slug ?? '',
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          birthday: null,
          referralToken: refToken,
        };
        const result = await publicService.register(data);
        if (result.sucesso && result.token) {
          onRegistered(result.token);
        } else {
          setServerError(result.mensagem || t('public.errors.register_failed'));
        }
      } catch (err) {
        setServerError(err instanceof Error ? err.message : t('public.errors.register_failed'));
      } finally {
        setSubmitting(false);
      }
    },
    // `refs` only holds useRef objects, which are stable between renders.
    [validate, campaign.slug, name, email, phone, refToken, onRegistered, t],
  );

  const optional = <span className="font-normal text-muted-foreground">{t('shared.optional')}</span>;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby={labelledBy}
      className={cn('flex flex-col', compact ? 'gap-4' : 'gap-5')}
    >
      {serverError && (
        <Alert
          variant="danger"
          title={t('public.errors.register_title')}
          dismissible
          dismissLabel={t('shared.dismissAlert')}
          onDismiss={() => setServerError(null)}
        >
          {serverError}
        </Alert>
      )}

      <Input
        ref={refs.name}
        id={`${idPrefix}-name`}
        name="name"
        autoComplete="name"
        label={campaign.nameRequired ? t('public.name_label') : <>{t('public.name_label')} {optional}</>}
        required={campaign.nameRequired}
        placeholder={t('public.name_placeholder')}
        value={name}
        error={errors.name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => revalidate('name')}
      />

      <Input
        ref={refs.email}
        id={`${idPrefix}-email`}
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        label={campaign.emailRequired ? t('public.email_label') : <>{t('public.email_label')} {optional}</>}
        required={campaign.emailRequired}
        placeholder={t('public.email_placeholder')}
        hint={compact ? undefined : t('public.email_hint')}
        value={email}
        error={errors.email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => revalidate('email')}
      />

      {campaign.phoneRequired && (
        <Input
          ref={refs.phone}
          id={`${idPrefix}-phone`}
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          label={t('public.phone_label')}
          required
          placeholder={t('public.phone_placeholder')}
          value={phone}
          error={errors.phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => revalidate('phone')}
        />
      )}

      {campaign.termsUrl && (
        <Checkbox
          ref={refs.terms}
          id={`${idPrefix}-terms`}
          required
          checked={acceptedTerms}
          error={errors.terms}
          onChange={(e) => {
            setAcceptedTerms(e.target.checked);
            if (submitted && e.target.checked) setErrors((prev) => ({ ...prev, terms: undefined }));
          }}
          label={
            <span className="text-sm">
              {t('public.terms_prefix')}{' '}
              <a
                href={campaign.termsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm font-semibold text-primary underline underline-offset-2 focus-ring"
              >
                {t('public.terms_link')}
                <span className="sr-only"> {t('shared.opensNewTab')}</span>
              </a>
            </span>
          }
        />
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        pop
        fullWidth
        loading={submitting}
        loadingText={t('public.joining')}
        leftIcon={<FontAwesomeIcon icon={faTicket} aria-hidden="true" />}
      >
        {t('public.join_button')}
      </Button>

      {!compact && (
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <FontAwesomeIcon icon={faLock} aria-hidden="true" />
          {t('public.privacy_note')}
        </p>
      )}
    </form>
  );
};

export default CampaignJoinForm;
