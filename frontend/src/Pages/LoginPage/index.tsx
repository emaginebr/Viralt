import { useContext, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSignInAlt, faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import { Alert, Button, Card, CardContent, Checkbox, Input, PageContainer } from "../../Components/ui";

interface LoginErrors {
    email?: string;
    password?: string;
}

const LoginPage = () => {

    const { t } = useTranslation();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);

    const navigate = useNavigate();
    const [queryParams] = useSearchParams();

    const getReturnUrl = () => {
        if (queryParams.has("returnUrl")) {
            return queryParams.get("returnUrl");
        }
        return "/";
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setServerError(null);
        if (!email) {
            setFieldErrors({ email: t('login_error_email_empty') });
            emailRef.current?.focus();
            return;
        }
        if (!password) {
            setFieldErrors({ password: t('login_error_password_empty') });
            passwordRef.current?.focus();
            return;
        }
        setFieldErrors({});
        const ret = await authContext.loginWithEmail(email, password);
        if (ret.sucesso) {
            const netRet = await networkContext.listByUser();
            if (netRet.sucesso) {
                navigate(getReturnUrl());
            }
            else {
                setServerError(ret.mensagemErro);
            }
        }
        else {
            setServerError(ret.mensagemErro);
        }
    };

    return (
        <PageContainer variant="narrow">
            <Card as="section" aria-labelledby="login-title">
                <CardContent className="flex flex-col gap-6">
                    <div className="text-center">
                        <h1 id="login-title" tabIndex={-1} className="font-display text-2xl font-bold focus:outline-none">{t('login_title')}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{t('login_instruction')}</p>
                    </div>

                    <form noValidate onSubmit={handleSubmit} aria-labelledby="login-title" className="flex flex-col gap-4">
                        {serverError && (
                            <Alert
                                variant="danger"
                                dismissible
                                dismissLabel={t('shared.dismissAlert')}
                                onDismiss={() => setServerError(null)}
                            >
                                {serverError}
                            </Alert>
                        )}
                        <Input
                            ref={emailRef}
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            label={t('login_email_label')}
                            leftIcon={<FontAwesomeIcon icon={faUser} />}
                            placeholder={t('login_email_placeholder')}
                            value={email}
                            error={fieldErrors.email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            ref={passwordRef}
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            label={t('login_password_label')}
                            leftIcon={<FontAwesomeIcon icon={faLock} />}
                            placeholder={t('login_password_placeholder')}
                            value={password}
                            error={fieldErrors.password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Checkbox id="login-remember" label={t('login_remember_password_label')} />
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={authContext.loading}
                            loadingText={t('loading')}
                            leftIcon={<FontAwesomeIcon icon={faSignInAlt} />}
                        >
                            {t('login_button')}
                        </Button>
                    </form>

                    <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-between">
                        <Button asChild variant="ghost" leftIcon={<FontAwesomeIcon icon={faEnvelope} aria-hidden="true" />}>
                            <Link to="/account/recovery-password">{t('login_recovery_password_button')}</Link>
                        </Button>
                        <Button asChild variant="outline" leftIcon={<FontAwesomeIcon icon={faUserPlus} aria-hidden="true" />}>
                            <Link to="/account/new-account">{t('login_create_account_button')}</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default LoginPage;
