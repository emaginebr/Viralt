import { faBox, faDollar, faUser, type IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { Card } from "../../Components/ui";

interface ICountItem {
    icon: IconDefinition;
    value: number;
    strong: string;
    text: string;
}

const CountPart = () => {

    const { t } = useTranslation();

    // Values are static placeholders, as in the original layout.
    const items: ICountItem[] = [
        { icon: faBox, value: 7, strong: t('dashboard_count_sales'), text: t('dashboard_count_done') },
        { icon: faUser, value: 6, strong: t('dashboard_count_customers'), text: t('dashboard_count_added') },
        { icon: faDollar, value: 15, strong: t('dashboard_count_paid'), text: t('dashboard_count_invoices') },
    ];

    return (
        <ul className="grid gap-4 sm:grid-cols-3">
            {items.map((item) => (
                <li key={item.strong}>
                    <Card className="flex h-full items-center gap-4 p-5">
                        <span
                            aria-hidden="true"
                            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-xl text-foreground"
                        >
                            <FontAwesomeIcon icon={item.icon} fixedWidth />
                        </span>
                        <p className="flex flex-col">
                            <span className="font-display text-3xl font-extrabold tabular-nums">{item.value}</span>
                            <span className="text-sm text-muted-foreground">
                                <b className="font-semibold text-foreground">{item.strong}</b> {item.text}
                            </span>
                        </p>
                    </Card>
                </li>
            ))}
        </ul>
    );
};

export default CountPart;
