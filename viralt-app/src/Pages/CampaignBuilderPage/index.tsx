import { useState, useEffect, useCallback } from 'react';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle, faPaintBrush, faTrophy, faCog, faCheckCircle,
  faPlus, faTrash, faArrowLeft, faArrowRight, faSave,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCampaign } from '../../hooks/useCampaign';
import { usePrize } from '../../hooks/usePrize';
import type { CampaignInsertInfo, CampaignUpdateInfo } from '../../types/campaign';
import type { PrizeInsertInfo } from '../../types/prize';

interface PrizeFormItem {
  key: number;
  title: string;
  description: string;
  image: string;
  quantity: number;
  prizeType: number;
  couponCode: string;
  sortOrder: number;
}

const ENTRY_TYPES = [
  { value: 0, label: 'Sorteio' },
  { value: 1, label: 'Leaderboard' },
  { value: 2, label: 'Contest' },
  { value: 3, label: 'Cupom' },
];

const TABS = ['basic', 'appearance', 'prizes', 'settings', 'review'];

let prizeKeyCounter = 0;

export default function CampaignBuilderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { campaignId } = useParams<{ campaignId: string }>();
  const isEditing = !!campaignId;

  const { getCampaignById, insertCampaign, updateCampaign } = useCampaign();
  const { loadPrizesByCampaign, prizes: existingPrizes, insertPrize } = usePrize();

  const [activeTab, setActiveTab] = useState('basic');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timezone, setTimezone] = useState('');
  const [entryType, setEntryType] = useState<number>(0);
  const [winnerCount, setWinnerCount] = useState<number>(1);
  const [password, setPassword] = useState('');

  // Step 2: Appearance
  const [themePrimaryColor, setThemePrimaryColor] = useState('#3b82f6');
  const [themeSecondaryColor, setThemeSecondaryColor] = useState('#10b981');
  const [themeBgColor, setThemeBgColor] = useState('#ffffff');
  const [themeFont, setThemeFont] = useState('');
  const [logoImage, setLogoImage] = useState('');
  const [customCss, setCustomCss] = useState('');

  // Step 3: Prizes
  const [prizeItems, setPrizeItems] = useState<PrizeFormItem[]>([]);

  // Step 4: Settings
  const [termsUrl, setTermsUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [geoCountries, setGeoCountries] = useState('');
  const [blockVpn, setBlockVpn] = useState(false);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [welcomeEmailEnabled, setWelcomeEmailEnabled] = useState(false);
  const [welcomeEmailSubject, setWelcomeEmailSubject] = useState('');
  const [welcomeEmailBody, setWelcomeEmailBody] = useState('');
  const [gaTrackingId, setGaTrackingId] = useState('');
  const [fbPixelId, setFbPixelId] = useState('');
  const [tiktokPixelId, setTiktokPixelId] = useState('');
  const [gtmId, setGtmId] = useState('');

  // Load existing campaign data for editing
  useEffect(() => {
    if (isEditing) {
      const id = parseInt(campaignId!, 10);
      getCampaignById(id).then((result) => {
        if (result.sucesso && result.campaign) {
          const c = result.campaign;
          setTitle(c.title || '');
          setDescription(c.description || '');
          setStartTime(c.startTime || '');
          setEndTime(c.endTime || '');
          setTimezone(c.timezone || '');
          setEntryType(c.entryType ?? 0);
          setWinnerCount(c.winnerCount ?? 1);
          setPassword(c.password || '');
          setThemePrimaryColor(c.themePrimaryColor || '#3b82f6');
          setThemeSecondaryColor(c.themeSecondaryColor || '#10b981');
          setThemeBgColor(c.themeBgColor || '#ffffff');
          setThemeFont(c.themeFont || '');
          setLogoImage(c.logoImage || '');
          setCustomCss(c.customCss || '');
          setTermsUrl(c.termsUrl || '');
          setRedirectUrl(c.redirectUrl || '');
          setGeoCountries(c.geoCountries || '');
          setBlockVpn(c.blockVpn);
          setRequireEmailVerification(c.requireEmailVerification);
          setWelcomeEmailEnabled(c.welcomeEmailEnabled);
          setWelcomeEmailSubject(c.welcomeEmailSubject || '');
          setWelcomeEmailBody(c.welcomeEmailBody || '');
          setGaTrackingId(c.gaTrackingId || '');
          setFbPixelId(c.fbPixelId || '');
          setTiktokPixelId(c.tiktokPixelId || '');
          setGtmId(c.gtmId || '');
        }
      }).catch(() => setError('Failed to load campaign'));

      loadPrizesByCampaign(id).catch(() => { /* ignore */ });
    }
  }, [campaignId, isEditing, getCampaignById, loadPrizesByCampaign]);

  // Sync existing prizes into form
  useEffect(() => {
    if (isEditing && existingPrizes.length > 0 && prizeItems.length === 0) {
      setPrizeItems(existingPrizes.map((p) => ({
        key: ++prizeKeyCounter,
        title: p.title,
        description: p.description || '',
        image: p.image || '',
        quantity: p.quantity,
        prizeType: p.prizeType,
        couponCode: p.couponCode || '',
        sortOrder: p.sortOrder,
      })));
    }
  }, [existingPrizes, isEditing, prizeItems.length]);

  const addPrize = useCallback(() => {
    setPrizeItems((prev) => [...prev, {
      key: ++prizeKeyCounter,
      title: '',
      description: '',
      image: '',
      quantity: 1,
      prizeType: 0,
      couponCode: '',
      sortOrder: prev.length + 1,
    }]);
  }, []);

  const removePrize = useCallback((key: number) => {
    setPrizeItems((prev) => prev.filter((p) => p.key !== key));
  }, []);

  const updatePrizeField = useCallback((key: number, field: keyof PrizeFormItem, value: string | number) => {
    setPrizeItems((prev) => prev.map((p) =>
      p.key === key ? { ...p, [field]: value } : p
    ));
  }, []);

  const goNext = () => {
    const idx = TABS.indexOf(activeTab);
    if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1]);
  };

  const goPrev = () => {
    const idx = TABS.indexOf(activeTab);
    if (idx > 0) setActiveTab(TABS[idx - 1]);
  };

  const handlePublish = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const campaignData: CampaignInsertInfo = {
        userId: 0,
        title,
        description,
        startTime: startTime || null,
        endTime: endTime || null,
        status: 1,
        nameRequired: true,
        emailRequired: true,
        phoneRequired: false,
        minAge: null,
        bgImage: '',
        topImage: '',
        youtubeUrl: '',
        customCss,
        minEntry: null,
        slug: null,
        timezone: timezone || null,
        maxEntriesPerUser: null,
        winnerCount,
        isPublished: true,
        password: password || null,
        themePrimaryColor: themePrimaryColor || null,
        themeSecondaryColor: themeSecondaryColor || null,
        themeBgColor: themeBgColor || null,
        themeFont: themeFont || null,
        logoImage: logoImage || null,
        termsUrl: termsUrl || null,
        redirectUrl: redirectUrl || null,
        welcomeEmailEnabled,
        welcomeEmailSubject: welcomeEmailSubject || null,
        welcomeEmailBody: welcomeEmailBody || null,
        geoCountries: geoCountries || null,
        blockVpn,
        requireEmailVerification,
        entryType,
        gaTrackingId: gaTrackingId || null,
        fbPixelId: fbPixelId || null,
        tiktokPixelId: tiktokPixelId || null,
        gtmId: gtmId || null,
        brandId: null,
        language: null,
      };

      let resultCampaignId: number;

      if (isEditing) {
        const updateData: CampaignUpdateInfo = {
          ...campaignData,
          campaignId: parseInt(campaignId!, 10),
        };
        const result = await updateCampaign(updateData);
        if (!result.sucesso) throw new Error(result.mensagem || 'Failed to update campaign');
        resultCampaignId = parseInt(campaignId!, 10);
      } else {
        const result = await insertCampaign(campaignData);
        if (!result.sucesso || !result.campaign) throw new Error(result.mensagem || 'Failed to create campaign');
        resultCampaignId = result.campaign.campaignId;
      }

      // Save prizes
      for (const prize of prizeItems) {
        const prizeData: PrizeInsertInfo = {
          campaignId: resultCampaignId,
          title: prize.title,
          description: prize.description || null,
          image: prize.image || null,
          quantity: prize.quantity,
          prizeType: prize.prizeType,
          couponCode: prize.couponCode || null,
          sortOrder: prize.sortOrder,
          minEntriesRequired: null,
        };
        await insertPrize(prizeData);
      }

      setSuccess(isEditing ? 'Campaign updated successfully!' : 'Campaign published successfully!');
      setTimeout(() => navigate('/admin/campaigns'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ paddingTop: '160px', paddingBottom: '40px', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-color), transparent 95%) 50%, color-mix(in srgb, var(--accent-color), transparent 98%) 25%, transparent 50%)' }}>
      <Container>
        <Row className="mb-4">
          <Col>
            <h3>{isEditing ? 'Edit Campaign' : 'New Campaign'}</h3>
          </Col>
        </Row>

        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
          <Row>
            <Col md={3}>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="basic">
                    <FontAwesomeIcon icon={faInfoCircle} fixedWidth className="me-2" />Basic Info
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="appearance">
                    <FontAwesomeIcon icon={faPaintBrush} fixedWidth className="me-2" />Appearance
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="prizes">
                    <FontAwesomeIcon icon={faTrophy} fixedWidth className="me-2" />Prizes
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="settings">
                    <FontAwesomeIcon icon={faCog} fixedWidth className="me-2" />Settings
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="review">
                    <FontAwesomeIcon icon={faCheckCircle} fixedWidth className="me-2" />Review & Publish
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>

            <Col md={9}>
              <Tab.Content>
                {/* Step 1: Basic Info */}
                <Tab.Pane eventKey="basic">
                  <Card>
                    <Card.Body>
                      <Card.Title>Basic Information</Card.Title>
                      <Form.Group className="mb-3">
                        <Form.Label>Title *</Form.Label>
                        <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter campaign title" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your campaign" />
                      </Form.Group>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>End Date</Form.Label>
                            <Form.Control type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Timezone</Form.Label>
                            <Form.Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                              <option value="">Select timezone</option>
                              <option value="UTC">UTC</option>
                              <option value="America/New_York">America/New_York</option>
                              <option value="America/Chicago">America/Chicago</option>
                              <option value="America/Denver">America/Denver</option>
                              <option value="America/Los_Angeles">America/Los_Angeles</option>
                              <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                              <option value="Europe/London">Europe/London</option>
                              <option value="Europe/Paris">Europe/Paris</option>
                              <option value="Asia/Tokyo">Asia/Tokyo</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Entry Type</Form.Label>
                            <Form.Select value={entryType} onChange={(e) => setEntryType(parseInt(e.target.value, 10))}>
                              {ENTRY_TYPES.map((et) => (
                                <option key={et.value} value={et.value}>{et.label}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Winner Count</Form.Label>
                            <Form.Control type="number" min={1} value={winnerCount} onChange={(e) => setWinnerCount(parseInt(e.target.value, 10) || 1)} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>Password (optional)</Form.Label>
                        <Form.Control type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank for no password" />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Step 2: Appearance */}
                <Tab.Pane eventKey="appearance">
                  <Card>
                    <Card.Body>
                      <Card.Title>Appearance</Card.Title>
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Primary Color</Form.Label>
                            <Form.Control type="color" value={themePrimaryColor} onChange={(e) => setThemePrimaryColor(e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Secondary Color</Form.Label>
                            <Form.Control type="color" value={themeSecondaryColor} onChange={(e) => setThemeSecondaryColor(e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Background Color</Form.Label>
                            <Form.Control type="color" value={themeBgColor} onChange={(e) => setThemeBgColor(e.target.value)} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>Font</Form.Label>
                        <Form.Control type="text" value={themeFont} onChange={(e) => setThemeFont(e.target.value)} placeholder="e.g., Inter, Roboto, Arial" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Logo Image URL</Form.Label>
                        <Form.Control type="text" value={logoImage} onChange={(e) => setLogoImage(e.target.value)} placeholder="https://example.com/logo.png" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Custom CSS</Form.Label>
                        <Form.Control as="textarea" rows={5} value={customCss} onChange={(e) => setCustomCss(e.target.value)} placeholder="/* Custom CSS rules */" />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Step 3: Prizes */}
                <Tab.Pane eventKey="prizes">
                  <Card>
                    <Card.Body>
                      <Card.Title className="d-flex justify-content-between align-items-center">
                        Prizes
                        <Button variant="success" size="sm" onClick={addPrize}>
                          <FontAwesomeIcon icon={faPlus} fixedWidth className="me-1" />Add Prize
                        </Button>
                      </Card.Title>
                      {prizeItems.length === 0 && (
                        <p className="text-muted">No prizes added yet. Click "Add Prize" to get started.</p>
                      )}
                      {prizeItems.map((prize, idx) => (
                        <Card key={prize.key} className="mb-3 border">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <strong>Prize #{idx + 1}</strong>
                              <Button variant="outline-danger" size="sm" onClick={() => removePrize(prize.key)}>
                                <FontAwesomeIcon icon={faTrash} fixedWidth />
                              </Button>
                            </div>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Title</Form.Label>
                                  <Form.Control type="text" value={prize.title} onChange={(e) => updatePrizeField(prize.key, 'title', e.target.value)} />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Quantity</Form.Label>
                                  <Form.Control type="number" min={1} value={prize.quantity} onChange={(e) => updatePrizeField(prize.key, 'quantity', parseInt(e.target.value, 10) || 1)} />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Type</Form.Label>
                                  <Form.Select value={prize.prizeType} onChange={(e) => updatePrizeField(prize.key, 'prizeType', parseInt(e.target.value, 10))}>
                                    <option value={0}>Physical</option>
                                    <option value={1}>Digital</option>
                                    <option value={2}>Coupon</option>
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                            </Row>
                            <Form.Group className="mb-2">
                              <Form.Label>Description</Form.Label>
                              <Form.Control as="textarea" rows={2} value={prize.description} onChange={(e) => updatePrizeField(prize.key, 'description', e.target.value)} />
                            </Form.Group>
                            <Row>
                              <Col md={4}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Image URL</Form.Label>
                                  <Form.Control type="text" value={prize.image} onChange={(e) => updatePrizeField(prize.key, 'image', e.target.value)} />
                                </Form.Group>
                              </Col>
                              <Col md={4}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Coupon Code</Form.Label>
                                  <Form.Control type="text" value={prize.couponCode} onChange={(e) => updatePrizeField(prize.key, 'couponCode', e.target.value)} />
                                </Form.Group>
                              </Col>
                              <Col md={4}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Sort Order</Form.Label>
                                  <Form.Control type="number" value={prize.sortOrder} onChange={(e) => updatePrizeField(prize.key, 'sortOrder', parseInt(e.target.value, 10) || 0)} />
                                </Form.Group>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Step 4: Settings */}
                <Tab.Pane eventKey="settings">
                  <Card>
                    <Card.Body>
                      <Card.Title>Settings</Card.Title>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Terms URL</Form.Label>
                            <Form.Control type="url" value={termsUrl} onChange={(e) => setTermsUrl(e.target.value)} placeholder="https://example.com/terms" />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Redirect URL</Form.Label>
                            <Form.Control type="url" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="https://example.com/thanks" />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>Geo Countries</Form.Label>
                        <Form.Control type="text" value={geoCountries} onChange={(e) => setGeoCountries(e.target.value)} placeholder="US, BR, GB (comma-separated)" />
                      </Form.Group>
                      <Form.Check className="mb-3" type="checkbox" label="Block VPN" checked={blockVpn} onChange={(e) => setBlockVpn(e.target.checked)} />
                      <Form.Check className="mb-3" type="checkbox" label="Require Email Verification" checked={requireEmailVerification} onChange={(e) => setRequireEmailVerification(e.target.checked)} />

                      <hr />
                      <h6>Welcome Email</h6>
                      <Form.Check className="mb-3" type="checkbox" label="Enable Welcome Email" checked={welcomeEmailEnabled} onChange={(e) => setWelcomeEmailEnabled(e.target.checked)} />
                      {welcomeEmailEnabled && (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label>Subject</Form.Label>
                            <Form.Control type="text" value={welcomeEmailSubject} onChange={(e) => setWelcomeEmailSubject(e.target.value)} />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Body</Form.Label>
                            <Form.Control as="textarea" rows={4} value={welcomeEmailBody} onChange={(e) => setWelcomeEmailBody(e.target.value)} />
                          </Form.Group>
                        </>
                      )}

                      <hr />
                      <h6>Tracking Pixels</h6>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>GA Tracking ID</Form.Label>
                            <Form.Control type="text" value={gaTrackingId} onChange={(e) => setGaTrackingId(e.target.value)} placeholder="UA-XXXXXXXX-X or G-XXXXXXXXXX" />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Facebook Pixel ID</Form.Label>
                            <Form.Control type="text" value={fbPixelId} onChange={(e) => setFbPixelId(e.target.value)} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>TikTok Pixel ID</Form.Label>
                            <Form.Control type="text" value={tiktokPixelId} onChange={(e) => setTiktokPixelId(e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>GTM ID</Form.Label>
                            <Form.Control type="text" value={gtmId} onChange={(e) => setGtmId(e.target.value)} placeholder="GTM-XXXXXXX" />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Step 5: Review & Publish */}
                <Tab.Pane eventKey="review">
                  <Card>
                    <Card.Body>
                      <Card.Title>Review & Publish</Card.Title>

                      <h6 className="mt-3">Basic Info</h6>
                      <ul className="list-unstyled ms-3">
                        <li><strong>Title:</strong> {title || <em className="text-muted">Not set</em>}</li>
                        <li><strong>Description:</strong> {description || <em className="text-muted">Not set</em>}</li>
                        <li><strong>Start:</strong> {startTime || <em className="text-muted">Not set</em>}</li>
                        <li><strong>End:</strong> {endTime || <em className="text-muted">Not set</em>}</li>
                        <li><strong>Timezone:</strong> {timezone || <em className="text-muted">Not set</em>}</li>
                        <li><strong>Entry Type:</strong> {ENTRY_TYPES.find((e) => e.value === entryType)?.label}</li>
                        <li><strong>Winner Count:</strong> {winnerCount}</li>
                        {password && <li><strong>Password Protected:</strong> Yes</li>}
                      </ul>

                      <h6>Appearance</h6>
                      <ul className="list-unstyled ms-3">
                        <li><strong>Primary Color:</strong> <span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: themePrimaryColor, border: '1px solid #ccc', verticalAlign: 'middle' }}></span> {themePrimaryColor}</li>
                        <li><strong>Secondary Color:</strong> <span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: themeSecondaryColor, border: '1px solid #ccc', verticalAlign: 'middle' }}></span> {themeSecondaryColor}</li>
                        <li><strong>Background Color:</strong> <span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: themeBgColor, border: '1px solid #ccc', verticalAlign: 'middle' }}></span> {themeBgColor}</li>
                        {themeFont && <li><strong>Font:</strong> {themeFont}</li>}
                        {logoImage && <li><strong>Logo:</strong> {logoImage}</li>}
                        {customCss && <li><strong>Custom CSS:</strong> Yes ({customCss.length} chars)</li>}
                      </ul>

                      <h6>Prizes ({prizeItems.length})</h6>
                      {prizeItems.length === 0 ? (
                        <p className="text-muted ms-3">No prizes configured</p>
                      ) : (
                        <ul className="ms-3">
                          {prizeItems.map((p, i) => (
                            <li key={p.key}>{p.title || `Prize #${i + 1}`} - Qty: {p.quantity}</li>
                          ))}
                        </ul>
                      )}

                      <h6>Settings</h6>
                      <ul className="list-unstyled ms-3">
                        {termsUrl && <li><strong>Terms URL:</strong> {termsUrl}</li>}
                        {redirectUrl && <li><strong>Redirect URL:</strong> {redirectUrl}</li>}
                        {geoCountries && <li><strong>Geo Countries:</strong> {geoCountries}</li>}
                        <li><strong>Block VPN:</strong> {blockVpn ? 'Yes' : 'No'}</li>
                        <li><strong>Email Verification:</strong> {requireEmailVerification ? 'Required' : 'Not required'}</li>
                        <li><strong>Welcome Email:</strong> {welcomeEmailEnabled ? 'Enabled' : 'Disabled'}</li>
                        {gaTrackingId && <li><strong>GA:</strong> {gaTrackingId}</li>}
                        {fbPixelId && <li><strong>FB Pixel:</strong> {fbPixelId}</li>}
                        {tiktokPixelId && <li><strong>TikTok Pixel:</strong> {tiktokPixelId}</li>}
                        {gtmId && <li><strong>GTM:</strong> {gtmId}</li>}
                      </ul>

                      <div className="mt-4 text-center">
                        <Button variant="primary" size="lg" onClick={handlePublish} disabled={submitting || !title}>
                          {submitting ? (
                            <><Spinner animation="border" size="sm" className="me-2" />Publishing...</>
                          ) : (
                            <><FontAwesomeIcon icon={faSave} fixedWidth className="me-2" />{isEditing ? 'Update Campaign' : 'Publish Campaign'}</>
                          )}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>

              {/* Navigation buttons */}
              <div className="d-flex justify-content-between mt-3">
                <Button variant="outline-secondary" onClick={goPrev} disabled={activeTab === 'basic'}>
                  <FontAwesomeIcon icon={faArrowLeft} fixedWidth className="me-1" />Previous
                </Button>
                <Button variant="outline-primary" onClick={goNext} disabled={activeTab === 'review'}>
                  Next<FontAwesomeIcon icon={faArrowRight} fixedWidth className="ms-1" />
                </Button>
              </div>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </section>
  );
}
