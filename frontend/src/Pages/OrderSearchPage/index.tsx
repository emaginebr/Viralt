import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Moment from 'react-moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan } from '@fortawesome/free-solid-svg-icons';
import NetworkContext from "../../Contexts/Network/NetworkContext";
import OrderContext from "../../Contexts/Order/OrderContext";
import AuthContext from "../../Contexts/Auth/AuthContext";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { OrderStatusEnum } from "../../DTO/Enum/OrderStatusEnum";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import OrderInfo from "../../DTO/Domain/OrderInfo";
import MessageToast from "../../Components/MessageToast";
import { Breadcrumb } from "../../Components/Breadcrumb";
import { usePaginationLabels } from "../../hooks/usePaginationLabels";
import {
    Badge, PageContainer, PageHeader, Pagination, Table, buttonClasses,
    type BadgeVariant, type TableColumn,
} from "../../Components/ui";

const OrderSearchPage = () => {

    const { t } = useTranslation();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const orderContext = useContext(OrderContext);

    const { pageNum } = useParams();
    const paginationLabels = usePaginationLabels(t('pagination.orderNav'));

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const throwError = (message: string) => {
        setDialog(MessageToastEnum.Error);
        setMessageText(message);
        setShowMessage(true);
    };

    const showProducts = (order: OrderInfo) => {
        let ret: string = "";
        if (order.items) {
            order.items.map((item) => {
                if (item.product) {
                    ret = ret + item.product.name + " (" + item.quantity + "), ";
                }
            });
            if (ret.length > 0) {
                ret = ret.substring(0, ret.length - 2);
            }
        }
        if (ret.length == 0) {
            ret = t('product_unknown');
        }
        return ret;
    };

    const showTotal = (order: OrderInfo) => {
        let total: number = 0;
        if (order.items) {
            order.items.map((item) => {
                total += item.product.price * item.quantity;
            });
        }
        return total;
    };

    const searchOrders = (pageNum: number) => {
        switch (networkContext.userNetwork.role) {
            case UserRoleEnum.NetworkManager:
                orderContext.search(networkContext.userNetwork.networkId, 0, 0, pageNum).then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                break;
            case UserRoleEnum.Seller:
                orderContext.search(
                    networkContext.userNetwork.networkId,
                    0,
                    authContext.sessionInfo?.userId,
                    pageNum
                ).then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                break;
            case UserRoleEnum.User:
                orderContext.search(
                    networkContext.userNetwork.networkId,
                    authContext.sessionInfo?.userId,
                    0,
                    pageNum
                ).then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                break;
        }
    };

    const showStatus = (status: OrderStatusEnum) => {
        let retorno: string;
        switch (status) {
            case OrderStatusEnum.Incoming:
                retorno = t('order_status_incoming');
                break;
            case OrderStatusEnum.Active:
                retorno = t('order_status_active');
                break;
            case OrderStatusEnum.Suspended:
                retorno = t('order_status_suspended');
                break;
            case OrderStatusEnum.Finished:
                retorno = t('order_status_finished');
                break;
            case OrderStatusEnum.Expired:
                retorno = t('order_status_expired');
                break;
        }
        return retorno!;
    };

    const statusVariant = (status: OrderStatusEnum): BadgeVariant => {
        switch (status) {
            case OrderStatusEnum.Active:
                return "success";
            case OrderStatusEnum.Incoming:
                return "info";
            case OrderStatusEnum.Suspended:
                return "warning";
            case OrderStatusEnum.Expired:
                return "danger";
            default:
                return "neutral";
        }
    };

    useEffect(() => {
        if (networkContext.userNetwork) {
            let pageNumInt: number = parseInt(pageNum);
            if (!pageNumInt) {
                pageNumInt = 1;
            }
            searchOrders(pageNumInt);
        }
    }, []);

    const columns: TableColumn<OrderInfo>[] = [
        { key: "products", header: t('table_header_product'), rowHeader: true, accessor: (order) => showProducts(order) },
        { key: "total", header: t('table_header_price'), numeric: true, accessor: (order) => <>R$ {showTotal(order)}</> },
        { key: "buyer", header: t('table_header_buyer'), accessor: (order) => order.user?.name },
        { key: "seller", header: t('table_header_seller'), accessor: (order) => order.seller?.name },
        {
            key: "updatedAt",
            header: t('table_header_last_change'),
            accessor: (order) => <Moment fromNow ago interval={60000}>{order.updatedAt}</Moment>,
        },
        {
            key: "status",
            header: t('table_header_status'),
            accessor: (order) => <Badge variant={statusVariant(order.status)}>{showStatus(order.status)}</Badge>,
        },
        {
            key: "actions",
            header: t('table_header_actions'),
            actions: true,
            accessor: (order) => (
                <Link
                    to="/admin/orders"
                    className={buttonClasses({ variant: "ghost", size: "sm" })}
                    aria-label={t('adminUi.actionFor', { action: t('action_suspend'), name: showProducts(order) })}
                >
                    <FontAwesomeIcon icon={faBan} fixedWidth aria-hidden="true" className="text-danger" />
                    {t('action_suspend')}
                </Link>
            ),
        },
    ];

    const result = orderContext.searchResult;
    const title = t('breadcrumb_order_list');

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
                        { label: t('breadcrumb_my_network'), to: "/admin/dashboard" },
                        { label: title },
                    ]} />}
                    title={title}
                />
                <Table
                    columns={columns}
                    rows={result?.orders ?? []}
                    rowKey={(order, index) => order.orderId ?? index}
                    caption={result?.pageCount > 0
                        ? t('adminUi.tableCaptionPaged', { title, page: result.pageNum, total: result.pageCount })
                        : title}
                    loading={orderContext.loadingSearch}
                    empty={t('adminUi.noRecords')}
                />
                {!orderContext.loadingSearch && result && result.pageCount > 0 &&
                    <Pagination
                        className="mt-4"
                        page={result.pageNum}
                        totalPages={result.pageCount}
                        onChange={(page: number) => searchOrders(page)}
                        labels={paginationLabels}
                    />
                }
            </PageContainer>
        </>
    );
};

export default OrderSearchPage;
