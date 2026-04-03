import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { publicService } from '../../Services/publicService';
import type { CampaignInfo } from '../../types/campaign';
import type { PrizeInfo } from '../../types/prize';
import type {
  LeaderboardEntry, ClientEntry, RegisterData,
} from '../../Services/publicService';
import type { EntryMethodData } from '../../Components/EntryMethodCard';
import EntryMethodCard from '../../Components/EntryMethodCard';
import PrizeCard from '../../Components/PrizeCard';
import CountdownTimer from '../../Components/CountdownTimer';
import LeaderboardTable from '../../Components/LeaderboardTable';

/** Extract YouTube embed URL from various YouTube URL formats */
function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function PublicCampaignPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const refToken = searchParams.get('ref');

  // Campaign state
  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [prizes, setPrizes] = useState<PrizeInfo[]>([]);
  const [entryMethods, setEntryMethods] = useState<EntryMethodData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration state
  const [registered, setRegistered] = useState(false);
  const [myToken, setMyToken] = useState<string | null>(null);
  const [myEntries, setMyEntries] = useState<ClientEntry[]>([]);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load campaign data on mount
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        setLoading(true);
        const campaignData = await publicService.getCampaign(slug);
        setCampaign(campaignData);

        // Load leaderboard
        try {
          const lb = await publicService.getLeaderboard(slug, 10);
          setLeaderboard(lb);
        } catch { /* leaderboard optional */ }

        // Track view
        if (campaignData) {
          publicService.trackView({
            campaignId: campaignData.campaignId,
            ipAddress: null,
            userAgent: navigator.userAgent,
          }).catch(() => { /* non-critical */ });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load campaign');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Handle registration
  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    setFormError(null);
    if (campaign.nameRequired && !formName.trim()) {
      setFormError('Name is required');
      return;
    }
    if (campaign.emailRequired && !formEmail.trim()) {
      setFormError('Email is required');
      return;
    }

    try {
      setSubmitting(true);
      const data: RegisterData = {
        campaignId: campaign.campaignId,
        name: formName,
        email: formEmail,
        phone: formPhone,
        birthday: null,
        referralToken: refToken,
      };
      const result = await publicService.register(data);
      if (result.sucesso && result.client) {
        setMyToken(result.client.token);
        setRegistered(true);
        // Load participant entries
        try {
          const entries = await publicService.getMyEntries(result.client.token);
          setMyEntries(entries);
        } catch { /* ok */ }
      } else {
        setFormError(result.mensagem || 'Registration failed');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }, [campaign, formName, formEmail, formPhone, refToken]);

  // Handle entry completion
  const handleCompleteEntry = useCallback(async (entryMethodId: number) => {
    if (!myToken) return;
    try {
      const result = await publicService.completeEntry({
        clientToken: myToken,
        entryMethodId,
        value: null,
      });
      if (result.sucesso && result.clientEntry) {
        setMyEntries((prev) => [...prev, result.clientEntry as ClientEntry]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete entry');
    }
  }, [myToken]);

  // Determine completed entry method IDs
  const completedEntryMethodIds = new Set(myEntries.map((e) => e.entryMethodId));

  // Theme styles from campaign
  const themeStyle: React.CSSProperties = campaign ? {
    ...(campaign.themePrimaryColor ? { '--bs-primary': campaign.themePrimaryColor } as React.CSSProperties : {}),
  } : {};

  // Loading state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // Error state
  if (error && !campaign) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Campaign not found
  if (!campaign) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Campaign not found.</Alert>
      </Container>
    );
  }

  const youtubeEmbed = campaign.youtubeUrl ? getYoutubeEmbedUrl(campaign.youtubeUrl) : null;

  return (
    <Container className="py-4" style={themeStyle}>
      {/* Campaign Header */}
      <Row className="mb-4">
        <Col className="text-center">
          {campaign.logoImage && (
            <img
              src={campaign.logoImage}
              alt={campaign.title}
              style={{ maxHeight: '80px', objectFit: 'contain' }}
              className="mb-3"
            />
          )}
          <h1>{campaign.title}</h1>
          {campaign.description && <p className="lead">{campaign.description}</p>}
        </Col>
      </Row>

      {/* Featured Image or YouTube Embed */}
      {(campaign.topImage || youtubeEmbed) && (
        <Row className="mb-4">
          <Col md={{ span: 8, offset: 2 }}>
            {youtubeEmbed ? (
              <div className="ratio ratio-16x9">
                <iframe
                  src={youtubeEmbed}
                  title="Campaign video"
                  allowFullScreen
                />
              </div>
            ) : campaign.topImage ? (
              <img
                src={campaign.topImage}
                alt={campaign.title}
                className="img-fluid rounded w-100"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            ) : null}
          </Col>
        </Row>
      )}

      {/* Countdown Timer */}
      {campaign.endTime && (
        <Row className="mb-4">
          <Col md={{ span: 6, offset: 3 }}>
            <Card>
              <Card.Body>
                <h5 className="text-center mb-3">Time Remaining</h5>
                <CountdownTimer endDate={campaign.endTime} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Prizes Section */}
      {prizes.length > 0 && (
        <Row className="mb-4">
          <Col>
            <h3 className="mb-3">Prizes</h3>
            <Row>
              {prizes.map((prize) => (
                <Col md={4} key={prize.prizeId}>
                  <PrizeCard prize={prize} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}

      {/* Registration Form or Entry Methods */}
      <Row className="mb-4">
        <Col md={{ span: 8, offset: 2 }}>
          {!registered ? (
            <Card>
              <Card.Header>
                <h4 className="mb-0">Join this Campaign</h4>
              </Card.Header>
              <Card.Body>
                {formError && <Alert variant="danger">{formError}</Alert>}
                <Form onSubmit={handleRegister}>
                  {campaign.nameRequired && (
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                      />
                    </Form.Group>
                  )}
                  {campaign.emailRequired && (
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                  )}
                  {campaign.phoneRequired && (
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="Enter your phone"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        required
                      />
                    </Form.Group>
                  )}
                  {/* Show name/email fields even if not required, for convenience */}
                  {!campaign.nameRequired && (
                    <Form.Group className="mb-3">
                      <Form.Label>Name <small className="text-muted">(optional)</small></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </Form.Group>
                  )}
                  {!campaign.emailRequired && (
                    <Form.Group className="mb-3">
                      <Form.Label>Email <small className="text-muted">(optional)</small></Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                      />
                    </Form.Group>
                  )}
                  {campaign.termsUrl && (
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label={
                          <span>
                            I agree to the{' '}
                            <a href={campaign.termsUrl} target="_blank" rel="noopener noreferrer">
                              terms and conditions
                            </a>
                          </span>
                        }
                        required
                      />
                    </Form.Group>
                  )}
                  <div className="d-grid">
                    <Button variant="primary" size="lg" type="submit" disabled={submitting}>
                      {submitting ? 'Registering...' : 'Join Now'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Header>
                <h4 className="mb-0">Earn Entries</h4>
              </Card.Header>
              <Card.Body>
                <Alert variant="success">
                  You are registered! Complete actions below to earn entries.
                </Alert>
                {entryMethods.length === 0 ? (
                  <p className="text-muted text-center">No entry methods available yet.</p>
                ) : (
                  entryMethods.map((entry) => (
                    <EntryMethodCard
                      key={entry.entryMethodId}
                      entry={entry}
                      onComplete={handleCompleteEntry}
                      completed={completedEntryMethodIds.has(entry.entryMethodId)}
                    />
                  ))
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Refer a Friend */}
      {registered && myToken && campaign.slug && (
        <Row className="mb-4">
          <Col md={{ span: 8, offset: 2 }}>
            <Card>
              <Card.Header>
                <h4 className="mb-0">Refer a Friend</h4>
              </Card.Header>
              <Card.Body>
                <p className="mb-2">Share your unique referral link to earn bonus entries:</p>
                {(() => {
                  const referralLink = `${window.location.origin}/c/${campaign.slug}?ref=${myToken}`;
                  return (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Control type="text" readOnly value={referralLink} />
                      </Form.Group>
                      <div className="d-flex gap-2 flex-wrap">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => { navigator.clipboard.writeText(referralLink); }}
                        >
                          Copy Link
                        </Button>
                        <a
                          className="btn btn-outline-secondary btn-sm"
                          href={`mailto:?subject=${encodeURIComponent(campaign.title)}&body=${encodeURIComponent(`Join this campaign: ${referralLink}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Email
                        </a>
                        <a
                          className="btn btn-outline-success btn-sm"
                          href={`https://wa.me/?text=${encodeURIComponent(`Join this campaign: ${referralLink}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </>
                  );
                })()}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Row className="mb-4">
          <Col md={{ span: 8, offset: 2 }}>
            <Card>
              <Card.Header>
                <h4 className="mb-0">Leaderboard</h4>
              </Card.Header>
              <Card.Body>
                <LeaderboardTable entries={leaderboard} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Error display */}
      {error && (
        <Row>
          <Col md={{ span: 8, offset: 2 }}>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
}
