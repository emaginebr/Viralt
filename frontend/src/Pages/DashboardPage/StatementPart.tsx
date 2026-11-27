import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollar } from "@fortawesome/free-solid-svg-icons";
import Moment from "react-moment";
import { useTranslation } from "react-i18next";
import StatementListPagedInfo from "../../DTO/Domain/StatementListPagedInfo";
import StatementInfo from "../../DTO/Domain/StatementInfo";
import { Pagination, Table, type TableColumn } from "../../Components/ui";
import { usePaginationLabels } from "../../hooks/usePaginationLabels";

interface IStatementParam {
    loading: boolean;
    StatementResult: StatementListPagedInfo;
    onChangePage: (pageNum: number) => void;
}

const StatementPart = (param: IStatementParam) => {

    const { t } = useTranslation();
    const paginationLabels = usePaginationLabels(t('pagination.statementNav'));

    const pageNum = param.StatementResult?.pageNum ?? 1;
    const pageCount = param.StatementResult?.pageCount ?? 0;

    const columns: TableColumn<StatementInfo>[] = [
        {
            key: "type",
            header: <span className="sr-only">{t('adminUi.statementType')}</span>,
            accessor: () => (
                <span className="inline-flex items-center gap-1.5 text-success">
                    <FontAwesomeIcon icon={faDollar} fixedWidth aria-hidden="true" />
                    <span className="sr-only">{t('adminUi.statementCredit')}</span>
                </span>
            ),
        },
        {
            key: "paymentDate",
            header: t('statement_pay_date'),
            accessor: (statement) => <Moment format="DD/MM/YYYY">{statement.paymentDate}</Moment>,
        },
        { key: "networkName", header: t('statement_network') },
        { key: "description", header: t('statement_product') },
        { key: "buyerName", header: t('statement_buyer') },
        { key: "sellerName", header: t('statement_seller') },
        {
            key: "amount",
            header: t('statement_amount'),
            numeric: true,
            accessor: (statement) => <>R$ {statement.amount}</>,
        },
        { key: "paidAt", header: t('statement_paid_at') },
    ];

    return (
        <div className="flex flex-col gap-4">
            <Table
                columns={columns}
                rows={param.StatementResult?.statements ?? []}
                rowKey={(statement, index) => `${statement.invoiceId}-${statement.feeId}-${index}`}
                caption={pageCount > 0
                    ? t('adminUi.tableCaptionPaged', { title: t('dashboard_statement'), page: pageNum, total: pageCount })
                    : t('dashboard_statement')}
                loading={param.loading}
                empty={t('statement_no_statement_found')}
            />
            {!param.loading && param.StatementResult && pageCount > 0 &&
                <Pagination
                    page={pageNum}
                    totalPages={pageCount}
                    onChange={(page: number) => param.onChangePage(page)}
                    labels={paginationLabels}
                />
            }
        </div>
    );
};

export default StatementPart;
