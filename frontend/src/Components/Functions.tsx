import UserNetworkInfo from "../DTO/Domain/UserNetworkInfo";
import { LanguageEnum } from "../DTO/Enum/LanguageEnum";
import { UserRoleEnum } from "../DTO/Enum/UserRoleEnum";
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { getLangInfo } from "../i18n";
import { Button } from './ui/Button';
import { DropdownMenu } from './ui/DropdownMenu';
import { Select } from './ui/Select';
import { cn } from './ui/cn';

const showFrequencyMin = (frequency: number, t: (key: string) => string) => {
    switch (frequency) {
        case 0:
            return t("frequency_unique");
        case 7:
            return t("frequency_week");
        case 30:
            return t("frequency_month");
        case 60:
            return t("frequency_bimonthly");
        case 90:
            return t("frequency_quarter");
        case 180:
            return t("frequency_half");
        case 365:
            return t("frequency_year");
        default:
            return String(frequency);
    }
};

const showFrequencyMax = (frequency: number, t: (key: string) => string) => {
    switch (frequency) {
        case 0:
            return t("frequency_unique_payment");
        case 7:
            return t("frequency_weekly_payment");
        case 30:
            return t("frequency_monthly_payment");
        case 60:
            return t("frequency_bimonthly_payment");
        case 90:
            return t("frequency_quarterly_payment");
        case 180:
            return t("frequency_semiannual_payment");
        case 365:
            return t("frequency_annual_payment");
        default:
            return String(frequency);
    }
};

const showProfile = (user: UserNetworkInfo, t: (key: string) => string) => {
    if (!user) {
        return "";
    }
    if (user.profile) {
        return user.profile?.name;
    }
    switch (user.role) {
        case UserRoleEnum.Administrator:
            return t("profile_administrator");
        case UserRoleEnum.NetworkManager:
            return t("profile_network_manager");
        case UserRoleEnum.Seller:
            return t("profile_seller");
        case UserRoleEnum.User:
            return t("profile_user");
        default:
            return "";
    }
};

function formatPhoneNumber(phone: string) {
    // Remove qualquer caractere que não seja número
    const digits = phone.replace(/\D/g, '');

    if (digits.length !== 11) return phone; // Retorna original se não tiver 11 dígitos

    const ddd = digits.slice(0, 2);
    const firstDigit = digits.slice(2, 3);
    const firstPart = digits.slice(3, 7);
    const secondPart = digits.slice(7);

    return (
        <span className="tabular-nums"><small className="text-muted-foreground">({ddd})</small> {firstDigit} {firstPart}-{secondPart}</span>
    );
}

/** Language names are shown in their own language (autonyms), so they are not translated. */
const LANGUAGE_AUTONYMS: Record<string, string> = {
    pt: 'Português',
    en: 'English',
    es: 'Español',
    fr: 'Français',
};

const getSupportedLanguages = () => [
    getLangInfo(LanguageEnum.Portuguese), // Default/BR
    getLangInfo(LanguageEnum.English),
    getLangInfo(LanguageEnum.Spanish),
    getLangInfo(LanguageEnum.French),
];

const flagUrl = (flag: string) => `${import.meta.env.BASE_URL}flags/${flag}`;

interface MenuLanguageProps {
    /** Trigger look: light top bar (default) or the dark sidebar/drawer. */
    tone?: 'default' | 'inverse';
    className?: string;
}

/** Language switcher for the top bar: DropdownMenu with radio items (docs/design/components.md §19). */
const MenuLanguage = ({ tone = 'default', className }: MenuLanguageProps) => {
    const { i18n, t } = useTranslation();
    const current = getLangInfo(i18n.resolvedLanguage || i18n.language);
    const currentName = LANGUAGE_AUTONYMS[current.code] ?? current.code;

    return (
        <DropdownMenu
            align="end"
            className="min-w-48"
            trigger={
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        'group',
                        tone === 'inverse' &&
                            'text-secondary-foreground hover:bg-secondary-hover focus-visible:outline-ring-inverse',
                        className,
                    )}
                >
                    <FontAwesomeIcon icon={faGlobe} aria-hidden="true" />
                    <span aria-hidden="true">{current.code.toUpperCase()}</span>
                    <span className="sr-only">{t('layout.languageCurrent', { language: currentName })}</span>
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        aria-hidden="true"
                        className="text-xs motion-safe:transition-transform group-data-[state=open]:rotate-180"
                    />
                </Button>
            }
            items={[
                { type: 'label', label: t('layout.language') },
                {
                    type: 'radio',
                    value: current.code,
                    onValueChange: (lng: string) => { i18n.changeLanguage(lng); },
                    options: getSupportedLanguages().map((lang) => ({
                        value: lang.code,
                        label: <span lang={lang.code}>{LANGUAGE_AUTONYMS[lang.code] ?? t(lang.nameKey)}</span>,
                        icon: <img src={flagUrl(lang.flag)} alt="" className="size-5 rounded-full object-cover" />,
                    })),
                },
            ]}
        />
    );
};

interface LanguageSelectProps {
    id?: string;
    className?: string;
}

/** Native `<select>` language switcher, used inside the mobile menu (docs/design/components.md §28). */
const LanguageSelect = ({ id = 'language-select', className }: LanguageSelectProps) => {
    const { i18n, t } = useTranslation();
    const current = getLangInfo(i18n.resolvedLanguage || i18n.language);

    return (
        <Select
            id={id}
            label={t('layout.language')}
            value={current.code}
            wrapperClassName={className}
            onChange={(e) => { i18n.changeLanguage(e.target.value); }}
            options={getSupportedLanguages().map((lang) => ({
                value: lang.code,
                label: LANGUAGE_AUTONYMS[lang.code] ?? t(lang.nameKey),
            }))}
        />
    );
};

const langToStr = (lang: LanguageEnum) => {
    // Use the centralized getLangInfo from i18n.ts
    return getLangInfo(lang).code;
};

export { showFrequencyMin, showFrequencyMax, showProfile, formatPhoneNumber, MenuLanguage, LanguageSelect, langToStr };

// Note: Functions like showFrequencyMin, showFrequencyMax, showProfile now expect 't' as an argument.
// You'll need to call them like this from your components:
// import { useTranslation } from 'react-i18next';
// const { t } = useTranslation();
// const freqText = showFrequencyMin(frequencyValue, t);