import { useContext } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faInstagram, faLinkedin, faXTwitter, type IconDefinition } from "@fortawesome/free-brands-svg-icons";
import AuthContext from "../Contexts/Auth/AuthContext";
import { cn } from "./ui/cn";

interface SocialLink {
  label: string;
  icon: IconDefinition;
  url: string;
}

/**
 * Social profiles. Only entries with a URL are rendered (the old template had placeholder
 * `href=""` links, which were removed).
 */
const SOCIAL_LINKS: SocialLink[] = [
  { label: 'X', icon: faXTwitter, url: '' },
  { label: 'Facebook', icon: faFacebook, url: '' },
  { label: 'Instagram', icon: faInstagram, url: '' },
  { label: 'LinkedIn', icon: faLinkedin, url: '' },
];

const linkClasses = cn(
  'inline-flex min-h-11 items-center rounded-sm text-sm text-secondary-muted-foreground',
  'hover:text-secondary-foreground hover:underline underline-offset-4',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-inverse',
);

/** Public footer (Home and pages without the sidebar), on the dark "uva" surface. */
const Footer = () => {
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const projectName = import.meta.env.VITE_PROJECT_NAME || 'Viralt';
  const year = new Date().getFullYear();
  const socialLinks = SOCIAL_LINKS.filter((link) => link.url);

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr] lg:px-8">
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="inline-flex min-h-11 w-fit items-center rounded-md font-display text-2xl font-extrabold text-secondary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-inverse"
          >
            {projectName}<span className="text-accent" aria-hidden="true">.</span>
          </Link>
          <p className="max-w-sm text-sm text-secondary-muted-foreground">{t('footer.tagline')}</p>
          {socialLinks.length > 0 && (
            <ul className="mt-2 flex gap-1" aria-label={t('footer.social')}>
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('footer.socialLink', { network: link.label })}
                    className="inline-flex size-11 items-center justify-center rounded-md text-secondary-foreground hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-inverse"
                  >
                    <FontAwesomeIcon icon={link.icon} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-labelledby="footer-product">
          <h2 id="footer-product" className="font-sans text-xs font-semibold uppercase tracking-wide text-secondary-muted-foreground">
            {t('footer.product')}
          </h2>
          <ul className="mt-2 flex flex-col">
            <li><Link to="/" className={linkClasses}>{t('layout.nav.home')}</Link></li>
            <li><Link to="/campaigns" className={linkClasses}>{t('layout.nav.myCampaigns')}</Link></li>
            <li><Link to="/campaigns/new" className={linkClasses}>{t('layout.nav.newCampaign')}</Link></li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-account">
          <h2 id="footer-account" className="font-sans text-xs font-semibold uppercase tracking-wide text-secondary-muted-foreground">
            {t('footer.account')}
          </h2>
          <ul className="mt-2 flex flex-col">
            {authContext.sessionInfo ? (
              <>
                <li><Link to="/account/edit-account" className={linkClasses}>{t('edit_account')}</Link></li>
                <li><Link to="/account/change-password" className={linkClasses}>{t('change_password')}</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/account/login" className={linkClasses}>{t('layout.signIn')}</Link></li>
                <li><Link to="/account/new-account" className={linkClasses}>{t('footer.createAccount')}</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>

      <div className="border-t border-secondary-hover">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-secondary-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>{t('footer.copyright', { year, name: projectName })}</p>
          <a
            href="#main"
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-md px-3 font-semibold text-secondary-foreground hover:bg-secondary-hover',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-inverse',
            )}
          >
            <FontAwesomeIcon icon={faArrowUp} aria-hidden="true" />
            {t('footer.backToTop')}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
