import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import NetworkContext from "../../Contexts/Network/NetworkContext";
import ProductContext from "../../Contexts/Product/ProductContext";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import { ProductStatusEnum } from "../../DTO/Enum/ProductStatusEnum";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import ProductInfo from "../../DTO/Domain/ProductInfo";
import ProductSearchParam from "../../DTO/Domain/ProductSearchParam";
import { Breadcrumb } from "../../Components/Breadcrumb";
import { textLinkClasses } from "../../Components/ui/cn";
import { usePaginationLabels } from "../../hooks/usePaginationLabels";
import {
    Badge, Button, Input, PageContainer, PageHeader, Pagination, Table, buttonClasses,
    type BadgeVariant, type TableColumn,
} from "../../Components/ui";

const ProductSearchPage = () => {

    const { t } = useTranslation();

    const navigate = useNavigate();

    const networkContext = useContext(NetworkContext);
    const productContext = useContext(ProductContext);

    const { pageNum } = useParams();
    const paginationLabels = usePaginationLabels(t('pagination.productNav'));

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const throwError = (message: string) => {
        setDialog(MessageToastEnum.Error);
        setMessageText(message);
        setShowMessage(true);
    };

    const searchProducts = (pageNum: number) => {
        let param: ProductSearchParam;
        param = {
            ...param,
            networkId: networkContext.userNetwork.networkId,
            userId: 0,
            keyword: "",
            onlyActive: false,
            pageNum: pageNum
        };
        productContext.search(param).then((ret) => {
            if (!ret.sucesso) {
                throwError(ret.mensagemErro);
            }
        });
    };

    const showFrequency = (frequency: number) => {
        let retorno: string;
        switch (frequency) {
            case 0:
                retorno = t('product_edit_frequency_one_time');
                break;
            case 30:
                retorno = t('product_edit_frequency_monthly');
                break;
            case 365:
                retorno = t('product_edit_frequency_annually');
                break;
        }
        return retorno!;
    };

    const showStatus = (status: ProductStatusEnum) => {
        let retorno: string;
        switch (status) {
            case ProductStatusEnum.Active:
                retorno = t('product_status_active');
                break;
            case ProductStatusEnum.Inactive:
                retorno = t('product_status_inactive');
                break;
            case ProductStatusEnum.Expired:
                retorno = t('product_status_expired');
                break;
        }
        return retorno!;
    };

    const statusVariant = (status: ProductStatusEnum): BadgeVariant => {
        switch (status) {
            case ProductStatusEnum.Active:
                return "success";
            case ProductStatusEnum.Expired:
                return "warning";
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
            searchProducts(pageNumInt);
        }
    }, []);

    const canManage = networkContext.currentRole >= UserRoleEnum.NetworkManager;
    const iconLinkClasses = buttonClasses({ variant: "ghost", size: "icon" });

    const columns: TableColumn<ProductInfo>[] = [
        {
            key: "name",
            header: t('table_header_product'),
            rowHeader: true,
            accessor: (product) => canManage
                ? <Link to={"/admin/products/" + product.productId} className={textLinkClasses}>{product.name}</Link>
                : product.name,
        },
        { key: "frequency", header: t('table_header_frequency'), accessor: (product) => showFrequency(product.frequency) },
        { key: "price", header: t('table_header_price'), numeric: true, accessor: (product) => <>R$ {product.price}</> },
        {
            key: "status",
            header: t('table_header_status'),
            accessor: (product) => <Badge variant={statusVariant(product.status)}>{showStatus(product.status)}</Badge>,
        },
    ];

    if (canManage) {
        columns.push({
            key: "actions",
            header: t('table_header_actions'),
            actions: true,
            accessor: (product) => (
                <div className="flex justify-end gap-1">
                    <Link
                        to={"/admin/products/" + product.productId}
                        className={iconLinkClasses}
                        aria-label={t('adminUi.editItem', { name: product.name })}
                        title={t('adminUi.editItem', { name: product.name })}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} fixedWidth aria-hidden="true" />
                    </Link>
                    <Link
                        to="/admin/products/new"
                        className={iconLinkClasses}
                        aria-label={t('adminUi.deleteItem', { name: product.name })}
                        title={t('adminUi.deleteItem', { name: product.name })}
                    >
                        <FontAwesomeIcon icon={faTrash} fixedWidth aria-hidden="true" />
                    </Link>
                </div>
            ),
        });
    }

    const result = productContext.searchResult;
    const title = t('breadcrumb_products_list');

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
                            leftIcon={<FontAwesomeIcon icon={faPlus} fixedWidth aria-hidden="true" />}
                            onClick={() => {
                                productContext.setProduct(null);
                                navigate("/admin/products/new");
                            }}
                        >
                            {t('product_search_button_new_product')}
                        </Button>
                    }
                />
                <form role="search" aria-label={t('product_search_aria_label_keyword')} className="mb-4" onSubmit={(e) => e.preventDefault()}>
                    <Input
                        variant="search"
                        label={t('product_search_aria_label_keyword')}
                        placeholder={t('product_search_placeholder_keyword')}
                        rightAddon={
                            <Button type="submit" variant="outline" size="icon" aria-label={t('adminUi.search')}>
                                <FontAwesomeIcon icon={faMagnifyingGlass} fixedWidth aria-hidden="true" />
                            </Button>
                        }
                    />
                </form>
                <Table
                    columns={columns}
                    rows={result?.products ?? []}
                    rowKey={(product, index) => product.productId ?? index}
                    caption={result?.pageCount > 0
                        ? t('adminUi.tableCaptionPaged', { title, page: result.pageNum, total: result.pageCount })
                        : title}
                    loading={productContext.loadingSearch}
                    empty={t('adminUi.noRecords')}
                />
                {!productContext.loadingSearch && result && result.pageCount > 0 &&
                    <Pagination
                        className="mt-4"
                        page={result.pageNum}
                        totalPages={result.pageCount}
                        onChange={(page: number) => searchProducts(page)}
                        labels={paginationLabels}
                    />
                }
            </PageContainer>
        </>
    );
};

export default ProductSearchPage;
