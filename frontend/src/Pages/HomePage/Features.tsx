import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCamera, faCode, faHandPointer, faScaleBalanced, faTicket, faUserPlus, type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

interface IFeature {
    key: string;
    icon: IconDefinition;
}

const FEATURES: IFeature[] = [
    { key: "giveaways", icon: faTicket },
    { key: "contests", icon: faCamera },
    { key: "entryActions", icon: faHandPointer },
    { key: "referrals", icon: faUserPlus },
    { key: "widget", icon: faCode },
    { key: "auditable", icon: faScaleBalanced },
];

const STEPS = ["step1", "step2", "step3"];

/** "Como funciona": 3 numbered steps on tickets (docs/design/components.md §29). */
export const HowItWorks = () => {
    const { t } = useTranslation();
    return (
        <section id="como" aria-labelledby="como-title" className="scroll-mt-20 border-y border-border bg-surface">
            <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 id="como-title" className="font-display text-3xl font-extrabold lg:text-4xl">
                    {t('homeLanding.howItWorks.title')}
                </h2>
                <ol className="mt-8 grid gap-6 md:grid-cols-3">
                    {STEPS.map((step, index) => (
                        <li key={step} className="ticket rounded-lg border-2 border-foreground bg-background p-6 shadow-pop">
                            <span aria-hidden="true" className="font-display text-4xl font-extrabold tabular-nums text-primary">
                                {index + 1}
                            </span>
                            <h3 className="mt-2 font-sans text-lg font-bold">{t(`homeLanding.howItWorks.${step}Title`)}</h3>
                            <p className="mt-1 text-muted-foreground">{t(`homeLanding.howItWorks.${step}Desc`)}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
};

/** "Recursos": 6 feature cards. No entrance animation (AOS removed). */
const Features = () => {
    const { t } = useTranslation();
    return (
        <section
            id="recursos"
            aria-labelledby="recursos-title"
            className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8"
        >
            <h2 id="recursos-title" className="font-display text-3xl font-extrabold lg:text-4xl">
                {t('homeLanding.features.title')}
            </h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((feature) => (
                    <li
                        key={feature.key}
                        className="rounded-lg border border-border bg-surface p-6 shadow-sm transition-shadow duration-150 hover:shadow-md"
                    >
                        <span
                            aria-hidden="true"
                            className="grid size-12 place-items-center rounded-md border-2 border-foreground bg-accent text-lg text-accent-foreground shadow-pop-sm"
                        >
                            <FontAwesomeIcon icon={feature.icon} />
                        </span>
                        <h3 className="mt-4 font-sans text-lg font-bold">{t(`homeLanding.features.${feature.key}Title`)}</h3>
                        <p className="mt-1 text-muted-foreground">{t(`homeLanding.features.${feature.key}Desc`)}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default Features;
