import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';

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

function truncateName(name: string, max: number = 20): string {
  if (name.length <= max) return name;
  return name.substring(0, max) + '...';
}

export default function LeaderboardTable({ entries, currentUserPosition }: LeaderboardTableProps) {
  if (!entries || entries.length === 0) {
    return <p className="text-center text-muted">No participants yet.</p>;
  }

  return (
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th style={{ width: '60px' }}>#</th>
          <th>Name</th>
          <th style={{ width: '100px' }} className="text-end">Entries</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr
            key={entry.clientId}
            className={currentUserPosition === entry.position ? 'table-primary' : ''}
          >
            <td>
              {entry.position <= 3 ? (
                <Badge bg={entry.position === 1 ? 'warning' : entry.position === 2 ? 'secondary' : 'dark'}>
                  {entry.position}
                </Badge>
              ) : (
                entry.position
              )}
            </td>
            <td>{truncateName(entry.name)}</td>
            <td className="text-end">{entry.totalEntries}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
