import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Moment from 'moment';
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCode, faImage, faSave, faTag, faUpload } from '@fortawesome/free-solid-svg-icons';
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { CustomToolbar } from "../../Components/CustomToolbar";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import ProductContext from "../../Contexts/Product/ProductContext";
import ProductInfo from "../../DTO/Domain/ProductInfo";
import { ProductStatusEnum } from "../../DTO/Enum/ProductStatusEnum";
import { ImageModal, ImageTypeEnum } from "../../Components/ImageModal";
import { Breadcrumb } from "../../Components/Breadcrumb";
import { Button, Card, CardContent, FieldLabel, Input, PageContainer, PageHeader, Select } from "../../Components/ui";

const DESCRIPTION_LABEL_ID = "product-description-label";

/** Toolbar button selector → i18n key (aria-label), applied only when the button has none. */
const TOOLBAR_LABELS: Record<string, string> = {
    ".ql-bold": "adminUi.richText.bold",
    ".ql-italic": "adminUi.richText.italic",
    ".ql-underline": "adminUi.richText.underline",
    ".ql-link": "adminUi.richText.link",
    ".ql-clean": "adminUi.richText.clean",
    ".ql-save": "adminUi.richText.save",
};

const ProductEditPage = () => {

    const { t, i18n } = useTranslation();

    const networkContext = useContext(NetworkContext);
    const productContext = useContext(ProductContext);

    const { productId } = useParams();

    const [insertMode, setInsertMode] = useState<boolean>(false);
    const [showImageModal, setShowImageModal] = useState<boolean>(false);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const quillRef = useRef<ReactQuill>(null);

    const navigate = useNavigate();
    Moment.locale('en');

    const throwError = (message: string) => {
        setDialog(MessageToastEnum.Error)
        setMessageText(message);
        setShowMessage(true);
    };
    const showSuccessMessage = (message: string) => {
        setDialog(MessageToastEnum.Success)
        setMessageText(message);
        setShowMessage(true);
    };

    useEffect(() => {
        const productIdNum: number = parseInt(productId);
        if (productIdNum > 0) {
            productContext.getById(productIdNum).then((ret) => {
                if (!ret.sucesso) {
                    throwError(ret.mensagemErro);
                    return;
                }
                setInsertMode(false);
            });
            return;
        }
        setInsertMode(true);
        const product: ProductInfo = null;
        productContext.setProduct({
            ...product,
            networkId: networkContext.userNetwork?.networkId,
            status: ProductStatusEnum.Active
        });
    }, []);

    // Accessibility of the Quill DOM (components.md §25.1): textbox role and label on the editor,
    // translated aria-labels on the toolbar buttons that have none.
    useEffect(() => {
        const editor = quillRef.current?.getEditor();
        const root = editor?.root;
        if (root) {
            root.setAttribute("role", "textbox");
            root.setAttribute("aria-multiline", "true");
            root.setAttribute("aria-labelledby", DESCRIPTION_LABEL_ID);
        }
        const toolbar = document.getElementById("custom-toolbar");
        if (toolbar) {
            // The toolbar sits inside the <form>: buttons without a type would submit it.
            toolbar.querySelectorAll<HTMLButtonElement>("button:not([type])").forEach((button) => {
                button.type = "button";
            });
            Object.entries(TOOLBAR_LABELS).forEach(([selector, key]) => {
                toolbar.querySelectorAll<HTMLElement>(selector).forEach((element) => {
                    if (!element.getAttribute("aria-label") || element.dataset.i18nLabel === "1") {
                        element.setAttribute("aria-label", t(key));
                        element.setAttribute("title", t(key));
                        element.dataset.i18nLabel = "1";
                    }
                });
            });
        }
    }, [i18n.language]);

    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (insertMode) {
            productContext.setProduct({
                ...productContext.product,
                productId: 0,
                networkId: networkContext.userNetwork?.networkId
            });
            const ret = await productContext.insert(productContext.product);
            if (ret.sucesso) {
                showSuccessMessage(ret.mensagemSucesso ? ret.mensagemSucesso : t('product_edit_insert_success_message'));
            }
            else {
                throwError(ret.mensagemErro);
            }
        }
        else {
            const ret = await productContext.update(productContext.product);
            if (ret.sucesso) {
                showSuccessMessage(ret.mensagemSucesso ? ret.mensagemSucesso : t('product_edit_update_success_message'));
            }
            else {
                throwError(ret.mensagemErro);
            }
        }
    };

    const product = productContext.product;
    const priceValue = product?.price === undefined || product?.price === null || Number.isNaN(product?.price) ? "" : product.price;

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            ></MessageToast>
            <ImageModal
                Image={ImageTypeEnum.Product}
                productId={productContext.product?.productId}
                show={showImageModal}
                onClose={() => setShowImageModal(false)}
                onSuccess={(url: string) => {
                    productContext.setProduct({
                        ...productContext.product,
                        imageUrl: url
                    });
                }}
            />
            <PageContainer>
                <PageHeader
                    breadcrumb={<Breadcrumb items={[
                        { label: t('breadcrumb_my_network'), to: "/admin/dashboard" },
                        { label: t('breadcrumb_products_list'), to: "/admin/products" },
                        { label: t('breadcrumb_my_product') },
                    ]} />}
                    title={product?.name || t('breadcrumb_my_product')}
                />
                <Card>
                    <CardContent className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                        <div className="flex flex-col items-center gap-4">
                            {product?.imageUrl ?
                                <img
                                    src={product?.imageUrl}
                                    alt={product?.name ?? ""}
                                    className="h-auto w-full rounded-md border border-border object-cover"
                                />
                                :
                                <div aria-hidden="true" className="flex aspect-square w-full items-center justify-center rounded-md bg-muted text-3xl text-muted-foreground">
                                    <FontAwesomeIcon icon={faImage} />
                                </div>
                            }
                            {product?.productId > 0 &&
                                <Button
                                    variant="outline"
                                    fullWidth
                                    leftIcon={<FontAwesomeIcon icon={faUpload} fixedWidth aria-hidden="true" />}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowImageModal(true);
                                    }}
                                >
                                    {t('product_edit_change_image_button')}
                                </Button>
                            }
                        </div>
                        <form className="flex min-w-0 flex-col gap-4" onSubmit={handleSave} noValidate>
                            <p className="text-muted-foreground">{t('network_edit_registration_info')}</p>
                            <Input
                                label={t('form_label_name')}
                                leftIcon={<FontAwesomeIcon icon={faTag} fixedWidth />}
                                placeholder={t('product_edit_name_placeholder')}
                                value={product?.name ?? ""}
                                onChange={(e) => {
                                    productContext.setProduct({
                                        ...productContext.product,
                                        name: e.target.value
                                    });
                                }}
                            />
                            {product?.productId > 0 &&
                                <Input
                                    label={t('form_label_slug')}
                                    leftIcon={<FontAwesomeIcon icon={faCode} fixedWidth />}
                                    placeholder={t('product_edit_slug_placeholder')}
                                    value={product?.slug ?? ""}
                                    onChange={(e) => {
                                        productContext.setProduct({
                                            ...productContext.product,
                                            slug: e.target.value
                                        });
                                    }}
                                />
                            }
                            <div className="grid gap-4 sm:grid-cols-3">
                                <Select
                                    label={t('product_edit_frequency_label')}
                                    value={product?.frequency ?? 0}
                                    onChange={(e) => {
                                        productContext.setProduct({
                                            ...productContext.product,
                                            frequency: parseInt(e.target.value)
                                        });
                                    }}
                                    options={[
                                        { value: 0, label: t('product_edit_frequency_one_time') },
                                        { value: 30, label: t('product_edit_frequency_monthly') },
                                        { value: 365, label: t('product_edit_frequency_annually') },
                                    ]}
                                />
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    label={t('product_edit_price_label')}
                                    leftAddon="R$"
                                    placeholder={t('product_edit_price_placeholder')}
                                    value={priceValue}
                                    onChange={(e) => {
                                        productContext.setProduct({
                                            ...productContext.product,
                                            price: parseFloat(e.target.value)
                                        });
                                    }}
                                />
                                <Select
                                    label={t('product_edit_status_label')}
                                    value={product?.status ?? ProductStatusEnum.Active}
                                    onChange={(e) => {
                                        productContext.setProduct({
                                            ...productContext.product,
                                            status: parseInt(e.target.value)
                                        });
                                    }}
                                    options={[
                                        { value: ProductStatusEnum.Active, label: t('product_status_active') },
                                        { value: ProductStatusEnum.Inactive, label: t('product_status_inactive') },
                                        { value: ProductStatusEnum.Expired, label: t('product_status_expired') },
                                    ]}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <FieldLabel id={DESCRIPTION_LABEL_ID}>{t('adminUi.productDescription')}</FieldLabel>
                                <div className="rich-text">
                                    <CustomToolbar />
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={product?.description ?? ""}
                                        placeholder={t('product_edit_description_placeholder')}
                                        onChange={(value) => {
                                            productContext.setProduct({
                                                ...productContext.product,
                                                description: value
                                            });
                                        }}
                                        modules={{
                                            toolbar: {
                                                container: "#custom-toolbar",
                                            },
                                        }}
                                        formats={[
                                            "header",
                                            "bold",
                                            "italic",
                                            "underline",
                                            "size",
                                            "link",
                                            "clean",
                                        ]}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                                <Button
                                    variant="outline"
                                    leftIcon={<FontAwesomeIcon icon={faArrowLeft} fixedWidth aria-hidden="true" />}
                                    onClick={() => navigate("/admin/products")}
                                >
                                    {t('back_button')}
                                </Button>
                                <Button
                                    type="submit"
                                    loading={productContext.loadingUpdate}
                                    loadingText={t('loading')}
                                    leftIcon={<FontAwesomeIcon icon={faSave} fixedWidth aria-hidden="true" />}
                                >
                                    {t('save_button')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </PageContainer>
        </>
    );
};

export default ProductEditPage;
