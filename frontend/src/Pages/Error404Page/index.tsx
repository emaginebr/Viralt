import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTicket } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../Components/ui";

const Error404Page = () => {

    const { t } = useTranslation();

    return (
        <main id="main" className="grid min-h-dvh place-items-center px-4 py-10">
            <section
                aria-labelledby="error404-title"
                className="ticket flex w-full max-w-md flex-col items-center gap-4 rounded-xl border-2 border-foreground bg-surface p-8 text-center shadow-pop"
            >
                <span
                    aria-hidden="true"
                    className="grid size-14 place-items-center rounded-full border-2 border-foreground bg-accent text-2xl text-accent-foreground shadow-pop-sm"
                >
                    <FontAwesomeIcon icon={faTicket} />
                </span>
                <h1 id="error404-title" className="font-display text-5xl font-extrabold tabular-nums">
                    404
                </h1>
                <p className="text-lg text-muted-foreground">{t('error404_message')}</p>
                <div className="perforation w-full" />
                <Button asChild variant="primary" leftIcon={<FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />}>
                    <Link to="/">{t('error404_back_to_home')}</Link>
                </Button>
            </section>
        </main>
    );
};

export default Error404Page;
