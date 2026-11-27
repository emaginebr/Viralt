import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Button, Card, CardContent, Input, PageContainer } from "../../Components/ui";

const RecoveryPage = () => {

    const { t } = useTranslation();

    return (
        <PageContainer variant="narrow">
            <Card as="section" aria-labelledby="recovery-title">
                <CardContent className="flex flex-col gap-6">
                    <div className="text-center">
                        <h1 id="recovery-title" tabIndex={-1} className="font-display text-2xl font-bold focus:outline-none">
                            {t('recoveryPage.title')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">{t('recoveryPage.instruction')}</p>
                    </div>
                    <form noValidate onSubmit={(e) => e.preventDefault()} aria-labelledby="recovery-title" className="flex flex-col gap-4">
                        <Input
                            id="recovery-email"
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            label={t('recoveryPage.emailLabel')}
                            leftIcon={<FontAwesomeIcon icon={faEnvelope} />}
                            placeholder={t('recoveryPage.emailPlaceholder')}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            leftIcon={<FontAwesomeIcon icon={faEnvelope} />}
                        >
                            {t('recoveryPage.sendButton')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default RecoveryPage;
