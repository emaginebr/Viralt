import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import { PrizeInfo } from '../../types/prize';

interface PrizeCardProps {
  prize: PrizeInfo;
}

export default function PrizeCard({ prize }: PrizeCardProps) {
  return (
    <Card className="mb-3 h-100">
      {prize.image && (
        <Card.Img
          variant="top"
          src={prize.image}
          alt={prize.title}
          style={{ objectFit: 'cover', maxHeight: '200px' }}
        />
      )}
      <Card.Body>
        <Card.Title>{prize.title}</Card.Title>
        {prize.description && <Card.Text>{prize.description}</Card.Text>}
        <div className="d-flex justify-content-between align-items-center">
          <Badge bg="secondary">Qty: {prize.quantity}</Badge>
          {prize.minEntriesRequired != null && prize.minEntriesRequired > 0 && (
            <small className="text-muted">Min {prize.minEntriesRequired} entries</small>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
