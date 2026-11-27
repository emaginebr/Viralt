import { useContext } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import UserContext from "../../Contexts/User/UserContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import Footer from "../../Components/Footer";
import { Button } from "../../Components/ui";
import Hero from "./Hero";
import Features, { HowItWorks } from "./Features";
import Pricing from "./Pricing";
import NetworkPart from "./NetworkPart";
import UserPart from "./UserPart";

/** Final CTA band (docs/design/components.md §29). */
const FinalCta = () => {
    const { t } = useTranslation();
    return (
        <section aria-labelledby="cta-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start gap-6 rounded-xl bg-secondary p-8 text-secondary-foreground md:flex-row md:items-center md:justify-between lg:p-12">
                <div>
                    <h2 id="cta-title" className="font-display text-3xl font-extrabold">{t('homeLanding.cta.title')}</h2>
                    <p className="mt-2 text-secondary-muted-foreground">{t('homeLanding.cta.subtitle')}</p>
                </div>
                <Button
                    asChild
                    variant="accent"
                    size="lg"
                    pop
                    className="shrink-0 focus-visible:outline-ring-inverse!"
                    rightIcon={<FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />}
                >
                    <Link to="/campaigns/new">{t('homeLanding.hero.ctaPrimary')}</Link>
                </Button>
            </div>
        </section>
    );
};

const HomePage = () => {

    const userContext = useContext(UserContext);
    const networkContext = useContext(NetworkContext);

    /*
    useEffect(() => {
        userContext.list(3).then((ret) => {
            if (!ret.sucesso) {
                alert(ret.mensagemErro);
            }
        });
        networkContext.listAll().then((ret) => {
            if (!ret.sucesso) {
                alert(ret.mensagemErro);
            }
        });
    }, []);
    */

    return (
        <>
            <Hero />
            <HowItWorks />
            <Features />
            <NetworkPart
                loading={networkContext.loading}
                networks={networkContext.networks}
            />
            <Pricing />
            <UserPart
                loading={userContext.loadingList}
                users={userContext.users}
            />
            <FinalCta />
            <Footer />
        </>
    );
};

export default HomePage;
