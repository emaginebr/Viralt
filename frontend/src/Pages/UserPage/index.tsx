import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faCamera, faEnvelope, faLock, faSave, faUser } from '@fortawesome/free-solid-svg-icons';
import Moment from 'moment';
import AuthContext from "../../Contexts/Auth/AuthContext";
import UserContext from "../../Contexts/User/UserContext";
import { ImageModal, ImageTypeEnum } from "../../Components/ImageModal";
import { Avatar, Button, Card, CardContent, Input, PageContainer } from "../../Components/ui";

const UserPage = () => {

    const { t } = useTranslation();

    const authContext = useContext(AuthContext);
    const userContext = useContext(UserContext);

    const [insertMode, setInsertMode] = useState<boolean>(false);
    const [showImageModal, setShowImageModal] = useState<boolean>(false);

    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const confirmRef = useRef<HTMLInputElement>(null);

    Moment.locale('en');

    const throwError = (message: string) => {
        toast.error(message);
    };
    const showSuccessMessage = (message: string) => {
        toast.success(message);
    };

    useEffect(() => {
        if (authContext.sessionInfo) {
            if (authContext.sessionInfo?.userId > 0) {
                userContext.getMe().then((ret) => {
                    if (ret.sucesso) {
                        setInsertMode(false);
                    }
                    else {
                        setInsertMode(true);
                    }
                });
            }
            else {
                setInsertMode(true);
            }
        }
        else {
            setInsertMode(true);
        }
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (insertMode) {
            if (userContext.user?.password != confirmPassword) {
                setConfirmError(t("userPage.errors.passwordsNotEqual"));
                confirmRef.current?.focus();
                return;
            }
            setConfirmError(null);
            const ret = await userContext.insert(userContext.user);
            if (ret.sucesso) {
                showSuccessMessage(ret.mensagemSucesso);
            }
            else {
                throwError(ret.mensagemErro);
            }
        }
        else {
            const ret = await userContext.update(userContext.user);
            if (ret.sucesso) {
                showSuccessMessage(ret.mensagemSucesso);
            }
            else {
                throwError(ret.mensagemErro);
            }
        }
    };

    const formatDate = (value: string | Date | null | undefined): string =>
        value ? Moment(value).format("DD/MM/YYYY") : "";

    return (
        <>
            <ImageModal
                Image={ImageTypeEnum.User}
                show={showImageModal}
                onClose={() => setShowImageModal(false)}
                onSuccess={(url: string) => {
                    userContext.setUser({
                        ...userContext.user,
                        imageUrl: url
                    });
                }}
            />
            <PageContainer>
                <Card as="section" aria-labelledby="user-title" className="mx-auto max-w-4xl">
                    <CardContent className="grid gap-8 md:grid-cols-4">
                        <div className="flex flex-col items-center gap-4 md:col-span-1">
                            <Avatar name={userContext.user?.name} src={userContext.user?.imageUrl} size="lg" />
                            {userContext.user?.userId > 0 &&
                                <Button
                                    variant="outline"
                                    leftIcon={<FontAwesomeIcon icon={faCamera} aria-hidden="true" />}
                                    onClick={() => setShowImageModal(true)}
                                >
                                    {t("userPage.changeImage")}
                                </Button>
                            }
                        </div>

                        <form noValidate onSubmit={handleSubmit} aria-labelledby="user-title" className="flex flex-col gap-4 md:col-span-3">
                            <h1 id="user-title" tabIndex={-1} className="font-display text-2xl font-bold focus:outline-none">
                                {userContext.user?.name || t("userPage.title")}
                            </h1>
                            {!insertMode &&
                                <Input
                                    id="user-hash"
                                    label={t("userPage.hashLabel")}
                                    leftIcon={<FontAwesomeIcon icon={faLock} />}
                                    readOnly
                                    className="font-mono text-sm"
                                    value={userContext.user?.hash ?? ""}
                                />
                            }
                            <Input
                                id="user-name"
                                autoComplete="name"
                                label={t("userPage.nameLabel")}
                                leftIcon={<FontAwesomeIcon icon={faUser} />}
                                placeholder={t("userPage.namePlaceholder")}
                                value={userContext.user?.name ?? ""}
                                onChange={(e) => {
                                    userContext.setUser({
                                        ...userContext.user,
                                        name: e.target.value
                                    });
                                }}
                            />
                            <Input
                                id="user-email"
                                type="email"
                                autoComplete="email"
                                inputMode="email"
                                label={t("userPage.emailLabel")}
                                leftIcon={<FontAwesomeIcon icon={faEnvelope} />}
                                placeholder={t("userPage.emailPlaceholder")}
                                value={userContext.user?.email ?? ""}
                                onChange={(e) => {
                                    userContext.setUser({
                                        ...userContext.user,
                                        email: e.target.value
                                    });
                                }}
                            />
                            {insertMode &&
                                <>
                                    <Input
                                        id="user-password"
                                        type="password"
                                        autoComplete="new-password"
                                        label={t("userPage.passwordLabel")}
                                        leftIcon={<FontAwesomeIcon icon={faLock} />}
                                        placeholder={t("userPage.passwordPlaceholder")}
                                        value={userContext.user?.password ?? ""}
                                        onChange={(e) => {
                                            userContext.setUser({
                                                ...userContext.user,
                                                password: e.target.value
                                            });
                                        }}
                                    />
                                    <Input
                                        ref={confirmRef}
                                        id="user-confirm-password"
                                        type="password"
                                        autoComplete="new-password"
                                        label={t("userPage.confirmPasswordLabel")}
                                        leftIcon={<FontAwesomeIcon icon={faLock} />}
                                        placeholder={t("userPage.confirmPasswordPlaceholder")}
                                        value={confirmPassword}
                                        error={confirmError}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                        }}
                                    />
                                </>
                            }
                            {!insertMode &&
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Input
                                        id="user-created-at"
                                        label={t("userPage.createdAtLabel")}
                                        leftIcon={<FontAwesomeIcon icon={faCalendarAlt} />}
                                        readOnly
                                        value={formatDate(userContext.user?.createAt)}
                                    />
                                    <Input
                                        id="user-updated-at"
                                        label={t("userPage.updatedAtLabel")}
                                        leftIcon={<FontAwesomeIcon icon={faCalendarAlt} />}
                                        readOnly
                                        value={formatDate(userContext.user?.updateAt)}
                                    />
                                </div>
                            }
                            <div className="flex justify-end border-t border-border pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={userContext.loadingUpdate}
                                    loadingText={t("loading")}
                                    leftIcon={<FontAwesomeIcon icon={faSave} />}
                                    className="w-full sm:w-auto"
                                >
                                    {t("buttons.save")}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </PageContainer>
        </>
    );
};

export default UserPage;
