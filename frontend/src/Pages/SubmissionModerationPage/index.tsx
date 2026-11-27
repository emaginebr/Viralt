import { useState, useEffect, useMemo, useCallback } from 'react';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faFilter, faPlay } from '@fortawesome/free-solid-svg-icons';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SubmissionInfo } from '../../types/submission';
import { SubmissionStatus, SubmissionFileType } from '../../types/submission';
import { getApiUrl, getHeaders } from '../../Services/apiHelpers';

const STATUS_OPTIONS = [
  { value: -1, label: 'All Statuses' },
  { value: SubmissionStatus.Pending, label: 'Pending' },
  { value: SubmissionStatus.Approved, label: 'Approved' },
  { value: SubmissionStatus.Rejected, label: 'Rejected' },
];

const STATUS_BADGE: Record<number, { label: string; variant: string }> = {
  [SubmissionStatus.Pending]: { label: 'Pending', variant: 'warning' },
  [SubmissionStatus.Approved]: { label: 'Approved', variant: 'success' },
  [SubmissionStatus.Rejected]: { label: 'Rejected', variant: 'danger' },
};

export default function SubmissionModerationPage() {
  const { t } = useTranslation();
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaignIdNum = parseInt(campaignId || '0', 10);

  const [submissions, setSubmissions] = useState<SubmissionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<number>(-1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const apiBase = `${getApiUrl()}/api/Submission`;

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/listbycampaign/${campaignIdNum}`, {
        headers: getHeaders(true),
      });
      if (!response.ok) throw new Error('Failed to load submissions');
      const data = await response.json();
      if (data.sucesso) {
        setSubmissions(data.submissions || []);
      } else {
        throw new Error(data.mensagem || 'Failed to load submissions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [apiBase, campaignIdNum]);

  useEffect(() => {
    if (campaignIdNum > 0) {
      loadSubmissions();
    }
  }, [campaignIdNum, loadSubmissions]);

  const filteredSubmissions = useMemo(() => {
    if (statusFilter === -1) return submissions;
    return submissions.filter((s) => s.status === statusFilter);
  }, [submissions, statusFilter]);

  const handleModerate = useCallback(async (submissionId: number, newStatus: SubmissionStatus) => {
    setActionLoading(submissionId);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/moderate`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ submissionId, status: newStatus }),
      });
      if (!response.ok) throw new Error('Moderation action failed');
      // Update local state
      setSubmissions((prev) => prev.map((s) =>
        s.submissionId === submissionId ? { ...s, status: newStatus } : s
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }, [apiBase]);

  const getStatusBadge = (status: number) => {
    const info = STATUS_BADGE[status] || { label: 'Unknown', variant: 'secondary' };
    return <Badge bg={info.variant}>{info.label}</Badge>;
  };

  return (
    <section style={{ paddingTop: '160px', paddingBottom: '40px', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-color), transparent 95%) 50%, color-mix(in srgb, var(--accent-color), transparent 98%) 25%, transparent 50%)' }}>
      <Container>
        <Row className="mb-3">
          <Col>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/admin/campaigns">Campaigns</Link></li>
                <li className="breadcrumb-item"><Link to={`/admin/campaigns/${campaignIdNum}`}>Campaign</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Submission Moderation</li>
              </ol>
            </nav>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <h3>Submission Moderation</h3>
          </Col>
          <Col md={6} className="text-end">
            <Form.Select
              style={{ width: 'auto', display: 'inline-block' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(parseInt(e.target.value, 10))}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p>No submissions {statusFilter !== -1 ? 'with this status' : 'yet'}.</p>
          </div>
        ) : (
          <Row>
            {filteredSubmissions.map((submission) => {
              const isVideo = submission.fileType === SubmissionFileType.Video;
              const isPending = submission.status === SubmissionStatus.Pending;
              const isActioning = actionLoading === submission.submissionId;

              return (
                <Col md={4} sm={6} key={submission.submissionId} className="mb-4">
                  <Card className="h-100">
                    <div className="position-relative" style={{ paddingTop: '75%', overflow: 'hidden' }}>
                      {isVideo ? (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark">
                          <video
                            src={submission.fileUrl}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                            controls
                            muted
                            playsInline
                          />
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
                      <div className="position-absolute top-0 end-0 m-2">
                        {getStatusBadge(submission.status)}
                      </div>
                    </div>
                    <Card.Body className="d-flex flex-column">
                      {submission.caption && (
                        <Card.Text>{submission.caption}</Card.Text>
                      )}
                      <div className="text-muted small mb-2">
                        <div>Votes: {submission.voteCount}</div>
                        {submission.judgeScore !== null && <div>Judge Score: {submission.judgeScore}</div>}
                        <div>Submitted: {new Date(submission.submittedAt).toLocaleString()}</div>
                      </div>
                      <div className="mt-auto d-flex gap-2">
                        {submission.status !== SubmissionStatus.Approved && (
                          <Button
                            variant="success"
                            size="sm"
                            disabled={isActioning}
                            onClick={() => handleModerate(submission.submissionId, SubmissionStatus.Approved)}
                          >
                            {isActioning ? <Spinner animation="border" size="sm" /> : (
                              <><FontAwesomeIcon icon={faCheck} fixedWidth className="me-1" />Approve</>
                            )}
                          </Button>
                        )}
                        {submission.status !== SubmissionStatus.Rejected && (
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={isActioning}
                            onClick={() => handleModerate(submission.submissionId, SubmissionStatus.Rejected)}
                          >
                            {isActioning ? <Spinner animation="border" size="sm" /> : (
                              <><FontAwesomeIcon icon={faTimes} fixedWidth className="me-1" />Reject</>
                            )}
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </section>
  );
}
