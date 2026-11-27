import { useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye, faPlus, faSearch, faTrash, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from 'react-bootstrap/Pagination';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useTranslation } from "react-i18next";
import { useCampaign } from "../../hooks/useCampaign";
import type { CampaignInfo } from "../../types/campaign";

const STATUS_LABELS: Record<number, { label: string; variant: string }> = {
    0: { label: 'Draft', variant: 'secondary' },
    1: { label: 'Active', variant: 'success' },
    2: { label: 'Paused', variant: 'warning' },
    3: { label: 'Ended', variant: 'dark' },
};

const PAGE_SIZE = 9;

export default function CampaignSearchPage() {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const { campaigns, loading, error, loadCampaigns, deleteCampaign, clearError } = useCampaign();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        loadCampaigns(100).catch(() => { /* handled by context */ });
    }, [loadCampaigns]);

    // Filter campaigns
    const filteredCampaigns = campaigns.filter((c) => {
        const matchesSearch = !searchTerm.trim() ||
            c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.slug?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === null || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
    const paginatedCampaigns = filteredCampaigns.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleDelete = async (campaign: CampaignInfo) => {
        if (!window.confirm(`Delete campaign "${campaign.title}"? This cannot be undone.`)) return;
        setDeleteError(null);
        try {
            await deleteCampaign(campaign.campaignId);
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const getStatusBadge = (status: number) => {
        const info = STATUS_LABELS[status] || { label: 'Unknown', variant: 'secondary' };
        return <Badge bg={info.variant}>{info.label}</Badge>;
    };

    return (
        <>
            <section style={{paddingTop: "160px", paddingBottom: "40px", background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-color), transparent 95%) 50%, color-mix(in srgb, var(--accent-color), transparent 98%) 25%, transparent 50%)"}}>
            <Container>
                <Row>
                    <Col md="6">
                        <h3>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item active" aria-current="page">My Campaigns</li>
                                </ol>
                            </nav>
                        </h3>
                    </Col>
                    <Col md="6" style={{ textAlign: "right" }}>
                        <InputGroup className="pull-right">
                            <Form.Control
                                placeholder="Search by keyword"
                                aria-label="Search by keyword"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                            <Button variant="outline-secondary"><FontAwesomeIcon icon={faSearch} fixedWidth /></Button>
                            <Dropdown>
                                <Dropdown.Toggle variant="danger" id="dropdown-basic">
                                    {statusFilter === null ? t('filter_by_all_status') : STATUS_LABELS[statusFilter]?.label || 'Unknown'}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => { setStatusFilter(null); setCurrentPage(1); }}>All Statuses</Dropdown.Item>
                                    <Dropdown.Item onClick={() => { setStatusFilter(0); setCurrentPage(1); }}>Draft</Dropdown.Item>
                                    <Dropdown.Item onClick={() => { setStatusFilter(1); setCurrentPage(1); }}>Active</Dropdown.Item>
                                    <Dropdown.Item onClick={() => { setStatusFilter(2); setCurrentPage(1); }}>Paused</Dropdown.Item>
                                    <Dropdown.Item onClick={() => { setStatusFilter(3); setCurrentPage(1); }}>Ended</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <Button variant="success" onClick={() => navigate("/campaigns/new")}>
                                <FontAwesomeIcon icon={faPlus} fixedWidth />&nbsp;New Campaign
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>

                {(error || deleteError) && (
                    <Row className="mt-3">
                        <Col>
                            <Alert variant="danger" onClose={() => { clearError(); setDeleteError(null); }} dismissible>
                                {error || deleteError}
                            </Alert>
                        </Col>
                    </Row>
                )}

                {loading ? (
                    <Row className="py-5">
                        <Col className="text-center">
                            <Spinner animation="border" />
                            <p className="mt-2">Loading campaigns...</p>
                        </Col>
                    </Row>
                ) : paginatedCampaigns.length === 0 ? (
                    <Row className="py-4">
                        <Col className="text-center text-muted">
                            <p>{searchTerm || statusFilter !== null ? 'No campaigns match your filters.' : 'No campaigns yet. Create your first campaign!'}</p>
                        </Col>
                    </Row>
                ) : (
                    <Row className="py-4">
                        {paginatedCampaigns.map((campaign) => (
                            <Col md={4} key={campaign.campaignId} className="mb-4">
                                <Card className="h-100">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <Card.Title className="mb-0" style={{ fontSize: '1.1rem' }}>{campaign.title}</Card.Title>
                                            {getStatusBadge(campaign.status)}
                                        </div>
                                        {campaign.slug && (
                                            <small className="text-muted mb-2">/{campaign.slug}</small>
                                        )}
                                        <Card.Text className="text-muted small flex-grow-1">
                                            {campaign.description
                                                ? (campaign.description.length > 100
                                                    ? campaign.description.substring(0, 100) + '...'
                                                    : campaign.description)
                                                : 'No description'}
                                        </Card.Text>
                                        <div className="mb-3">
                                            <small className="text-muted d-block">
                                                <strong>{campaign.totalParticipants}</strong> participants &middot; <strong>{campaign.totalEntries}</strong> entries
                                            </small>
                                        </div>
                                        <div className="mt-auto">
                                            <Link to={`/campaigns/${campaign.campaignId}`}>
                                                <Button variant="primary" size="sm">
                                                    <FontAwesomeIcon icon={faEye} fixedWidth /> View
                                                </Button>
                                            </Link>
                                            &nbsp;
                                            <Link to={`/campaigns/${campaign.campaignId}/edit`}>
                                                <Button variant="success" size="sm">
                                                    <FontAwesomeIcon icon={faEdit} fixedWidth /> Edit
                                                </Button>
                                            </Link>
                                            &nbsp;
                                            <Link to={`/campaigns/${campaign.campaignId}/participants`}>
                                                <Button variant="info" size="sm">
                                                    <FontAwesomeIcon icon={faUsers} fixedWidth /> Participants
                                                </Button>
                                            </Link>
                                            &nbsp;
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(campaign)}>
                                                <FontAwesomeIcon icon={faTrash} fixedWidth /> Delete
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {totalPages > 1 && (
                    <Row>
                        <Col md={12} className="text-center">
                            <Pagination className="justify-content-center">
                                <Pagination.First
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(1)}
                                />
                                <Pagination.Prev
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                />
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                                    const page = startPage + i;
                                    if (page > totalPages) return null;
                                    return (
                                        <Pagination.Item
                                            key={page}
                                            active={page === currentPage}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </Pagination.Item>
                                    );
                                })}
                                <Pagination.Next
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                />
                                <Pagination.Last
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                />
                            </Pagination>
                        </Col>
                    </Row>
                )}
            </Container>
            </section>
        </>
    );
}
