import { useEffect, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { cn, focusRing } from '../ui';

export type LanguageSelectVariant = 'header' | 'footer';

interface LanguageSelectProps {
  /** `header` = public page (bordered); `footer` = widget footer (borderless, compact text). */
  variant?: LanguageSelectVariant;
}

interface LanguageOption {
  code: string;
  label: string;
}

/** Native names: each option is readable by whoever speaks that language. */
const LANGUAGES: LanguageOption[] = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

/**
 * Native language <select> for the public page and the widget (docs/design/components.md §13.2).
 * Changing it also updates <html lang>.
 */
const LanguageSelect = ({ variant = 'header' }: LanguageSelectProps) => {
  const { t, i18n } = useTranslation();
  const id = `lang-${useId().replace(/:/g, '')}`;
  const current = (i18n.resolvedLanguage ?? i18n.language ?? 'en').slice(0, 2);
  const value = LANGUAGES.some((lang) => lang.code === current) ? current : 'en';

  useEffect(() => {
    document.documentElement.lang = current;
  }, [current]);

  const handleChange = (code: string): void => {
    void i18n.changeLanguage(code);
  };

  if (variant === 'footer') {
    return (
      <>
        <label htmlFor={id} className="sr-only">
          {t('public.language_label')}
        </label>
        <select
          id={id}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={cn(
            'min-h-11 cursor-pointer rounded-md bg-transparent px-1 text-xs font-semibold text-muted-foreground hover:text-foreground',
            focusRing,
          )}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} lang={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {t('public.language_label')}
      </label>
      <div className="relative">
        <FontAwesomeIcon
          icon={faGlobe}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <select
          id={id}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={cn(
            'min-h-11 cursor-pointer appearance-none rounded-md border border-input bg-surface pl-9 pr-9 text-sm font-medium hover:border-foreground',
            focusRing,
          )}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} lang={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
        <FontAwesomeIcon
          icon={faChevronDown}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
        />
      </div>
    </div>
  );
};

export default LanguageSelect;
