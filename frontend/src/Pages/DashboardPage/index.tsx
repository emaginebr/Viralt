import { useContext, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowRight, faBox, faBullhorn, faChartLine, faChevronRight, faCog, faDollar, faList,
    faTicket, faUserCog, faUserGroup, faUsers, type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import InvoiceContext from "../../Contexts/Invoice/InvoiceContext";
import { analyticsService } from "../../Services/analyticsService";
import type { DashboardAnalytics } from "../../types/analytics";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import StatementSearchParam from "../../DTO/Domain/StatementSearchParam";
import MessageToast from "../../Components/MessageToast";
import {
    Alert, Button, Card, CardContent, CardHeader, CardTitle, PageContainer, PageHeader, Skeleton,
    Spinner, Tabs, cn, focusRing,
} from "../../Components/ui";
import CountPart from "./CountPart";
import StatementPart from "./StatementPart";

interface IStatCard {
    icon: IconDefinition;
    iconClass: string;
    value: number;
    label: string;
}

interface IShortcut {
    to: string;
    icon: IconDefinition;
    label: string;
}

interface IShortcutGroupProps {
    id: string;
    icon: IconDefinition;
    title: string;
    items: IShortcut[];
}

const ShortcutGroup = ({ id, icon, title, items }: IShortcutGroupProps) => (
    <section aria-labelledby={id}>
        <h3 id={id} className="flex items-center gap-2 bg-primary-subtle px-5 py-3 font-sans text-sm font-semibold text-primary">
            <FontAwesomeIcon icon={icon} fixedWidth aria-hidden="true" />
            {title}
        </h3>
        <ul className="divide-y divide-border">
            {items.map((item) => (
                <li key={item.to}>
                    <Link
                        to={item.to}
                        className={cn(
                            'flex min-h-14 items-center gap-3 px-5 py-3 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-muted',
                            focusRing,
                            'focus-visible:-outline-offset-2',
                        )}
                    >
                        <FontAwesomeIcon icon={item.icon} fixedWidth aria-hidden="true" className="text-muted-foreground" />
                        <span className="flex-1">{item.label}</span>
                        <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" className="text-xs text-muted-foreground" />
                    </Link>
                </li>
            ))}
        </ul>
    </section>
);

const DashboardPage = () => {

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const invoiceContext = useContext(InvoiceContext);

    const { t } = useTranslation();

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    // Dashboard analytics state
    const [dashboardAnalytics, setDashboardAnalytics] = useState<DashboardAnalytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    const throwError = (message: string) => {
        setDialog(MessageToastEnum.Error);
        setMessageText(message);
        setShowMessage(true);
    };

    const searchStatements = async (pageNum: number) => {
        let param: StatementSearchParam;
        switch (networkContext.currentRole) {
            case UserRoleEnum.NetworkManager:
                param = {
                    ...param,
                    networkId: networkContext.userNetwork.networkId,
                    pageNum: 1
                };
                break;
            case UserRoleEnum.Seller:
                param = {
                    ...param,
                    userId: authContext.sessionInfo.userId,
                    pageNum: 1
                };
                break;
        }
        if (networkContext.currentRole != UserRoleEnum.User) {
            const ret = await invoiceContext.searchStatement(param);
            if (!ret.sucesso) {
                throwError(ret.mensagemErro);
            }
        }
    };

    useEffect(() => {
        // Load dashboard analytics
        analyticsService.getDashboardAnalytics()
            .then((data) => setDashboardAnalytics(data))
            .catch(() => { /* non-critical */ })
            .finally(() => setAnalyticsLoading(false));

        searchStatements(1);
        switch (networkContext.currentRole) {
            case UserRoleEnum.NetworkManager:
                invoiceContext.getBalance(networkContext.userNetwork.networkId).then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                break;
            case UserRoleEnum.Seller:
                invoiceContext.getBalance().then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                invoiceContext.getAvailableBalance().then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                break;
        }
    }, []);

    const isNotUser = networkContext.currentRole != UserRoleEnum.User;

    const statCards: IStatCard[] = dashboardAnalytics ? [
        { icon: faBullhorn, iconClass: "bg-primary-subtle text-primary", value: dashboardAnalytics.activeCampaigns, label: t('adminUi.dashboard.activeCampaigns') },
        { icon: faUsers, iconClass: "bg-success-subtle text-success", value: dashboardAnalytics.totalParticipantsAll, label: t('adminUi.dashboard.totalParticipants') },
        { icon: faTicket, iconClass: "bg-warning-subtle text-warning", value: dashboardAnalytics.totalEntriesAll, label: t('adminUi.dashboard.totalEntries') },
    ] : [];

    let analyticsContent: ReactNode;
    if (analyticsLoading) {
        analyticsContent = (
            <div className="flex justify-center py-6">
                <Spinner label={t('loading')} showLabel />
            </div>
        );
    }
    else if (dashboardAnalytics) {
        analyticsContent = (
            <dl className="grid gap-4 md:grid-cols-3">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="flex items-center gap-4 p-5">
                        <span aria-hidden="true" className={cn("inline-flex size-12 shrink-0 items-center justify-center rounded-md text-xl", stat.iconClass)}>
                            <FontAwesomeIcon icon={stat.icon} fixedWidth />
                        </span>
                        <div className="flex flex-col">
                            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                            <dd className="order-first font-display text-3xl font-extrabold tabular-nums">{stat.value}</dd>
                        </div>
                    </Card>
                ))}
            </dl>
        );
    }
    else {
        analyticsContent = <Alert variant="info">{t('adminUi.dashboard.noAnalytics')}</Alert>;
    }

    const networkShortcuts: IShortcut[] = [
        { to: "/admin/network", icon: faCog, label: t('preferences') },
        { to: "/admin/team-structure", icon: faUserCog, label: t('team_structure') },
        { to: "/admin/teams", icon: faUserGroup, label: t('teams') },
    ];
    const financeShortcuts: IShortcut[] = [
        { to: "/admin/orders", icon: faList, label: t('orders') },
        { to: "/admin/invoices", icon: faDollar, label: t('invoices') },
        { to: "/admin/products", icon: faBox, label: t('products') },
    ];

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            ></MessageToast>
            <PageContainer className="flex flex-col gap-8">
                <PageHeader title={t('adminUi.dashboard.title')} className="-mb-6" />

                {/* Campaign Analytics Overview */}
                <section aria-labelledby="dashboard-analytics-title" aria-busy={analyticsLoading || undefined} className="flex flex-col gap-4">
                    <h2 id="dashboard-analytics-title" className="flex items-center gap-2 font-display text-xl font-bold">
                        <FontAwesomeIcon icon={faChartLine} fixedWidth aria-hidden="true" className="text-primary" />
                        {t('adminUi.dashboard.analyticsTitle')}
                    </h2>
                    {analyticsContent}
                </section>

                {isNotUser &&
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <CountPart />
                        </div>
                        <Card variant="inverted" as="section" aria-labelledby="dashboard-balance-title" className="flex flex-col">
                            <CardHeader>
                                <CardTitle id="dashboard-balance-title" className="text-secondary-foreground">
                                    {t('dashboard_current_balance')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col gap-4">
                                <p className="font-display text-4xl font-extrabold tabular-nums" aria-busy={invoiceContext.loadingBalance || undefined}>
                                    {invoiceContext.loadingBalance ?
                                        <Skeleton className="h-10 w-2/3" />
                                        :
                                        <>
                                            <small className="text-lg font-semibold">R$</small>{invoiceContext.balance}
                                        </>
                                    }
                                </p>
                                {networkContext.currentRole == UserRoleEnum.Seller &&
                                    <>
                                        {invoiceContext.loadingAvailableBalance ?
                                            <Skeleton className="h-4 w-full" />
                                            :
                                            <p className="text-sm text-secondary-muted-foreground">
                                                {t('dashboard_amount_released_for_withdrawal')} <small>R$</small>{invoiceContext.availableBalance}
                                            </p>
                                        }
                                    </>
                                }
                                <Button
                                    variant="accent"
                                    disabled
                                    className="mt-auto self-start"
                                    rightIcon={<FontAwesomeIcon icon={faArrowRight} fixedWidth aria-hidden="true" />}
                                >
                                    {t('dashboard_withdrawal')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                }

                <div className={cn("grid gap-6", isNotUser && "lg:grid-cols-3")}>
                    <div className={cn("min-w-0", isNotUser && "lg:col-span-2")}>
                        <Tabs
                            label={t('adminUi.dashboard.tabsLabel')}
                            defaultValue="balance"
                            items={[
                                {
                                    id: "balance",
                                    icon: <FontAwesomeIcon icon={faDollar} fixedWidth />,
                                    label: t('dashboard_statement'),
                                    content: (
                                        <StatementPart
                                            loading={invoiceContext.loadingSearch}
                                            StatementResult={invoiceContext.statementResult}
                                            onChangePage={(pagenum: number) => {
                                                searchStatements(pagenum);
                                            }} />
                                    ),
                                },
                                {
                                    id: "order",
                                    label: t('dashboard_orders_tab'),
                                    disabled: true,
                                    content: null,
                                },
                            ]}
                        />
                    </div>
                    {isNotUser &&
                        <Card className="self-start overflow-hidden">
                          <nav aria-label={t('adminUi.dashboard.shortcuts')}>
                            {networkContext.currentRole >= UserRoleEnum.NetworkManager &&
                                <ShortcutGroup
                                    id="dashboard-shortcuts-network"
                                    icon={faUserGroup}
                                    title={t('dashboard_networks_title')}
                                    items={networkShortcuts}
                                />
                            }
                            {networkContext.currentRole >= UserRoleEnum.Seller &&
                                <ShortcutGroup
                                    id="dashboard-shortcuts-finances"
                                    icon={faBox}
                                    title={t('finances')}
                                    items={financeShortcuts}
                                />
                            }
                          </nav>
                        </Card>
                    }
                </div>
            </PageContainer>
        </>
    );
};

export default DashboardPage;
