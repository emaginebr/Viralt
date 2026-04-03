import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export interface EntryMethodData {
  entryMethodId: number;
  title: string;
  description: string | null;
  points: number;
  entryType: number;
  icon: string | null;
  url: string | null;
}

interface EntryMethodCardProps {
  entry: EntryMethodData;
  onComplete: (entryMethodId: number) => void;
  completed: boolean;
}

export default function EntryMethodCard({ entry, onComplete, completed }: EntryMethodCardProps) {
  return (
    <Card className="mb-2">
      <Card.Body className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div className="me-3">
            {completed ? (
              <FontAwesomeIcon icon={faCheck} className="text-success" size="lg" />
            ) : (
              <FontAwesomeIcon icon={faArrowRight} className="text-muted" size="lg" />
            )}
          </div>
          <div>
            <h6 className="mb-0">{entry.title}</h6>
            {entry.description && (
              <small className="text-muted">{entry.description}</small>
            )}
          </div>
        </div>
        <div className="d-flex align-items-center">
          <Badge bg="primary" className="me-2">+{entry.points} pts</Badge>
          {completed ? (
            <Button variant="success" size="sm" disabled>
              <FontAwesomeIcon icon={faCheck} /> Done
            </Button>
          ) : (
            <Button variant="outline-primary" size="sm" onClick={() => onComplete(entry.entryMethodId)}>
              Complete
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
