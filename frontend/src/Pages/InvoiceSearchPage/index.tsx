import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Moment from 'react-moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faRotate } from '@fortawesome/free-solid-svg-icons';
import NetworkContext from "../../Contexts/Network/NetworkContext";
import AuthContext from "../../Contexts/Auth/AuthContext";
import InvoiceContext from "../../Contexts/Invoice/InvoiceContext";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import { InvoiceStatusEnum } from "../../DTO/Enum/InvoiceStatusEnum";
import OrderInfo from "../../DTO/Domain/OrderInfo";
import InvoiceInfo from "../../DTO/Domain/InvoiceInfo";
import MessageToast from "../../Components/MessageToast";
import { Breadcrumb } from "../../Components/Breadcrumb";
import { usePaginationLabels } from "../../hooks/usePaginationLabels";
import {
    Badge, Button, PageContainer, PageHeader, Pagination, Table, buttonClasses,
    type BadgeVariant, type TableColumn,
} from "../../Components/ui";

const InvoiceSearchPage = () => {

    const { t } = useTranslation();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const invoiceContext = useContext(InvoiceContext);

    const { pageNum } = useParams();
    const paginationLabels = usePaginationLabels(t('pagination.invoiceNav'));

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

    const searchInvoices = (pageNum: number) => {
        switch (networkContext.currentRole) {
            case UserRoleEnum.NetworkManager:
                invoiceContext.search(
                    networkContext.userNetwork.networkId,
                    0,
                    0,
                    pageNum
                ).then((ret) => {
                    if (!ret.sucesso) {
                        throwError(ret.mensagemErro);
                    }
                });
                break;
            case UserRoleEnum.Seller:
                invoiceContext.search(
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
                invoiceContext.search(
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

    const showStatus = (status: InvoiceStatusEnum) => {
        let retorno: string;
        switch (status) {
            case InvoiceStatusEnum.Draft:
                retorno = t('invoice_status_draft');
                break;
            case InvoiceStatusEnum.Open:
                retorno = t('invoice_status_open');
                break;
            case InvoiceStatusEnum.Paid:
                retorno = t('invoice_status_paid');
                break;
            case InvoiceStatusEnum.Cancelled:
                retorno = t('invoice_status_cancelled');
                break;
            case InvoiceStatusEnum.Lost:
                retorno = t('invoice_status_lost');
                break;
        }
        return retorno!;
    };

    const statusVariant = (status: InvoiceStatusEnum): BadgeVariant => {
        switch (status) {
            case InvoiceStatusEnum.Paid:
                return "success";
            case InvoiceStatusEnum.Open:
                return "info";
            case InvoiceStatusEnum.Cancelled:
            case InvoiceStatusEnum.Lost:
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
            searchInvoices(pageNumInt);
        }
    }, []);

    const handleSync = async () => {
        const ret = await invoiceContext.syncronize();
        if (!ret.sucesso) {
            throwError(ret.mensagemErro);
            return;
        }
        searchInvoices(1);
    };

    const columns: TableColumn<InvoiceInfo>[] = [
        { key: "products", header: t('table_header_product'), rowHeader: true, accessor: (invoice) => showProducts(invoice.order) },
        { key: "total", header: t('table_header_price'), numeric: true, accessor: (invoice) => <>R$ {showTotal(invoice.order)}</> },
        { key: "buyer", header: t('table_header_buyer'), accessor: (invoice) => invoice.user?.name },
        { key: "seller", header: t('table_header_seller'), accessor: (invoice) => invoice.seller?.name },
        {
            key: "dueDate",
            header: t('table_header_due_date'),
            accessor: (invoice) => <Moment format="DD/MM/YYYY" interval={0}>{invoice.dueDate}</Moment>,
        },
        {
            key: "paymentDate",
            header: t('table_header_paid_date'),
            accessor: (invoice) => <Moment format="DD/MM/YYYY" interval={0}>{invoice.paymentDate}</Moment>,
        },
        {
            key: "status",
            header: t('table_header_status'),
            accessor: (invoice) => <Badge variant={statusVariant(invoice.status)}>{showStatus(invoice.status)}</Badge>,
        },
        {
            key: "actions",
            header: t('table_header_actions'),
            actions: true,
            accessor: (invoice) => (
                <Link
                    to="/admin/orders"
                    className={buttonClasses({ variant: "ghost", size: "sm" })}
                    aria-label={t('adminUi.actionFor', { action: t('action_suspend'), name: showProducts(invoice.order) })}
                >
                    <FontAwesomeIcon icon={faBan} fixedWidth aria-hidden="true" className="text-danger" />
                    {t('action_suspend')}
                </Link>
            ),
        },
    ];

    const result = invoiceContext.searchResult;
    const title = t('breadcrumb_invoice_search');

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
                    actions={
                        <Button
                            variant="secondary"
                            loading={invoiceContext.loadingUpdate}
                            loadingText={t('adminUi.invoice.syncing')}
                            leftIcon={<FontAwesomeIcon icon={faRotate} fixedWidth aria-hidden="true" />}
                            onClick={handleSync}
                        >
                            {t('adminUi.invoice.sync')}
                        </Button>
                    }
                />
                <Table
                    columns={columns}
                    rows={result?.invoices ?? []}
                    rowKey={(invoice, index) => invoice.invoiceId ?? index}
                    caption={result?.pageCount > 0
                        ? t('adminUi.tableCaptionPaged', { title, page: result.pageNum, total: result.pageCount })
                        : title}
                    loading={invoiceContext.loadingSearch}
                    empty={t('invoice_search_no_invoices_found')}
                />
                {!invoiceContext.loadingSearch && result && result.pageCount > 0 &&
                    <Pagination
                        className="mt-4"
                        page={result.pageNum}
                        totalPages={result.pageCount}
                        onChange={(page: number) => searchInvoices(page)}
                        labels={paginationLabels}
                    />
                }
            </PageContainer>
        </>
    );
};

export default InvoiceSearchPage;
