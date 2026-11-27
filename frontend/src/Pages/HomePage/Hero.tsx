import { useState } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBolt, faCircleCheck, faCirclePlay, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Button, Modal } from "../../Components/ui";

const HERO_VIDEO_ID = "Y7f98aduVJ8";
const AVATARS = [1, 2, 3, 4, 5];

interface IHeroStat {
    value: string;
    label: string;
}

const Hero = () => {

    const { t } = useTranslation();
    const [videoOpen, setVideoOpen] = useState<boolean>(false);

    const assetsBase = `${import.meta.env.BASE_URL}assets/img/`;

    const stats: IHeroStat[] = [
        { value: t('homeLanding.hero.stat1Value'), label: t('homeLanding.hero.stat1Label') },
        { value: t('homeLanding.hero.stat2Value'), label: t('homeLanding.hero.stat2Label') },
        { value: t('homeLanding.hero.stat3Value'), label: t('homeLanding.hero.stat3Label') },
    ];

    return (
        <section
            id="hero"
            aria-labelledby="hero-title"
            className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20"
        >
            <div className="motion-safe:animate-fade-in">
                <p className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-surface px-3 py-1 text-sm font-semibold shadow-pop-sm">
                    <FontAwesomeIcon icon={faBolt} aria-hidden="true" className="text-primary" />
                    {t('homeLanding.hero.badge')}
                </p>

                <h1 id="hero-title" tabIndex={-1} className="mt-5 font-display text-4xl font-extrabold lg:text-5xl">
                    <Trans
                        i18nKey="homeLanding.hero.title"
                        components={{ mark: <span className="rounded-sm bg-accent px-1.5 box-decoration-clone" /> }}
                    />
                </h1>

                <p className="mt-5 max-w-prose text-lg text-muted-foreground">{t('homeLanding.hero.subtitle')}</p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button
                        asChild
                        size="lg"
                        pop
                        rightIcon={<FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />}
                    >
                        <Link to="/campaigns/new">{t('homeLanding.hero.ctaPrimary')}</Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        aria-haspopup="dialog"
                        leftIcon={<FontAwesomeIcon icon={faCirclePlay} aria-hidden="true" />}
                        onClick={() => setVideoOpen(true)}
                    >
                        {t('homeLanding.hero.ctaVideo')}
                    </Button>
                </div>

                <div className="mt-8 flex items-center gap-3">
                    <ul className="flex -space-x-3" aria-hidden="true">
                        {AVATARS.map((index) => (
                            <li key={index}>
                                <img
                                    src={`${assetsBase}avatar-${index}.webp`}
                                    alt=""
                                    width={40}
                                    height={40}
                                    className="size-10 rounded-full border-2 border-surface object-cover"
                                />
                            </li>
                        ))}
                    </ul>
                    <p className="text-sm text-muted-foreground">{t('homeLanding.hero.socialProof')}</p>
                </div>

                <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex flex-col">
                            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                            <dd className="order-first font-display text-3xl font-extrabold tabular-nums">{stat.value}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            {/* Ticket composition: a mini widget built with the design system, decorative. */}
            <div className="relative mx-auto w-full max-w-sm motion-safe:animate-pop-in" aria-hidden="true">
                <div className="ticket absolute -right-2 -top-10 z-10 w-44 rotate-6 rounded-lg border-2 border-foreground bg-accent p-4 text-accent-foreground shadow-pop motion-reduce:rotate-0 sm:-right-6">
                    <p className="text-xs font-semibold uppercase tracking-wide">{t('homeLanding.hero.ticketLabel')}</p>
                    <p className="font-display text-3xl font-extrabold tabular-nums">00428</p>
                </div>
                <div className="relative rounded-xl border-2 border-foreground bg-surface shadow-pop">
                    <div className="rounded-t-xl bg-secondary p-5 text-secondary-foreground">
                        <p className="text-sm text-secondary-muted-foreground">{t('homeLanding.hero.mockBrand')}</p>
                        <p className="mt-1 font-display text-2xl font-extrabold">{t('homeLanding.hero.mockTitle')}</p>
                    </div>
                    <div className="flex flex-col gap-2 p-5">
                        <div className="flex items-center gap-3 rounded-md bg-success-subtle p-2.5">
                            <FontAwesomeIcon icon={faInstagram} className="text-lg" />
                            <span className="flex-1 text-sm font-semibold">{t('homeLanding.hero.mockFollow')}</span>
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-success">
                                <FontAwesomeIcon icon={faCircleCheck} />
                                {t('homeLanding.hero.mockDone')}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 rounded-md border border-border p-2.5">
                            <FontAwesomeIcon icon={faUserPlus} className="text-lg" />
                            <span className="flex-1 text-sm font-semibold">{t('homeLanding.hero.mockRefer')}</span>
                            <span className="rounded-full border-2 border-foreground bg-accent px-2.5 py-0.5 font-display text-xs font-bold text-accent-foreground shadow-pop-sm">
                                {t('homeLanding.hero.mockPoints')}
                            </span>
                        </div>
                        <div className="mt-2 rounded-md border-2 border-foreground bg-primary py-3 text-center font-semibold text-primary-foreground shadow-pop-sm">
                            {t('homeLanding.hero.mockCta')}
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                open={videoOpen}
                onOpenChange={setVideoOpen}
                title={t('homeLanding.hero.videoTitle')}
                closeLabel={t('shared.close')}
                size="lg"
            >
                {videoOpen &&
                    <div className="aspect-video w-full overflow-hidden rounded-md bg-overlay">
                        <iframe
                            src={`https://www.youtube-nocookie.com/embed/${HERO_VIDEO_ID}?autoplay=1&rel=0`}
                            title={t('homeLanding.hero.videoTitle')}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="size-full border-0"
                        />
                    </div>
                }
                <p className="mt-3 text-sm">
                    <a
                        href={`https://www.youtube.com/watch?v=${HERO_VIDEO_ID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-2"
                    >
                        {t('homeLanding.hero.videoExternal')}
                        <span className="sr-only"> ({t('homeLanding.newTab')})</span>
                    </a>
                </p>
            </Modal>
        </section>
    );
};

export default Hero;
