import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import ProfileContext from "../../Contexts/Profile/ProfileContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import UserProfileInfo from "../../DTO/Domain/UserProfileInfo";
import MessageToast from "../../Components/MessageToast";
import { Breadcrumb } from "../../Components/Breadcrumb";
import { textLinkClasses } from "../../Components/ui/cn";
import {
    Button, PageContainer, PageHeader, Table, buttonClasses, useConfirm, type TableColumn,
} from "../../Components/ui";

const ProfileListPage = () => {

    const { t } = useTranslation();
    const confirm = useConfirm();

    const networkContext = useContext(NetworkContext);
    const profileContext = useContext(ProfileContext);

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

    useEffect(() => {
        if (networkContext.userNetwork) {
            profileContext.listByNetwork(networkContext.userNetwork.networkId).then((ret) => {
                if (!ret.sucesso) {
                    throwError(ret.mensagemErro);
                }
            });
        }
    }, []);

    /** Replaces the old "Confirmation" toast (Yes/No) with the ConfirmModal. */
    const handleDelete = async (profile: UserProfileInfo) => {
        const confirmed = await confirm({
            title: t("adminUi.profileList.deleteTitle", { name: profile.name }),
            description: t("adminUi.profileList.deleteDescription"),
            confirmLabel: t("adminUi.profileList.deleteConfirm"),
            cancelLabel: t("shared.cancel"),
            tone: "danger",
        });
        if (!confirmed) {
            return;
        }
        const ret = await profileContext.delete(profile.profileId);
        if (ret.sucesso) {
            showSuccessMessage(t("profileListPage.profileSuccessfullyDeleted"));
            const retList = await profileContext.listByNetwork(networkContext.userNetwork.networkId);
            if (!retList.sucesso) {
                throwError(retList.mensagemErro);
            }
        }
        else {
            throwError(ret.mensagemErro);
        }
    };

    const iconLinkClasses = buttonClasses({ variant: "ghost", size: "icon" });

    const columns: TableColumn<UserProfileInfo>[] = [
        {
            key: "name",
            header: t("profileListPage.profileName"),
            rowHeader: true,
            accessor: (profile) => (
                <Link to={"/admin/team-structure/" + profile.profileId} className={textLinkClasses}>{profile.name}</Link>
            ),
        },
        { key: "level", header: t("profileListPage.level"), numeric: true },
        {
            key: "commission",
            header: <>{t("profileListPage.commission")} (%)</>,
            numeric: true,
            accessor: (profile) => <>{profile.commission}%</>,
        },
        { key: "members", header: t("profileListPage.members"), numeric: true },
        {
            key: "actions",
            header: t("profileListPage.actions"),
            actions: true,
            accessor: (profile) => (
                <div className="flex justify-end gap-2">
                    <Link
                        to={"/admin/team-structure/" + profile.profileId}
                        className={iconLinkClasses}
                        aria-label={t("adminUi.editItem", { name: profile.name })}
                        title={t("adminUi.editItem", { name: profile.name })}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} fixedWidth aria-hidden="true" />
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("adminUi.deleteItem", { name: profile.name })}
                        title={t("adminUi.deleteItem", { name: profile.name })}
                        onClick={() => { handleDelete(profile); }}
                    >
                        <FontAwesomeIcon icon={faTrash} fixedWidth aria-hidden="true" className="text-danger" />
                    </Button>
                </div>
            ),
        },
    ];

    const title = t("profileListPage.networkTeamStructure");

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
                        { label: t("profileListPage.myNetwork"), to: "/admin/dashboard" },
                        { label: title },
                    ]} />}
                    title={title}
                />
                <Table
                    columns={columns}
                    rows={profileContext.profiles ?? []}
                    rowKey={(profile, index) => profile.profileId ?? index}
                    caption={title}
                    loading={profileContext.loading}
                    empty={t("adminUi.noRecords")}
                />
            </PageContainer>
        </>
    );
};

export default ProfileListPage;
