import { useTranslation } from 'react-i18next';
import { Badge, Table, cn, type TableColumn } from '../ui';

export interface LeaderboardRow {
  clientId: number;
  name: string;
  totalEntries: number;
  position: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardRow[];
  currentUserPosition?: number | null;
}

const truncateName = (name: string, max: number = 20): string => {
  if (name.length <= max) return name;
  return `${name.substring(0, max)}...`;
};

/** Ranking table (docs/design/mockups/public-campaign.html, "Quem mais pontuou"). */
const LeaderboardTable = ({ entries, currentUserPosition }: LeaderboardTableProps) => {
  const { t } = useTranslation();

  if (!entries || entries.length === 0) {
    return <p className="text-center text-muted-foreground">{t('leaderboard.empty')}</p>;
  }

  const columns: TableColumn<LeaderboardRow>[] = [
    {
      key: 'position',
      header: t('leaderboard.position'),
      className: 'w-16',
      accessor: (row) => (
        <span
          className={cn(
            'inline-grid size-7 place-items-center rounded-full font-display text-xs font-bold',
            row.position === 1 ? 'border-2 border-foreground bg-accent text-accent-foreground' : 'bg-muted',
          )}
        >
          {row.position}
        </span>
      ),
    },
    {
      key: 'name',
      header: t('leaderboard.name'),
      rowHeader: true,
      accessor: (row) => (
        <span className="inline-flex flex-wrap items-center gap-2">
          {truncateName(row.name)}
          {currentUserPosition === row.position && <Badge variant="primary">{t('leaderboard.you')}</Badge>}
        </span>
      ),
    },
    {
      key: 'totalEntries',
      header: t('leaderboard.entries'),
      numeric: true,
      className: 'font-semibold',
    },
  ];

  return (
    <Table
      columns={columns}
      rows={entries}
      rowKey={(row) => row.clientId}
      caption={t('leaderboard.caption', { count: entries.length })}
    />
  );
};

export default LeaderboardTable;
