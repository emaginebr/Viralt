import { useContext, useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faLevelUp, faSave, faUser } from '@fortawesome/free-solid-svg-icons';
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import ProfileContext from "../../Contexts/Profile/ProfileContext";
import UserProfileInfo from "../../DTO/Domain/UserProfileInfo";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import { Breadcrumb } from "../../Components/Breadcrumb";
import { Button, Card, CardContent, Input, PageContainer, PageHeader } from "../../Components/ui";

const ProfileEditPage = () => {

    const { t } = useTranslation();
    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const profileContext = useContext(ProfileContext);

    const { profileId } = useParams();

    const [insertMode, setInsertMode] = useState<boolean>(false);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const navigate = useNavigate();

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
        let profile: UserProfileInfo = null;
        profile = {
            ...profile,
            networkId: networkContext.userNetwork?.networkId,
            name: "",
            level: 0,
            commission: 0
        }
        if (authContext.sessionInfo) {
            const profileIdNum: number = parseInt(profileId);
            if (profileIdNum > 0) {
                profileContext.getById(profileIdNum).then((ret) => {
                    if (ret.sucesso) {
                        setInsertMode(false);
                    }
                    else {
                        setInsertMode(true);
                        profileContext.setProfile(profile);
                    }
                });
            }
            else {
                setInsertMode(true);
                profileContext.setProfile(profile);
            }
        }
        else {
            setInsertMode(true);
            profileContext.setProfile(profile);
        }
    }, []);

    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (insertMode) {
            const ret = await profileContext.insert(profileContext.profile);
            if (ret.sucesso) {
                showSuccessMessage(ret.mensagemSucesso);
            }
            else {
                throwError(ret.mensagemErro);
            }
        }
        else {
            const ret = await profileContext.update(profileContext.profile);
            if (ret.sucesso) {
                showSuccessMessage(ret.mensagemSucesso);
            }
            else {
                throwError(ret.mensagemErro);
            }
        }
    };

    const numberValue = (value: number | undefined) =>
        value === undefined || value === null || Number.isNaN(value) ? "" : value;

    const title = insertMode ? t('newTeamStructure') : t('editTeamStructure');

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
                        { label: t('myNetwork'), to: "/admin/dashboard" },
                        { label: t('networkTeamStructure'), to: "/admin/team-structure" },
                        { label: title },
                    ]} />}
                    title={title}
                />
                <Card>
                    <CardContent>
                        <form className="flex flex-col gap-4" onSubmit={handleSave} noValidate>
                            <p className="text-muted-foreground">{t('profileEditPage.registrationNotRequired')}</p>
                            <Input
                                label={t('name')}
                                leftIcon={<FontAwesomeIcon icon={faUser} fixedWidth />}
                                placeholder={t('yourProfileName')}
                                value={profileContext.profile?.name ?? ""}
                                onChange={(e) => {
                                    profileContext.setProfile({
                                        ...profileContext.profile,
                                        name: e.target.value
                                    });
                                }}
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    label={t('commission')}
                                    rightAddon="%"
                                    placeholder={t('commissionInPercents')}
                                    value={numberValue(profileContext.profile?.commission)}
                                    onChange={(e) => {
                                        profileContext.setProfile({
                                            ...profileContext.profile,
                                            commission: parseFloat(e.target.value)
                                        });
                                    }}
                                />
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    label={t('level')}
                                    leftIcon={<FontAwesomeIcon icon={faLevelUp} fixedWidth />}
                                    placeholder={t('networkLevelNumber')}
                                    value={numberValue(profileContext.profile?.level)}
                                    onChange={(e) => {
                                        profileContext.setProfile({
                                            ...profileContext.profile,
                                            level: parseInt(e.target.value)
                                        });
                                    }}
                                />
                            </div>
                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                                <Button
                                    variant="outline"
                                    leftIcon={<FontAwesomeIcon icon={faArrowLeft} fixedWidth aria-hidden="true" />}
                                    onClick={() => navigate("/admin/team-structure")}
                                >
                                    {t('back')}
                                </Button>
                                <Button
                                    type="submit"
                                    loading={profileContext.loadingUpdate}
                                    loadingText={t('loading')}
                                    leftIcon={<FontAwesomeIcon icon={faSave} fixedWidth aria-hidden="true" />}
                                >
                                    {t('save')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </PageContainer>
        </>
    );
};

export default ProfileEditPage;
