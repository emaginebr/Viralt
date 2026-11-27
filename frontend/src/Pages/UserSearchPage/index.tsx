import { useContext, useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowDown, faArrowUp, faBan, faCheck, faEnvelope, faMagnifyingGlass, faTrash, faXmark,
    type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import UserContext from "../../Contexts/User/UserContext";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import { UserNetworkStatusEnum } from "../../DTO/Enum/UserNetworkStatusEnum";
import UserNetworkSearchInfo from "../../DTO/Domain/UserNetworkSearchInfo";
import { Breadcrumb } from "../../Components/Breadcrumb";
import { usePaginationLabels } from "../../hooks/usePaginationLabels";
import {
    Badge, Button, Input, PageContainer, PageHeader, Pagination, Table,
    type BadgeVariant, type TableColumn,
} from "../../Components/ui";

interface IRowAction {
    key: string;
    icon: IconDefinition;
    iconClass: string;
    label: string;
    run: () => Promise<void>;
}

const UserSearchPage = () => {

    const { t } = useTranslation();

    const userContext = useContext(UserContext);
    const networkContext = useContext(NetworkContext);

    const { pageNum } = useParams();
    const paginationLabels = usePaginationLabels(t('pagination.teamNav'));

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const throwError = (message: string) => {
        setDialog(MessageToastEnum.Error);
        setMessageText(message);
        setShowMessage(true);
    };
    const showSuccessMessage = (message: string) => {
        setDialog(MessageToastEnum.Success);
        setMessageText(message);
        setShowMessage(true);
    };

    const showRole = (role: UserRoleEnum) => {
        let ret: string;
        switch (role) {
            case UserRoleEnum.NoRole:
                ret = t("userSearchPage.roles.noRole");
                break;
            case UserRoleEnum.User:
                ret = t("userSearchPage.roles.user");
                break;
            case UserRoleEnum.Seller:
                ret = t("userSearchPage.roles.seller");
                break;
            case UserRoleEnum.NetworkManager:
                ret = t("userSearchPage.roles.networkManager");
                break;
            case UserRoleEnum.Administrator:
                ret = t("userSearchPage.roles.administrator");
                break;
        }
        return ret;
    };

    const showStatus = (status: UserNetworkStatusEnum) => {
        let ret: string = "";
        switch (status) {
            case UserNetworkStatusEnum.Active:
                ret = t("userSearchPage.status.active");
                break;
            case UserNetworkStatusEnum.Blocked:
                ret = t("userSearchPage.status.blocked");
                break;
            case UserNetworkStatusEnum.Inactive:
                ret = t("userSearchPage.status.inactive");
                break;
            case UserNetworkStatusEnum.WaitForApproval:
                ret = t("userSearchPage.status.waitForApproval");
                break;
        }
        return ret;
    };

    const statusVariant = (status: UserNetworkStatusEnum): BadgeVariant => {
        switch (status) {
            case UserNetworkStatusEnum.Active:
                return "success";
            case UserNetworkStatusEnum.Blocked:
                return "danger";
            case UserNetworkStatusEnum.WaitForApproval:
                return "warning";
            default:
                return "neutral";
        }
    };

    const searchUsers = (pageNum: number) => {
        userContext.search(networkContext.userNetwork.networkId, "", pageNum, null).then((ret) => {
            if (!ret.sucesso) {
                throwError(ret.mensagemErro);
            }
        });
    };

    useEffect(() => {
        if (networkContext.userNetwork) {
            let pageNumInt: number = parseInt(pageNum);
            if (!pageNumInt) {
                pageNumInt = 1;
            }
            searchUsers(pageNumInt);
        }
    }, []);

    /** Runs a row action and, on success, shows the message and reloads the current page. */
    const runAction = async (action: Promise<{ sucesso: boolean; mensagemErro?: string }>, successMessage: string) => {
        const ret = await action;
        if (ret.sucesso) {
            showSuccessMessage(successMessage);
            searchUsers(userContext.searchResult?.pageNum);
        }
        else {
            throwError(ret.mensagemErro);
        }
    };

    const changeStatus = (user: UserNetworkSearchInfo, status: UserNetworkStatusEnum, successMessage: string) =>
        runAction(networkContext.changeStatus(networkContext.network?.networkId, user.userId, status), successMessage);

    const rowActions = (user: UserNetworkSearchInfo): IRowAction[] => {
        const actions: IRowAction[] = [
            {
                key: "promote",
                icon: faArrowUp,
                iconClass: "text-success",
                label: t("adminUi.userSearch.promote"),
                run: () => runAction(networkContext.promote(networkContext.network?.networkId, user.userId), t("adminUi.userSearch.promoted")),
            },
            {
                key: "demote",
                icon: faArrowDown,
                iconClass: "text-danger",
                label: t("adminUi.userSearch.demote"),
                run: () => runAction(networkContext.demote(networkContext.network?.networkId, user.userId), t("adminUi.userSearch.demoted")),
            },
        ];
        switch (user.status) {
            case UserNetworkStatusEnum.Active:
                actions.push({
                    key: "remove",
                    icon: faTrash,
                    iconClass: "text-danger",
                    label: t("userSearchPage.actions.remove"),
                    run: () => changeStatus(user, UserNetworkStatusEnum.Inactive, t("userSearchPage.messages.userAccessRemoved")),
                });
                break;
            case UserNetworkStatusEnum.Inactive:
                actions.push({
                    key: "reactivate",
                    icon: faCheck,
                    iconClass: "text-success",
                    label: t("userSearchPage.actions.reactivate"),
                    run: () => changeStatus(user, UserNetworkStatusEnum.Active, t("userSearchPage.messages.userReactivated")),
                });
                actions.push({
                    key: "block",
                    icon: faBan,
                    iconClass: "text-danger",
                    label: t("userSearchPage.actions.block"),
                    run: () => changeStatus(user, UserNetworkStatusEnum.Blocked, t("userSearchPage.messages.userBlocked")),
                });
                break;
            case UserNetworkStatusEnum.WaitForApproval:
                actions.push({
                    key: "approve",
                    icon: faCheck,
                    iconClass: "text-success",
                    label: t("userSearchPage.actions.approve"),
                    run: () => changeStatus(user, UserNetworkStatusEnum.Active, t("userSearchPage.messages.userApproved")),
                });
                actions.push({
                    key: "reprove",
                    icon: faXmark,
                    iconClass: "text-danger",
                    label: t("userSearchPage.actions.reprove"),
                    run: () => changeStatus(user, UserNetworkStatusEnum.Inactive, t("userSearchPage.messages.userReproved")),
                });
                break;
            case UserNetworkStatusEnum.Blocked:
                actions.push({
                    key: "reactivate",
                    icon: faCheck,
                    iconClass: "text-success",
                    label: t("userSearchPage.actions.reactivate"),
                    run: () => changeStatus(user, UserNetworkStatusEnum.Active, t("userSearchPage.messages.userReactivated")),
                });
                break;
        }
        return actions;
    };

    const renderActions = (user: UserNetworkSearchInfo): ReactNode => (
        <div className="flex flex-wrap justify-end gap-1">
            {rowActions(user).map((action) => (
                <Button
                    key={action.key}
                    variant="ghost"
                    size="sm"
                    aria-label={t("adminUi.actionFor", { action: action.label, name: user.name })}
                    leftIcon={<FontAwesomeIcon icon={action.icon} fixedWidth aria-hidden="true" className={action.iconClass} />}
                    onClick={() => { action.run(); }}
                >
                    {action.label}
                </Button>
            ))}
        </div>
    );

    const columns: TableColumn<UserNetworkSearchInfo>[] = [
        { key: "name", header: t("userSearchPage.tableHeaders.seller"), rowHeader: true },
        { key: "profile", header: t("userSearchPage.tableHeaders.profile") },
        { key: "role", header: t("userSearchPage.tableHeaders.role"), accessor: (user) => showRole(user.role) },
        {
            key: "commission",
            header: <>{t("userSearchPage.tableHeaders.commission")} (%)</>,
            numeric: true,
            accessor: (user) => <>{user.commission}%</>,
        },
        {
            key: "status",
            header: t("userSearchPage.tableHeaders.status"),
            accessor: (user) => <Badge variant={statusVariant(user.status)}>{showStatus(user.status)}</Badge>,
        },
        { key: "actions", header: t("userSearchPage.tableHeaders.actions"), actions: true, accessor: renderActions },
    ];

    const result = userContext.searchResult;
    const title = t("userSearchPage.breadcrumbs.networkTeam");

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            ></MessageToast>
            <PageContainer>
                <PageHeader
                    breadcrumb={<Breadcrumb items={[
                        { label: t("userSearchPage.breadcrumbs.myNetwork"), to: "/admin/dashboard" },
                        { label: title },
                    ]} />}
                    title={title}
                    actions={
                        <Button disabled leftIcon={<FontAwesomeIcon icon={faEnvelope} fixedWidth aria-hidden="true" />}>
                            {t("userSearchPage.inviteButton")}
                        </Button>
                    }
                />
                <form role="search" aria-label={t("userSearchPage.searchPlaceholder")} className="mb-4" onSubmit={(e) => e.preventDefault()}>
                    <Input
                        variant="search"
                        label={t("userSearchPage.searchPlaceholder")}
                        placeholder={t("userSearchPage.searchPlaceholder")}
                        rightAddon={
                            <Button type="submit" variant="outline" size="icon" aria-label={t("adminUi.search")}>
                                <FontAwesomeIcon icon={faMagnifyingGlass} fixedWidth aria-hidden="true" />
                            </Button>
                        }
                    />
                </form>
                <Table
                    columns={columns}
                    rows={result?.users ?? []}
                    rowKey={(user, index) => user.userId ?? index}
                    caption={result?.pageCount > 0
                        ? t("adminUi.tableCaptionPaged", { title, page: result.pageNum, total: result.pageCount })
                        : title}
                    loading={userContext.loadingSearch}
                    empty={t("adminUi.noRecords")}
                />
                {!userContext.loadingSearch && result && result.pageCount > 0 &&
                    <Pagination
                        className="mt-4"
                        page={result.pageNum}
                        totalPages={result.pageCount}
                        onChange={(page: number) => searchUsers(page)}
                        labels={paginationLabels}
                    />
                }
            </PageContainer>
        </>
    );
};

export default UserSearchPage;
