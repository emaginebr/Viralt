import { useTranslation } from "react-i18next";
import { PageContainer } from "./ui/PageContainer";
import { Skeleton, SkeletonCard, SkeletonGroup, SkeletonText, SkeletonTitle } from "./ui/Skeleton";

/** Full-page loading placeholder: decorative blocks + one sr-only status (docs/design/components.md §17). */
const SkeletonPage = () => {
    const { t } = useTranslation();

    return (
        <PageContainer>
            <SkeletonGroup label={t('shared.loading')} className="flex flex-col gap-10">
                <SkeletonTitle className="h-9" />
                <div className="grid gap-8 md:grid-cols-[1fr_16rem]">
                    <div className="flex flex-col gap-6">
                        <Skeleton className="h-6 w-1/2" />
                        <SkeletonText lines={3} />
                        <SkeletonText lines={5} />
                    </div>
                    <div className="flex flex-col gap-4">
                        <SkeletonCard className="aspect-square h-auto" />
                        <SkeletonText lines={3} />
                    </div>
                </div>
                <div className="grid gap-8 md:grid-cols-[16rem_1fr]">
                    <div className="flex flex-col gap-4">
                        <SkeletonText lines={2} />
                        <SkeletonCard className="aspect-square h-auto" />
                    </div>
                    <div className="flex flex-col gap-6">
                        <Skeleton className="h-6 w-1/2" />
                        <SkeletonText lines={4} />
                        <SkeletonText lines={3} />
                    </div>
                </div>
            </SkeletonGroup>
        </PageContainer>
    );
};

export default SkeletonPage;
