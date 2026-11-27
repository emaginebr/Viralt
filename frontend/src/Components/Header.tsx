import { useContext, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars,
    faBox,
    faBullhorn,
    faChevronDown,
    faDiagramProject,
    faFileInvoiceDollar,
    faGaugeHigh,
    faHouse,
    faIdBadge,
    faImage,
    faLock,
    faNetworkWired,
    faPen,
    faPlus,
    faReceipt,
    faRightFromBracket,
    faRightToBracket,
    faUsers,
    faXmark,
    type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import AuthContext from "../Contexts/Auth/AuthContext";
import { ImageModal, ImageTypeEnum } from "./ImageModal";
import { LanguageSelect, MenuLanguage } from "./Functions";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { DropdownMenu, type DropdownMenuItem } from "./ui/DropdownMenu";
import { cn, focusRing } from "./ui/cn";

export type HeaderVariant = 'panel' | 'public';

interface HeaderProps {
    /** `panel`: sidebar + top bar (§13.1). `public`: top header with right drawer (§28). */
    variant?: HeaderVariant;
}

interface NavItem {
    to: string;
    labelKey: string;
    icon: IconDefinition;
    /** Active-state matcher; defaults to an exact match. */
    match?: (path: string) => boolean;
}

interface NavGroup {
    id: string;
    labelKey: string;
    items: NavItem[];
}

const startsWith = (prefix: string) => (path: string) => path === prefix || path.startsWith(`${prefix}/`);

const PANEL_NAV: NavGroup[] = [
    {
        id: 'campaigns',
        labelKey: 'layout.groups.campaigns',
        items: [
            {
                to: '/admin/dashboard',
                labelKey: 'layout.nav.dashboard',
                icon: faGaugeHigh,
                match: (path) => path === '/admin' || path === '/admin/dashboard',
            },
            {
                to: '/campaigns',
                labelKey: 'layout.nav.campaigns',
                icon: faBullhorn,
                match: (path) => startsWith('/campaigns')(path) && path !== '/campaigns/new',
            },
            { to: '/campaigns/new', labelKey: 'layout.nav.newCampaign', icon: faPlus },
        ],
    },
    {
        id: 'store',
        labelKey: 'layout.groups.store',
        items: [
            { to: '/admin/products', labelKey: 'layout.nav.products', icon: faBox, match: startsWith('/admin/products') },
            { to: '/admin/orders', labelKey: 'layout.nav.orders', icon: faReceipt },
            { to: '/admin/invoices', labelKey: 'layout.nav.invoices', icon: faFileInvoiceDollar },
        ],
    },
    {
        id: 'team',
        labelKey: 'layout.groups.team',
        items: [
            { to: '/admin/network', labelKey: 'layout.nav.myNetwork', icon: faNetworkWired },
            { to: '/network/search', labelKey: 'layout.nav.networks', icon: faDiagramProject },
            { to: '/admin/team-structure', labelKey: 'layout.nav.profiles', icon: faIdBadge, match: startsWith('/admin/team-structure') },
            { to: '/admin/teams', labelKey: 'layout.nav.users', icon: faUsers, match: startsWith('/admin/teams') },
        ],
    },
];

const PUBLIC_NAV: NavItem[] = [
    { to: '/', labelKey: 'layout.nav.home', icon: faHouse },
    { to: '/campaigns', labelKey: 'layout.nav.myCampaigns', icon: faBullhorn, match: startsWith('/campaigns') },
];

const isActive = (item: NavItem, path: string) => (item.match ? item.match(path) : path === item.to);

const inverseFocus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-inverse';

const sidebarLinkClasses = (active: boolean) =>
    cn(
        'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150',
        inverseFocus,
        active
            ? 'bg-accent font-semibold text-accent-foreground'
            : 'text-secondary-muted-foreground hover:bg-secondary-hover hover:text-secondary-foreground',
    );

interface BrandProps {
    inverse?: boolean;
    onNavigate?: () => void;
}

const Brand = ({ inverse = false, onNavigate }: BrandProps) => {
    const projectName = import.meta.env.VITE_PROJECT_NAME || 'Viralt';
    return (
        <Link
            to="/"
            onClick={onNavigate}
            className={cn(
                'flex min-h-11 items-center rounded-md font-display text-xl font-extrabold',
                inverse ? cn('text-secondary-foreground', inverseFocus) : cn('text-foreground', focusRing),
            )}
        >
            {projectName}
            <span className={inverse ? 'text-accent' : 'text-primary'} aria-hidden="true">.</span>
        </Link>
    );
};

interface PanelNavProps {
    label: string;
    idPrefix: string;
    path: string;
    onNavigate?: () => void;
}

/** Sidebar navigation (also reused inside the mobile drawer). */
const PanelNav = ({ label, idPrefix, path, onNavigate }: PanelNavProps) => {
    const { t } = useTranslation();
    return (
        <nav aria-label={label} className="flex-1 overflow-y-auto px-3 py-4">
            {PANEL_NAV.map((group) => {
                const headingId = `${idPrefix}-${group.id}`;
                return (
                    <div key={group.id}>
                        <h2
                            id={headingId}
                            className="px-3 pb-1 pt-4 font-sans text-xs font-semibold uppercase tracking-wide text-secondary-muted-foreground"
                        >
                            {t(group.labelKey)}
                        </h2>
                        <ul aria-labelledby={headingId} className="flex flex-col gap-0.5">
                            {group.items.map((item) => {
                                const active = isActive(item, path);
                                return (
                                    <li key={item.to}>
                                        <Link
                                            to={item.to}
                                            onClick={onNavigate}
                                            aria-current={active ? 'page' : undefined}
                                            className={sidebarLinkClasses(active)}
                                        >
                                            <FontAwesomeIcon icon={item.icon} className="w-5 text-center" aria-hidden="true" />
                                            {t(item.labelKey)}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            })}
        </nav>
    );
};

interface DrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    side: 'left' | 'right';
    /** Set to true right before a link navigates, so focus goes to the new page's h1. */
    navigatedRef: MutableRefObject<boolean>;
    trigger: ReactNode;
    children: ReactNode;
}

/** Mobile menu as a side panel over Radix Dialog: focus trap, Esc and focus return (§13.1, §28). */
const Drawer = ({ open, onOpenChange, side, navigatedRef, trigger, children }: DrawerProps) => {
    const { t } = useTranslation();
    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay/60 motion-safe:data-[state=open]:animate-fade-in" />
                <DialogPrimitive.Content
                    aria-describedby={undefined}
                    onCloseAutoFocus={(event) => {
                        // After a navigation the Layout moves focus to the new page's h1.
                        if (navigatedRef.current) {
                            event.preventDefault();
                            navigatedRef.current = false;
                        }
                    }}
                    className={cn(
                        'fixed inset-y-0 z-50 flex max-w-[85vw] flex-col shadow-lg focus-visible:outline-none',
                        side === 'left'
                            ? 'left-0 w-72 bg-secondary text-secondary-foreground motion-safe:data-[state=open]:animate-slide-in-left'
                            : 'right-0 w-80 bg-surface text-surface-foreground motion-safe:data-[state=open]:animate-fade-in',
                    )}
                >
                    <DialogPrimitive.Title className="sr-only">{t('layout.menuTitle')}</DialogPrimitive.Title>
                    {children}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};

interface DrawerCloseProps {
    inverse?: boolean;
}

const DrawerClose = ({ inverse }: DrawerCloseProps) => {
    const { t } = useTranslation();
    return (
        <DialogPrimitive.Close asChild>
            <Button
                variant="ghost"
                size="icon"
                aria-label={t('layout.closeMenu')}
                className={inverse ? cn('text-secondary-foreground hover:bg-secondary-hover', 'focus-visible:outline-ring-inverse') : undefined}
            >
                <FontAwesomeIcon icon={faXmark} className="text-lg" aria-hidden="true" />
            </Button>
        </DialogPrimitive.Close>
    );
};

const Header = ({ variant = 'panel' }: HeaderProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const authContext = useContext(AuthContext);
    const session = authContext.sessionInfo;

    const [showImageModal, setShowImageModal] = useState<boolean>(false);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const navigatedRef = useRef<boolean>(false);

    const closeDrawerOnNavigate = () => {
        navigatedRef.current = true;
        setDrawerOpen(false);
    };

    const handleLogout = () => {
        const ret = authContext.logout();
        if (!ret.sucesso) {
            toast.error(t('messageToast.error'), { description: ret.mensagemErro });
        }
        navigate(0);
    };

    const userMenuItems: DropdownMenuItem[] = [
        { type: 'label', label: t('layout.myAccount') },
        {
            label: t('change_picture'),
            icon: <FontAwesomeIcon icon={faImage} className="w-4 text-muted-foreground" />,
            // Deferred so the menu finishes closing before the Dialog opens.
            onSelect: () => { window.setTimeout(() => setShowImageModal(true), 0); },
        },
        {
            label: t('edit_account'),
            icon: <FontAwesomeIcon icon={faPen} className="w-4 text-muted-foreground" />,
            onSelect: () => navigate("/account/edit-account"),
        },
        {
            label: t('change_password'),
            icon: <FontAwesomeIcon icon={faLock} className="w-4 text-muted-foreground" />,
            onSelect: () => navigate("/account/change-password"),
        },
        { type: 'separator' },
        {
            label: t('logout'),
            icon: <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />,
            destructive: true,
            onSelect: handleLogout,
        },
    ];

    const userMenu = session ? (
        <DropdownMenu
            align="end"
            items={userMenuItems}
            trigger={
                <Button variant="ghost" size="sm" className="group pl-1.5">
                    <Avatar name={session.name} size="sm" />
                    <span className="hidden max-w-40 truncate sm:inline">{session.name}</span>
                    <span className="sr-only sm:hidden">{t('layout.accountOf', { name: session.name })}</span>
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        aria-hidden="true"
                        className="text-xs motion-safe:transition-transform group-data-[state=open]:rotate-180"
                    />
                </Button>
            }
        />
    ) : (
        <Button
            asChild
            variant="outline"
            size="sm"
            leftIcon={<FontAwesomeIcon icon={faRightToBracket} aria-hidden="true" />}
        >
            <Link to="/account/login">{t('layout.signIn')}</Link>
        </Button>
    );

    const imageModal = (
        <ImageModal
            Image={ImageTypeEnum.User}
            show={showImageModal}
            onClose={() => setShowImageModal(false)}
        />
    );

    const skipLink = (
        <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold focus:shadow-lg"
        >
            {t('layout.skipToContent')}
        </a>
    );

    const menuButton = (
        <Button variant="ghost" size="icon" aria-label={t('layout.openMenu')} className="lg:hidden">
            <FontAwesomeIcon icon={faBars} className="text-lg" aria-hidden="true" />
        </Button>
    );

    /* ------------------------------------------------------------------
     * Panel (organizer): sidebar on lg+, top bar and left drawer below lg.
     * ------------------------------------------------------------------ */
    if (variant === 'panel') {
        return (
            <>
                {skipLink}
                {imageModal}

                <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-secondary text-secondary-foreground lg:flex">
                    <div className="flex h-16 items-center px-6">
                        <Brand inverse />
                    </div>
                    <PanelNav label={t('layout.mainNav')} idPrefix="sidebar" path={location.pathname} />
                </aside>

                <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-surface/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
                    <Drawer
                        open={drawerOpen}
                        onOpenChange={setDrawerOpen}
                        side="left"
                        navigatedRef={navigatedRef}
                        trigger={menuButton}
                    >
                        <div className="flex h-16 items-center justify-between px-4">
                            <Brand inverse onNavigate={closeDrawerOnNavigate} />
                            <DrawerClose inverse />
                        </div>
                        <PanelNav
                            label={t('layout.mobileNav')}
                            idPrefix="drawer"
                            path={location.pathname}
                            onNavigate={closeDrawerOnNavigate}
                        />
                    </Drawer>
                    <span className="lg:hidden">
                        <Brand />
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                        <MenuLanguage />
                        {userMenu}
                    </div>
                </header>
            </>
        );
    }

    /* ------------------------------------------------------------------
     * Public (home, login, account): top header, right drawer below lg.
     * ------------------------------------------------------------------ */
    const publicLinkClasses = (active: boolean) =>
        cn(
            'inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors duration-150 hover:text-primary',
            focusRing,
            active && 'font-semibold underline decoration-primary decoration-2 underline-offset-8',
        );

    return (
        <>
            {skipLink}
            {imageModal}
            <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur-sm">
                <div className="mx-auto flex h-full w-full max-w-6xl items-center gap-2 px-4 sm:px-6 lg:px-8">
                    <Brand />

                    <nav aria-label={t('layout.mainNav')} className="ml-6 hidden lg:block">
                        <ul className="flex items-center gap-1">
                            {PUBLIC_NAV.map((item) => {
                                const active = isActive(item, location.pathname);
                                return (
                                    <li key={item.to}>
                                        <Link
                                            to={item.to}
                                            aria-current={active ? 'page' : undefined}
                                            className={publicLinkClasses(active)}
                                        >
                                            {t(item.labelKey)}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="ml-auto flex items-center gap-1">
                        <div className="hidden items-center gap-1 lg:flex">
                            <MenuLanguage />
                            {userMenu}
                        </div>
                        <Button
                            asChild
                            variant="primary"
                            size="sm"
                            className="hidden sm:inline-flex"
                            leftIcon={<FontAwesomeIcon icon={faPlus} aria-hidden="true" />}
                        >
                            <Link to="/campaigns/new">{t('layout.nav.newCampaign')}</Link>
                        </Button>

                        <Drawer
                            open={drawerOpen}
                            onOpenChange={setDrawerOpen}
                            side="right"
                            navigatedRef={navigatedRef}
                            trigger={menuButton}
                        >
                            <div className="flex h-16 items-center justify-between border-b border-border px-4">
                                <Brand onNavigate={closeDrawerOnNavigate} />
                                <DrawerClose />
                            </div>
                            <nav aria-label={t('layout.mobileNav')} className="flex-1 overflow-y-auto">
                                <ul className="divide-y divide-border">
                                    {[...PUBLIC_NAV, { to: '/campaigns/new', labelKey: 'layout.nav.newCampaign', icon: faPlus }].map((item) => {
                                        const active = isActive(item, location.pathname);
                                        return (
                                            <li key={item.to}>
                                                <Link
                                                    to={item.to}
                                                    onClick={closeDrawerOnNavigate}
                                                    aria-current={active ? 'page' : undefined}
                                                    className={cn(
                                                        'flex min-h-12 items-center gap-3 px-4 text-base font-semibold hover:bg-muted',
                                                        focusRing,
                                                        '-outline-offset-2',
                                                        active && 'border-l-4 border-primary bg-primary-subtle',
                                                    )}
                                                >
                                                    <FontAwesomeIcon icon={item.icon} className="w-5 text-center text-muted-foreground" aria-hidden="true" />
                                                    {t(item.labelKey)}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                            <div className="flex flex-col gap-4 border-t border-border p-4">
                                <LanguageSelect id="mobile-language" />
                                {session ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={session.name} />
                                            <span className="min-w-0 truncate font-semibold">{session.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="justify-start"
                                            leftIcon={<FontAwesomeIcon icon={faPen} aria-hidden="true" />}
                                            onClick={() => { closeDrawerOnNavigate(); navigate("/account/edit-account"); }}
                                        >
                                            {t('edit_account')}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="justify-start"
                                            leftIcon={<FontAwesomeIcon icon={faLock} aria-hidden="true" />}
                                            onClick={() => { closeDrawerOnNavigate(); navigate("/account/change-password"); }}
                                        >
                                            {t('change_password')}
                                        </Button>
                                        <div className="my-1 h-px bg-border" role="separator" />
                                        <Button
                                            variant="ghost"
                                            className="justify-start text-danger hover:bg-danger-subtle"
                                            leftIcon={<FontAwesomeIcon icon={faRightFromBracket} aria-hidden="true" />}
                                            onClick={handleLogout}
                                        >
                                            {t('logout')}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        asChild
                                        variant="outline"
                                        fullWidth
                                        leftIcon={<FontAwesomeIcon icon={faRightToBracket} aria-hidden="true" />}
                                    >
                                        <Link to="/account/login" onClick={closeDrawerOnNavigate}>{t('layout.signIn')}</Link>
                                    </Button>
                                )}
                            </div>
                        </Drawer>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
