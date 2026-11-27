import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import NetworkContext from "../../Contexts/Network/NetworkContext";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";
import { textLinkClasses } from "../../Components/ui/cn";
import {
    Button, Input, PageContainer, PageHeader, Table, buttonClasses, type TableColumn,
} from "../../Components/ui";

const NetworkListPage = () => {

    const { t } = useTranslation();

    const navigate = useNavigate();
    const networkContext = useContext(NetworkContext);

    useEffect(() => {
        networkContext.listByUser().then((ret) => {
            if (!ret.sucesso) {
                toast.error(ret.mensagemErro);
            }
        });
    }, []);

    const iconLinkClasses = buttonClasses({ variant: "ghost", size: "icon" });

    const columns: TableColumn<UserNetworkInfo>[] = [
        {
            key: "network",
            header: t('network_list_header_network'),
            rowHeader: true,
            accessor: (item) => (
                <button
                    type="button"
                    className={textLinkClasses}
                    onClick={() => {
                        networkContext.setNetwork(item.network);
                        navigate("/admin/dashboard");
                    }}
                >
                    {item.network.name}
                </button>
            ),
        },
        {
            key: "commission",
            header: t('network_list_header_commission'),
            numeric: true,
            accessor: (item) => <>{item.network.comission}%</>,
        },
        { key: "owner", header: t('network_list_header_owner'), accessor: () => t('unknown') },
        {
            key: "members",
            header: t('network_list_header_members'),
            numeric: true,
            accessor: (item) => <>{item.network.qtdyUsers}/{item.network.maxUsers}</>,
        },
        {
            key: "actions",
            header: t('network_list_header_actions'),
            actions: true,
            accessor: (item) => (
                <div className="flex justify-end gap-1">
                    <Link
                        to={"/" + item.network.slug}
                        className={iconLinkClasses}
                        aria-label={t('adminUi.viewItem', { name: item.network.name })}
                        title={t('adminUi.viewItem', { name: item.network.name })}
                    >
                        <FontAwesomeIcon icon={faEye} fixedWidth aria-hidden="true" />
                    </Link>
                    <Link
                        to="/admin/dashboard"
                        className={iconLinkClasses}
                        aria-label={t('adminUi.deleteItem', { name: item.network.name })}
                        title={t('adminUi.deleteItem', { name: item.network.name })}
                    >
                        <FontAwesomeIcon icon={faTrash} fixedWidth aria-hidden="true" />
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <PageContainer>
            <PageHeader title={t('dashboard_networks_title')} />
            <form role="search" aria-label={t('network_list_search_aria_label')} className="mb-4" onSubmit={(e) => e.preventDefault()}>
                <Input
                    variant="search"
                    label={t('network_list_search_aria_label')}
                    placeholder={t('network_list_search_placeholder')}
                    rightAddon={
                        <Button type="submit" variant="outline" size="icon" aria-label={t('adminUi.search')}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} fixedWidth aria-hidden="true" />
                        </Button>
                    }
                />
            </form>
            <Table
                columns={columns}
                rows={networkContext.userNetworks ?? []}
                rowKey={(item, index) => item.network?.networkId ?? index}
                caption={t('dashboard_networks_title')}
                loading={networkContext.loading}
                empty={t('adminUi.noRecords')}
            />
        </PageContainer>
    );
};

export default NetworkListPage;
