import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NetworkInfo from "../../DTO/Domain/NetworkInfo";
import { Card, Skeleton, SkeletonGroup, SkeletonText, cn, focusRing } from "../../Components/ui";

interface INetworkParam {
    loading: boolean,
    networks: NetworkInfo[]
}

const SKELETON_ITEMS = [1, 2, 3, 4];

const NetworkPart = (param: INetworkParam) => {

    const { t } = useTranslation();

    const hasNetworks = Boolean(param.networks?.length);
    // Without data the section would be an empty title: render only while loading or with items.
    if (!param.loading && !hasNetworks) {
        return null;
    }

    return (
        <section aria-labelledby="home-networks-title" className="border-t border-border bg-muted">
            <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 id="home-networks-title" className="font-display text-3xl font-extrabold lg:text-4xl">
                    {t('home_networkpart_title')}
                </h2>
                {param.loading ?
                    <SkeletonGroup label={t('home_networkpart_loading')} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {SKELETON_ITEMS.map((index) => (
                            <Card key={index} className="overflow-hidden">
                                <Skeleton className="h-28 rounded-none" />
                                <div className="flex flex-col gap-3 p-5">
                                    <Skeleton className="h-6 w-2/3" />
                                    <SkeletonText lines={2} />
                                </div>
                            </Card>
                        ))}
                    </SkeletonGroup>
                    :
                    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {param.networks?.map((network) => (
                            <li key={network.networkId ?? network.slug}>
                                <Card variant="interactive" as="article" className="h-full overflow-hidden">
                                    {network.imageUrl ?
                                        <img
                                            src={network.imageUrl}
                                            alt=""
                                            width={320}
                                            height={112}
                                            loading="lazy"
                                            className="h-28 w-full object-cover"
                                        />
                                        :
                                        <div aria-hidden="true" className="h-28 bg-secondary" />
                                    }
                                    <div className="flex flex-col gap-2 p-5">
                                        <h3 className="font-sans text-lg font-bold">
                                            <Link
                                                to={"/" + network.slug}
                                                className={cn(
                                                    "rounded-sm underline-offset-2 hover:underline after:absolute after:inset-0",
                                                    focusRing,
                                                )}
                                            >
                                                {network.name}
                                            </Link>
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {t('home_networkpart_affiliate_sellers', { count: network.qtdyUsers })}{" "}
                                            {t('home_networkpart_open_positions', { count: (network.maxUsers - network.qtdyUsers) })}
                                        </p>
                                    </div>
                                </Card>
                            </li>
                        ))}
                    </ul>
                }
            </div>
        </section>
    );
};

export default NetworkPart;
