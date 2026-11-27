import { useContext, useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faSave, faUser, faUserEdit } from '@fortawesome/free-solid-svg-icons';
import AuthContext from "../../Contexts/Auth/AuthContext";
import UserContext from "../../Contexts/User/UserContext";
import { Alert, Button, Card, CardContent, Input, PageContainer } from "../../Components/ui";

type PasswordField = 'oldPassword' | 'newPassword' | 'confirmPassword';
type PasswordErrors = Partial<Record<PasswordField, string>>;

const PasswordPage = () => {

    const { t } = useTranslation();

    const authContext = useContext(AuthContext);
    const userContext = useContext(UserContext);

    const [showAlert, setShowAlert] = useState<boolean>(true);

    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [errors, setErrors] = useState<PasswordErrors>({});

    const refs: Record<PasswordField, RefObject<HTMLInputElement>> = {
        oldPassword: useRef<HTMLInputElement>(null),
        newPassword: useRef<HTMLInputElement>(null),
        confirmPassword: useRef<HTMLInputElement>(null),
    };

    const throwError = (message: string) => {
        toast.error(message);
    };
    const showSuccessMessage = (message: string) => {
        toast.success(message);
    };

    const navigate = useNavigate();

    useEffect(() => {
        if (authContext.sessionInfo && authContext.sessionInfo?.userId > 0) {
            userContext.getMe().then((ret) => {
                if (!ret.sucesso) {
                    throwError(ret.mensagemErro);
                    return;
                }
                userContext.hasPassword();
            });
        }
        else {
            throwError(t('password_page_user_not_found'));
        }
    }, []);

    const fail = (field: PasswordField, message: string) => {
        const next: PasswordErrors = {};
        next[field] = message;
        setErrors(next);
        refs[field].current?.focus();
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userContext.user?.email) return;
        if (userContext.userHasPassword) {
            if (!oldPassword) {
                fail('oldPassword', t('password_page_error_old_password_empty'));
                return;
            }
        }
        if (!newPassword) {
            fail('newPassword', t('password_page_error_new_password_empty'));
            return;
        }
        if (!confirmPassword) {
            fail('confirmPassword', t('password_page_error_confirm_password_empty'));
            return;
        }
        if (newPassword != confirmPassword) {
            fail('confirmPassword', t('password_page_error_passwords_not_equal'));
            return;
        }
        setErrors({});
        const ret = await userContext.changePassword(oldPassword, newPassword);
        if (ret.sucesso) {
            showSuccessMessage(ret.mensagemSucesso);
        }
        else {
            throwError(ret.mensagemErro);
        }
    };

    const hasEmail = Boolean(userContext.user?.email);

    return (
        <PageContainer variant="narrow">
            <Card as="section" aria-labelledby="password-title">
                <CardContent className="flex flex-col gap-6">
                    <div className="text-center">
                        <h1 id="password-title" tabIndex={-1} className="font-display text-2xl font-bold focus:outline-none">
                            {t('password_page_change_password_title')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">{t('password_page_instruction')}</p>
                    </div>

                    <form noValidate onSubmit={handleSubmit} aria-labelledby="password-title" className="flex flex-col gap-4">
                        <Input
                            id="password-email"
                            type="email"
                            label={t('form_label_email')}
                            leftIcon={<FontAwesomeIcon icon={faUser} />}
                            readOnly
                            value={userContext.user?.email ?? ""}
                        />
                        {userContext.userHasPassword &&
                            <Input
                                ref={refs.oldPassword}
                                id="password-old"
                                type="password"
                                autoComplete="current-password"
                                label={t('password_page_old_password_label')}
                                leftIcon={<FontAwesomeIcon icon={faLock} />}
                                placeholder={t('password_page_old_password_placeholder')}
                                value={oldPassword}
                                error={errors.oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        }
                        <Input
                            ref={refs.newPassword}
                            id="password-new"
                            type="password"
                            autoComplete="new-password"
                            label={t('password_page_new_password_label')}
                            leftIcon={<FontAwesomeIcon icon={faLock} />}
                            placeholder={t('password_page_new_password_placeholder')}
                            value={newPassword}
                            error={errors.newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Input
                            ref={refs.confirmPassword}
                            id="password-confirm"
                            type="password"
                            autoComplete="new-password"
                            label={t('form_label_confirm_password')}
                            leftIcon={<FontAwesomeIcon icon={faLock} />}
                            placeholder={t('password_page_confirm_new_password_placeholder')}
                            value={confirmPassword}
                            error={errors.confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        {showAlert && !hasEmail &&
                            <Alert
                                variant="warning"
                                dismissible
                                dismissLabel={t('shared.dismissAlert')}
                                onDismiss={() => setShowAlert(false)}
                            >
                                {t('password_page_alert_enter_email_first_part_1')} <strong>{t('password_page_alert_password')}</strong>
                                {t('password_page_alert_enter_email_first_part_2')} <strong>{t('password_page_alert_email')}</strong>!
                            </Alert>
                        }

                        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                            {!hasEmail &&
                                <Button
                                    variant="outline"
                                    leftIcon={<FontAwesomeIcon icon={faUserEdit} />}
                                    onClick={() => navigate("/account/edit-account")}
                                >
                                    {t('password_page_edit_account_button')}
                                </Button>
                            }
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!hasEmail}
                                loading={hasEmail && userContext.loadingUpdate}
                                loadingText={t('loading')}
                                leftIcon={<FontAwesomeIcon icon={faSave} />}
                            >
                                {t('password_page_change_password_button')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default PasswordPage;
