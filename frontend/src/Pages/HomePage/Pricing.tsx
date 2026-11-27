import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faStar } from '@fortawesome/free-solid-svg-icons';
import { Badge, Button, cn } from "../../Components/ui";

interface IPlan {
    key: string;
    planKey: string;
    priceKey: string;
    featureKeys: string[];
    ctaKey: string;
    /** Destination of the CTA; plans without a page yet ("coming soon") have none. */
    route?: string;
    recommended?: boolean;
}

const featureKeys = (prefix: string) => [1, 2, 3, 4].map((index) => `home_pricing_${prefix}_feature${index}`);

const PLANS: IPlan[] = [
    {
        key: "free",
        planKey: "home_pricing_free_plan",
        priceKey: "home_pricing_free_price",
        featureKeys: featureKeys("free"),
        ctaKey: "home_pricing_free_button",
        route: "/network",
    },
    {
        key: "pro",
        planKey: "home_pricing_pro_plan",
        priceKey: "home_pricing_pro_price",
        featureKeys: featureKeys("pro"),
        ctaKey: "home_pricing_coming_soon",
        recommended: true,
    },
    {
        key: "enterprise",
        planKey: "home_pricing_enterprise_plan",
        priceKey: "home_pricing_enterprise_price",
        featureKeys: featureKeys("enterprise"),
        ctaKey: "home_pricing_coming_soon",
    },
];

const Pricing = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section id="precos" aria-labelledby="precos-title" className="scroll-mt-20 border-t border-border bg-surface">
            <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 id="precos-title" className="font-display text-3xl font-extrabold lg:text-4xl">{t('home_pricing_title')}</h2>
                <p className="mt-2 text-muted-foreground">{t('homeLanding.pricing.lead')}</p>
                <ul className="mt-10 grid items-start gap-6 lg:grid-cols-3">
                    {PLANS.map((plan) => {
                        const titleId = `plan-${plan.key}-title`;
                        return (
                            <li
                                key={plan.key}
                                className={cn(
                                    "relative flex flex-col rounded-lg bg-surface p-6",
                                    plan.recommended
                                        ? "border-2 border-foreground shadow-pop"
                                        : "border border-border shadow-sm",
                                )}
                            >
                                {plan.recommended &&
                                    <Badge
                                        variant="points"
                                        icon={<FontAwesomeIcon icon={faStar} />}
                                        className="absolute -top-3.5 left-6"
                                    >
                                        {t('homeLanding.pricing.recommended')}
                                    </Badge>
                                }
                                <h3 id={titleId} className="font-sans text-lg font-bold">{t(plan.planKey)}</h3>
                                <p className="mt-3">
                                    <span className="font-display text-4xl font-extrabold tabular-nums">{t(plan.priceKey)}</span>{" "}
                                    <span className="text-muted-foreground">{t('home_pricing_per_month')}</span>
                                </p>
                                <ul className="mt-5 flex flex-col gap-2 text-sm">
                                    {plan.featureKeys.map((featureKey) => (
                                        <li key={featureKey} className="flex gap-2">
                                            <FontAwesomeIcon icon={faCheck} aria-hidden="true" className="mt-0.5 text-success" />
                                            {t(featureKey)}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    variant={plan.recommended ? "primary" : "outline"}
                                    fullWidth
                                    className="mt-6"
                                    aria-describedby={titleId}
                                    disabled={!plan.route}
                                    onClick={plan.route ? () => navigate(plan.route) : undefined}
                                >
                                    {t(plan.ctaKey)}
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
};

export default Pricing;
