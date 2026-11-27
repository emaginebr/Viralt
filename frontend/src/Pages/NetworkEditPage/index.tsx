import { useContext, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCalendar, faCode, faEnvelope, faImage, faSave, faUpload, faUser } from '@fortawesome/free-solid-svg-icons';
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import { ImageModal, ImageTypeEnum } from "../../Components/ImageModal";
import { Breadcrumb } from "../../Components/Breadcrumb";
import { Button, Card, CardContent, Input, PageContainer, PageHeader } from "../../Components/ui";

const NetworkEditPage = () => {

    const { t } = useTranslation();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const [showImageModal, setShowImageModal] = useState<boolean>(false);

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
        if (authContext.sessionInfo && networkContext.userNetwork) {
            networkContext.getById(networkContext.userNetwork.networkId).then((ret) => {
                if (!ret.sucesso) {
                    throwError(ret.mensagemErro);
                }
            });
        }
    }, []);

    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const ret = await networkContext.update(networkContext.network);
        if (ret.sucesso) {
            showSuccessMessage(t('network_edit_update_success_message'));
        }
        else {
            throwError(ret.mensagemErro);
        }
    };

    const numberValue = (value: number | undefined) =>
        value === undefined || value === null || Number.isNaN(value) ? "" : value;

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            ></MessageToast>
            <ImageModal
                Image={ImageTypeEnum.Network}
                networkId={networkContext.network?.networkId}
                show={showImageModal}
                onClose={() => setShowImageModal(false)}
                onSuccess={(url: string) => {
                    networkContext.setNetwork({
                        ...networkContext.network,
                        imageUrl: url
                    });
                }}
            />
            <PageContainer>
                <PageHeader
                    breadcrumb={<Breadcrumb items={[
                        { label: t('breadcrumb_my_network'), to: "/admin/dashboard" },
                        { label: t('preferences') },
                    ]} />}
                    title={t('preferences')}
                />
                <Card>
                    <CardContent className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                        <div className="flex flex-col items-center gap-4">
                            {networkContext.network?.imageUrl ?
                                <img
                                    src={networkContext.network?.imageUrl}
                                    alt={networkContext.network?.name ?? ""}
                                    className="h-auto w-full rounded-md border border-border object-cover"
                                />
                                :
                                <div aria-hidden="true" className="flex aspect-video w-full items-center justify-center rounded-md bg-muted text-3xl text-muted-foreground">
                                    <FontAwesomeIcon icon={faImage} />
                                </div>
                            }
                            {networkContext.network?.networkId > 0 &&
                                <Button
                                    variant="outline"
                                    fullWidth
                                    leftIcon={<FontAwesomeIcon icon={faUpload} fixedWidth aria-hidden="true" />}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowImageModal(true);
                                    }}
                                >
                                    {t('network_edit_change_image_button')}
                                </Button>
                            }
                        </div>
                        <form className="flex flex-col gap-4" onSubmit={handleSave} noValidate>
                            <p className="text-muted-foreground">{t('network_edit_registration_info')}</p>
                            <Input
                                label={t('form_label_name')}
                                leftIcon={<FontAwesomeIcon icon={faUser} fixedWidth />}
                                placeholder={t('network_edit_name_placeholder')}
                                value={networkContext.network?.name ?? ""}
                                onChange={(e) => {
                                    networkContext.setNetwork({
                                        ...networkContext.network,
                                        name: e.target.value
                                    });
                                }}
                            />
                            <Input
                                label={t('form_label_slug')}
                                leftIcon={<FontAwesomeIcon icon={faCode} fixedWidth />}
                                placeholder={t('network_edit_slug_placeholder')}
                                value={networkContext.network?.slug ?? ""}
                                onChange={(e) => {
                                    networkContext.setNetwork({
                                        ...networkContext.network,
                                        slug: e.target.value
                                    });
                                }}
                            />
                            <Input
                                type="email"
                                autoComplete="email"
                                label={t('form_label_email')}
                                leftIcon={<FontAwesomeIcon icon={faEnvelope} fixedWidth />}
                                placeholder={t('network_edit_email_placeholder')}
                                value={networkContext.network?.email ?? ""}
                                onChange={(e) => {
                                    networkContext.setNetwork({
                                        ...networkContext.network,
                                        email: e.target.value
                                    });
                                }}
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    label={t('network_edit_minimal_withdrawal_label')}
                                    leftAddon="R$"
                                    placeholder={t('network_edit_minimal_withdrawal_placeholder')}
                                    value={numberValue(networkContext.network?.withdrawalMin)}
                                    onChange={(e) => {
                                        networkContext.setNetwork({
                                            ...networkContext.network,
                                            withdrawalMin: parseFloat(e.target.value)
                                        });
                                    }}
                                />
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    label={t('network_edit_withdrawal_period_label')}
                                    leftIcon={<FontAwesomeIcon icon={faCalendar} fixedWidth />}
                                    placeholder={t('network_edit_withdrawal_period_placeholder')}
                                    value={numberValue(networkContext.network?.withdrawalPeriod)}
                                    onChange={(e) => {
                                        networkContext.setNetwork({
                                            ...networkContext.network,
                                            withdrawalPeriod: parseInt(e.target.value)
                                        });
                                    }}
                                />
                            </div>
                            <Input
                                type="number"
                                inputMode="numeric"
                                label={t('network_edit_commission_label')}
                                rightAddon="%"
                                placeholder={t('network_edit_commission_placeholder')}
                                value={numberValue(networkContext.network?.comission)}
                                onChange={(e) => {
                                    networkContext.setNetwork({
                                        ...networkContext.network,
                                        comission: parseInt(e.target.value)
                                    });
                                }}
                                wrapperClassName="sm:max-w-[calc(50%-0.5rem)]"
                            />
                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                                <Button
                                    variant="outline"
                                    leftIcon={<FontAwesomeIcon icon={faArrowLeft} fixedWidth aria-hidden="true" />}
                                    onClick={() => navigate("/admin/dashboard")}
                                >
                                    {t('back_button')}
                                </Button>
                                <Button
                                    type="submit"
                                    loading={networkContext.loadingUpdate}
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

export default NetworkEditPage;
