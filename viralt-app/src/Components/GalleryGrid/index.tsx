import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPlay } from '@fortawesome/free-solid-svg-icons';
import type { SubmissionInfo } from '../../types/submission';
import { SubmissionFileType } from '../../types/submission';

interface GalleryGridProps {
  submissions: SubmissionInfo[];
  onVote: (submissionId: number) => void;
  votedIds: Set<number>;
}

/**
 * GalleryGrid component - Displays contest submissions in a responsive grid.
 * Shows image/video thumbnails, captions, vote counts, and vote buttons.
 */
export default function GalleryGrid({ submissions, onVote, votedIds }: GalleryGridProps) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <p>No submissions yet. Be the first to submit!</p>
      </div>
    );
  }

  return (
    <Row>
      {submissions.map((submission) => {
        const hasVoted = votedIds.has(submission.submissionId);
        const isVideo = submission.fileType === SubmissionFileType.Video;

        return (
          <Col md={4} sm={6} key={submission.submissionId} className="mb-4">
            <Card className="h-100">
              <div className="position-relative" style={{ paddingTop: '75%', overflow: 'hidden' }}>
                {isVideo ? (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark"
                  >
                    <video
                      src={submission.fileUrl}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                      muted
                      playsInline
                    />
                    <div className="position-absolute" style={{ opacity: 0.7 }}>
                      <FontAwesomeIcon icon={faPlay} size="3x" className="text-white" />
                    </div>
                  </div>
                ) : (
                  <Card.Img
                    variant="top"
                    src={submission.fileUrl}
                    alt={submission.caption || 'Submission'}
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>
              <Card.Body className="d-flex flex-column">
                {submission.caption && (
                  <Card.Text className="flex-grow-1">{submission.caption}</Card.Text>
                )}
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <Badge bg="light" text="dark" className="border">
                    <FontAwesomeIcon icon={faHeart} className="text-danger me-1" />
                    {submission.voteCount} vote{submission.voteCount !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant={hasVoted ? 'secondary' : 'outline-danger'}
                    size="sm"
                    disabled={hasVoted}
                    onClick={() => onVote(submission.submissionId)}
                  >
                    <FontAwesomeIcon icon={faHeart} fixedWidth className="me-1" />
                    {hasVoted ? 'Voted' : 'Vote'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
