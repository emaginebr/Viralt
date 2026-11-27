import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faUsers, faTrophy, faEye, faCode, faCalendar,
  faChartBar, faClipboard,
} from '@fortawesome/free-solid-svg-icons';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCampaign } from '../../hooks/useCampaign';
import type { CampaignInfo } from '../../types/campaign';

const ENTRY_TYPE_LABELS: Record<number, string> = {
  0: 'Sorteio',
  1: 'Leaderboard',
  2: 'Contest',
  3: 'Cupom',
};

const STATUS_LABELS: Record<number, { label: string; variant: string }> = {
  0: { label: 'Draft', variant: 'secondary' },
  1: { label: 'Active', variant: 'success' },
  2: { label: 'Paused', variant: 'warning' },
  3: { label: 'Ended', variant: 'dark' },
};

export default function CampaignDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaignIdNum = parseInt(campaignId || '0', 10);

  const { getCampaignById } = useCampaign();

  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [embedCopied, setEmbedCopied] = useState(false);

  useEffect(() => {
    if (campaignIdNum > 0) {
      setLoading(true);
      getCampaignById(campaignIdNum)
        .then((result) => {
          if (result.sucesso && result.campaign) {
            setCampaign(result.campaign);
          } else {
            setError(result.mensagem || 'Campaign not found');
          }
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load campaign'))
        .finally(() => setLoading(false));
    }
  }, [campaignIdNum, getCampaignById]);

  const getEmbedCode = () => {
    if (!campaign?.slug) return '';
    const baseUrl = window.location.origin;
    return `<iframe src="${baseUrl}/c/${campaign.slug}" width="100%" height="600" frameborder="0"></iframe>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode()).then(() => {
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <section style={{ paddingTop: '160px' }}>
        <Container className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2">Loading campaign...</p>
        </Container>
      </section>
    );
  }

  if (error || !campaign) {
    return (
      <section style={{ paddingTop: '160px' }}>
        <Container>
          <Alert variant="danger">{error || 'Campaign not found'}</Alert>
          <Link to="/admin/campaigns">Back to Campaigns</Link>
        </Container>
      </section>
    );
  }

  const statusInfo = STATUS_LABELS[campaign.status] || { label: 'Unknown', variant: 'secondary' };

  return (
    <section style={{ paddingTop: '160px', paddingBottom: '40px', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-color), transparent 95%) 50%, color-mix(in srgb, var(--accent-color), transparent 98%) 25%, transparent 50%)' }}>
      <Container>
        <Row className="mb-3">
          <Col>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/admin/campaigns">Campaigns</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{campaign.title}</li>
              </ol>
            </nav>
          </Col>
        </Row>

        {/* Campaign Info Card */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h4 className="mb-1">{campaign.title}</h4>
                    <p className="text-muted mb-2">{campaign.description}</p>
                    <div className="mb-2">
                      <Badge bg={statusInfo.variant} className="me-2">{statusInfo.label}</Badge>
                      {campaign.slug && <Badge bg="info" className="me-2">/{campaign.slug}</Badge>}
                      <Badge bg="outline-secondary" text="dark" className="border">
                        {ENTRY_TYPE_LABELS[campaign.entryType ?? 0] || 'Unknown'}
                      </Badge>
                    </div>
                    <small className="text-muted">
                      <FontAwesomeIcon icon={faCalendar} fixedWidth className="me-1" />
                      {campaign.startTime ? new Date(campaign.startTime).toLocaleDateString() : 'No start date'}
                      {' - '}
                      {campaign.endTime ? new Date(campaign.endTime).toLocaleDateString() : 'No end date'}
                    </small>
                  </div>
                  <div>
                    <Button variant="primary" size="sm" className="me-2" onClick={() => navigate(`/admin/campaigns/${campaignIdNum}/edit`)}>
                      <FontAwesomeIcon icon={faEdit} fixedWidth className="me-1" />Edit
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Stats Row */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary mb-2" />
                <h3 className="mb-0">{campaign.totalParticipants}</h3>
                <small className="text-muted">Participants</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <FontAwesomeIcon icon={faChartBar} size="2x" className="text-success mb-2" />
                <h3 className="mb-0">{campaign.totalEntries}</h3>
                <small className="text-muted">Total Entries</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <FontAwesomeIcon icon={faEye} size="2x" className="text-info mb-2" />
                <h3 className="mb-0">{campaign.viewCount}</h3>
                <small className="text-muted">Views</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Navigation Links */}
        <Row className="mb-4">
          <Col md={4}>
            <Card>
              <Card.Body className="text-center">
                <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary mb-3" />
                <h6>Manage Participants</h6>
                <p className="text-muted small">View, search, and manage campaign participants</p>
                <Link to={`/admin/campaigns/${campaignIdNum}/participants`}>
                  <Button variant="outline-primary" size="sm">View Participants</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Body className="text-center">
                <FontAwesomeIcon icon={faTrophy} size="2x" className="text-warning mb-3" />
                <h6>Select Winners</h6>
                <p className="text-muted small">Run the winner selection for this campaign</p>
                <Link to={`/admin/campaigns/${campaignIdNum}/winners`}>
                  <Button variant="outline-warning" size="sm">Select Winners</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Body className="text-center">
                <FontAwesomeIcon icon={faEdit} size="2x" className="text-success mb-3" />
                <h6>Edit Campaign</h6>
                <p className="text-muted small">Modify campaign settings and configuration</p>
                <Link to={`/admin/campaigns/${campaignIdNum}/edit`}>
                  <Button variant="outline-success" size="sm">Edit Campaign</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Embed Code Section */}
        {campaign.slug && (
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <h6><FontAwesomeIcon icon={faCode} fixedWidth className="me-2" />Embed Code</h6>
                  <p className="text-muted small">Copy the code below to embed this campaign on your website.</p>
                  <div className="bg-light p-3 rounded position-relative">
                    <code style={{ fontSize: '0.85rem' }}>{getEmbedCode()}</code>
                    <Button
                      variant={embedCopied ? 'success' : 'outline-secondary'}
                      size="sm"
                      className="position-absolute top-0 end-0 m-2"
                      onClick={copyEmbedCode}
                    >
                      <FontAwesomeIcon icon={faClipboard} fixedWidth className="me-1" />
                      {embedCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </section>
  );
}
