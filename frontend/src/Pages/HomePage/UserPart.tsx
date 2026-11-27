import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import UserInfo from "../../DTO/Domain/UserInfo";
import { Avatar, Skeleton, SkeletonGroup, cn, focusRing } from "../../Components/ui";

interface IUserParam {
    loading: boolean,
    users: UserInfo[]
}

const SKELETON_ITEMS = [1, 2, 3, 4];

const UserPart = (param: IUserParam) => {

    const { t } = useTranslation();

    const hasUsers = Boolean(param.users?.length);
    // Without data the section would be an empty title: render only while loading or with items.
    if (!param.loading && !hasUsers) {
        return null;
    }

    return (
        <section aria-labelledby="home-users-title" className="border-t border-border bg-muted">
            <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 id="home-users-title" className="font-display text-3xl font-extrabold lg:text-4xl">
                    {t('home_userpart_title')}
                </h2>
                {param.loading ?
                    <SkeletonGroup label={t('loading')} className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
                        {SKELETON_ITEMS.map((index) => (
                            <div key={index} className="flex flex-col items-center gap-3">
                                <Skeleton className="size-24 rounded-full" />
                                <Skeleton className="h-5 w-2/3" />
                            </div>
                        ))}
                    </SkeletonGroup>
                    :
                    <ul className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
                        {param.users?.map((user) => (
                            <li key={user.userId ?? user.slug}>
                                <Link
                                    to={"/@/" + user.slug}
                                    className={cn(
                                        "group flex min-h-11 flex-col items-center gap-3 rounded-lg p-3 text-center hover:bg-surface",
                                        focusRing,
                                    )}
                                >
                                    <Avatar name={user.name} src={user.imageUrl} size="lg" />
                                    <span className="font-semibold underline-offset-2 group-hover:underline">{user.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                }
            </div>
        </section>
    );
};

export default UserPart;
