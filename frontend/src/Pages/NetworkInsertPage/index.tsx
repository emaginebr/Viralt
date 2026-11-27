import { useContext, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCheck, faEnvelope, faLock, faPercent, faUser } from '@fortawesome/free-solid-svg-icons';
import AuthContext from "../../Contexts/Auth/AuthContext";
import UserContext from "../../Contexts/User/UserContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import NetworkInsertInfo from "../../DTO/Domain/NetworkInsertInfo";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import {
    Button, Card, CardContent, CardHeader, CardTitle, Checkbox, Input, PageContainer, cn,
} from "../../Components/ui";

const STEP_KEYS = [
    'network_insert_step_register_user',
    'network_insert_step_register_network',
    'network_insert_step_payment',
    'network_insert_step_done',
];

interface IStepperProps {
    step: number;
}

const Stepper = ({ step }: IStepperProps) => {
    const { t } = useTranslation();
    return (
        <nav aria-label={t('adminUi.networkInsert.stepsLabel')} className="mb-8">
            <ol className="grid grid-cols-4 gap-2">
                {STEP_KEYS.map((key, index) => {
                    const number = index + 1;
                    // Step 1 is always shown as reached, as in the original progress bar.
                    const reached = number === 1 || step >= number;
                    const isCurrent = step === number;
                    const isDone = step > number;
                    return (
                        <li
                            key={key}
                            aria-current={isCurrent ? "step" : undefined}
                            className={cn(
                                "flex flex-col items-center gap-2 border-t-4 pt-3 text-center text-sm",
                                reached ? "border-primary font-semibold text-foreground" : "border-border text-muted-foreground",
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "inline-flex size-8 items-center justify-center rounded-full border-2 font-semibold tabular-nums",
                                    reached ? "border-primary bg-primary text-primary-foreground" : "border-input bg-surface",
                                )}
                            >
                                {isDone ? <FontAwesomeIcon icon={faCheck} /> : number}
                            </span>
                            <span className="hidden md:block">{t(key)}</span>
                            <span className="sr-only">
                                {t('adminUi.networkInsert.stepOf', { step: number, total: STEP_KEYS.length })}
                                {isDone ? ` (${t('adminUi.networkInsert.stepDone')})` : ""}
                                {isCurrent ? ` (${t('adminUi.networkInsert.stepCurrent')})` : ""}
                                <span className="md:hidden">: {t(key)}</span>
                            </span>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

const NetworkInsertPage = () => {

    const { t } = useTranslation();

    const authContext = useContext(AuthContext);
    const userContext = useContext(UserContext);
    const networkContext = useContext(NetworkContext);

    const [step, setStep] = useState<number>(1);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [networkName, setNetworkName] = useState<string>("");
    const [networkEmail, setNetworkEmail] = useState<string>(authContext.sessionInfo?.email);
    const [networkCommission, setNetworkCommission] = useState<number>(0);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

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
        if (authContext.sessionInfo) {
            if (authContext.sessionInfo?.userId > 0) {
                /*
                userContext.getMe().then((ret) => {
                    if (ret.sucesso) {
                        setStep(2);
                    }
                    else {
                        setStep(1);
                    }
                });
                */
                setStep(2);
            }
            else {
                setStep(1);
            }
        }
        else {
            setStep(1);
        }
    }, []);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) {
            throwError(t('login_error_email_empty'));
            return;
        }
        if (!password) {
            throwError(t('login_error_password_empty'));
            return;
        }
        const ret = await authContext.loginWithEmail(email, password);
        if (ret.sucesso) {
            const netRet = await networkContext.listByUser();
            if (netRet.sucesso) {
                setStep(2);
            }
            else {
                throwError(netRet.mensagemErro);
            }
        }
        else {
            throwError(ret.mensagemErro);
        }
    };

    const handleRegisterUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userContext.user?.name) {
            throwError(t('error_name_empty'));
            return;
        }
        if (!userContext.user?.email) {
            throwError(t('error_email_empty'));
            return;
        }
        if (userContext.user?.password != confirmPassword) {
            throwError(t('error_password_confirmation_different'));
            return;
        }
        const ret = await userContext.insert(userContext.user);
        if (ret.sucesso) {
            showSuccessMessage(ret.mensagemSucesso);
            setStep(2);
        }
        else {
            throwError(ret.mensagemErro);
        }
    };

    const handleRegisterNetwork = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let networkInsert: NetworkInsertInfo;
        const ret = await networkContext.insert({
            ...networkInsert,
            name: networkName,
            email: networkEmail,
            comission: networkCommission,
            plan: 1
        });
        if (ret.sucesso) {
            showSuccessMessage(ret.mensagemSucesso);
            setStep(4);
            const retUsers = await networkContext.listByUser();
            if (!retUsers.sucesso) {
                throwError(retUsers.mensagemErro);
            }
        }
        else {
            throwError(ret.mensagemErro);
        }
    };

    const icon = (definition: typeof faUser) => <FontAwesomeIcon icon={definition} fixedWidth />;
    const nextIcon = <FontAwesomeIcon icon={faArrowRight} fixedWidth aria-hidden="true" />;

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            ></MessageToast>
            <PageContainer>
                <h1 className="sr-only">{t('create_your_network')}</h1>
                <Stepper step={step} />

                {step == 1 &&
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card as="section" aria-labelledby="network-insert-login-title">
                            <CardHeader>
                                <CardTitle id="network-insert-login-title">{t('login_title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="flex flex-col gap-4" onSubmit={handleLogin} noValidate>
                                    <Input
                                        type="email"
                                        autoComplete="email"
                                        label={t('login_email_label')}
                                        leftIcon={icon(faUser)}
                                        placeholder={t('login_email_placeholder')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Input
                                        type="password"
                                        autoComplete="current-password"
                                        label={t('login_password_label')}
                                        leftIcon={icon(faLock)}
                                        placeholder={t('login_password_placeholder')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <Checkbox label={t('login_remember_password_label')} />
                                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                        <Button
                                            variant="outline"
                                            leftIcon={<FontAwesomeIcon icon={faEnvelope} fixedWidth aria-hidden="true" />}
                                            onClick={() => navigate("/account/recovery-password")}
                                        >
                                            {t('login_recovery_password_button')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            loading={authContext.loading}
                                            loadingText={t('loading')}
                                            rightIcon={nextIcon}
                                        >
                                            {t('next_button')}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                        <Card as="section" aria-labelledby="network-insert-register-title">
                            <CardHeader>
                                <CardTitle id="network-insert-register-title">{t('network_insert_user_registration_title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="flex flex-col gap-4" onSubmit={handleRegisterUser} noValidate>
                                    <Input
                                        autoComplete="name"
                                        label={t('form_label_name')}
                                        leftIcon={icon(faUser)}
                                        placeholder={t('form_placeholder_your_name')}
                                        value={userContext.user?.name ?? ""}
                                        onChange={(e) => {
                                            userContext.setUser({
                                                ...userContext.user,
                                                name: e.target.value
                                            });
                                        }}
                                    />
                                    <Input
                                        autoComplete="email"
                                        label={t('form_label_email')}
                                        leftIcon={icon(faEnvelope)}
                                        placeholder={t('form_placeholder_your_email')}
                                        value={userContext.user?.email ?? ""}
                                        onChange={(e) => {
                                            userContext.setUser({
                                                ...userContext.user,
                                                email: e.target.value
                                            });
                                        }}
                                    />
                                    <Input
                                        type="password"
                                        autoComplete="new-password"
                                        label={t('form_label_password')}
                                        leftIcon={icon(faLock)}
                                        placeholder={t('form_placeholder_your_password')}
                                        value={userContext.user?.password ?? ""}
                                        onChange={(e) => {
                                            userContext.setUser({
                                                ...userContext.user,
                                                password: e.target.value
                                            });
                                        }}
                                    />
                                    <Input
                                        type="password"
                                        autoComplete="new-password"
                                        label={t('form_label_confirm_password')}
                                        leftIcon={icon(faLock)}
                                        placeholder={t('form_placeholder_confirm_your_password')}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            variant="secondary"
                                            loading={userContext.loadingUpdate}
                                            loadingText={t('loading')}
                                            rightIcon={nextIcon}
                                            className="w-full sm:w-auto"
                                        >
                                            {t('next_button')}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                }

                {step == 2 &&
                    <Card as="section" aria-labelledby="network-insert-network-title">
                        <CardHeader>
                            <CardTitle id="network-insert-network-title">{t('network_insert_network_registration_title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="flex flex-col gap-4" onSubmit={handleRegisterNetwork} noValidate>
                                <p className="text-muted-foreground">{t('network_edit_registration_info')}</p>
                                <Input
                                    label={t('form_label_name')}
                                    leftIcon={icon(faUser)}
                                    placeholder={t('network_edit_name_placeholder')}
                                    value={networkName}
                                    onChange={(e) => setNetworkName(e.target.value)}
                                />
                                <Input
                                    type="email"
                                    autoComplete="email"
                                    label={t('form_label_email')}
                                    leftIcon={icon(faEnvelope)}
                                    placeholder={t('network_insert_network_email_placeholder')}
                                    value={networkEmail ?? ""}
                                    onChange={(e) => setNetworkEmail(e.target.value)}
                                />
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    label={t('network_edit_commission_label')}
                                    rightAddon="%"
                                    placeholder={t('network_edit_commission_placeholder')}
                                    value={Number.isNaN(networkCommission) ? "" : networkCommission}
                                    onChange={(e) => setNetworkCommission(parseFloat(e.target.value))}
                                    wrapperClassName="sm:max-w-xs"
                                />
                                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <Button
                                        variant="outline"
                                        leftIcon={<FontAwesomeIcon icon={faArrowLeft} fixedWidth aria-hidden="true" />}
                                        onClick={() => setStep(2)}
                                    >
                                        {t('back_button')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={networkContext.loadingUpdate}
                                        loadingText={t('loading')}
                                        rightIcon={nextIcon}
                                    >
                                        {t('next_button')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                }

                {step == 4 &&
                    <Card as="section" aria-labelledby="network-insert-done-title">
                        <CardContent className="flex flex-col items-center gap-4 text-center">
                            <span aria-hidden="true" className="inline-flex size-14 items-center justify-center rounded-full bg-success-subtle text-2xl text-success">
                                <FontAwesomeIcon icon={faCheck} />
                            </span>
                            <h2 id="network-insert-done-title" tabIndex={-1} className="font-display text-2xl font-bold lg:text-3xl">
                                {t('network_insert_success_title')}
                            </h2>
                            <p className="max-w-prose text-muted-foreground">{t('network_insert_success_message_1')}</p>
                            <p className="max-w-prose text-muted-foreground">{t('network_insert_success_message_2')}</p>
                            <p className="font-semibold">{t('network_insert_success_lets_start')}</p>
                            <Button
                                size="lg"
                                rightIcon={nextIcon}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate("/admin/dashboard");
                                }}
                            >
                                {t('network_insert_access_my_network_button')}
                            </Button>
                        </CardContent>
                    </Card>
                }
            </PageContainer>
        </>
    );
};

export default NetworkInsertPage;
