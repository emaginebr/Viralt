import { useState, useEffect, useMemo, useCallback } from 'react';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Table from 'react-bootstrap/esm/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Pagination from 'react-bootstrap/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBan, faTrash, faFileExport, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClient } from '../../hooks/useClient';
import type { ClientInfo } from '../../types/client';
import { getApiUrl, getHeaders } from '../../Services/apiHelpers';

const PAGE_SIZE = 20;

export default function ParticipantListPage() {
  const { t } = useTranslation();
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaignIdNum = parseInt(campaignId || '0', 10);

  const { clients, loading, error, loadClients, updateClient, deleteClient, clearError } = useClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (campaignIdNum > 0) {
      loadClients(campaignIdNum).catch(() => { /* handled by context */ });
    }
  }, [campaignIdNum, loadClients]);

  // Client-side filter
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter((c) =>
      c.name?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredClients.slice(start, start + PAGE_SIZE);
  }, [filteredClients, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDisqualify = useCallback(async (client: ClientInfo) => {
    if (!window.confirm(`Disqualify ${client.name || client.email}?`)) return;
    setActionError(null);
    try {
      await updateClient({
        clientId: client.clientId,
        campaignId: client.campaignId,
        name: client.name,
        email: client.email,
        phone: client.phone,
        birthday: client.birthday,
        referredByClientId: client.referredByClientId,
        ipAddress: client.ipAddress,
        countryCode: client.countryCode,
        userAgent: client.userAgent,
        emailVerified: client.emailVerified,
        isWinner: client.isWinner,
        isDisqualified: true,
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to disqualify');
    }
  }, [updateClient]);

  const handleDelete = useCallback(async (client: ClientInfo) => {
    if (!window.confirm(`Delete participant ${client.name || client.email}? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteClient(client.clientId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }, [deleteClient]);

  const handleExport = useCallback((format: 'csv' | 'json') => {
    const url = `${getApiUrl()}/api/Client/export/${campaignIdNum}?format=${format}`;
    // Use fetch with auth headers for download
    fetch(url, { headers: getHeaders(true) })
      .then((res) => {
        if (!res.ok) throw new Error('Export failed');
        return res.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `participants-${campaignIdNum}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch((err) => setActionError(err instanceof Error ? err.message : 'Export failed'));
  }, [campaignIdNum]);

  const getStatusBadge = (client: ClientInfo) => {
    if (client.isDisqualified) return <Badge bg="danger">Disqualified</Badge>;
    if (client.isWinner) return <Badge bg="success">Winner</Badge>;
    if (client.emailVerified) return <Badge bg="primary">Verified</Badge>;
    return <Badge bg="secondary">Pending</Badge>;
  };

  return (
    <section style={{ paddingTop: '160px', paddingBottom: '40px', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-color), transparent 95%) 50%, color-mix(in srgb, var(--accent-color), transparent 98%) 25%, transparent 50%)' }}>
      <Container>
        <Row className="mb-3">
          <Col md={6}>
            <h3>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/admin/campaigns">Campaigns</Link></li>
                  <li className="breadcrumb-item"><Link to={`/admin/campaigns/${campaignIdNum}`}>Campaign</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">Participants</li>
                </ol>
              </nav>
            </h3>
          </Col>
          <Col md={6} className="text-end">
            <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleExport('csv')}>
              <FontAwesomeIcon icon={faDownload} fixedWidth className="me-1" />Export CSV
            </Button>
            <Button variant="outline-info" size="sm" onClick={() => handleExport('json')}>
              <FontAwesomeIcon icon={faFileExport} fixedWidth className="me-1" />Export JSON
            </Button>
          </Col>
        </Row>

        {(error || actionError) && (
          <Alert variant="danger" onClose={() => { clearError(); setActionError(null); }} dismissible>
            {error || actionError}
          </Alert>
        )}

        <Row className="mb-3">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
              <Form.Control
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={6} className="text-end">
            <span className="text-muted">{filteredClients.length} participant(s) found</span>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading participants...</p>
          </div>
        ) : (
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Total Entries</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      {searchTerm ? 'No participants match your search.' : 'No participants yet.'}
                    </td>
                  </tr>
                ) : (
                  paginatedClients.map((client) => (
                    <tr key={client.clientId}>
                      <td>{client.name || '-'}</td>
                      <td>{client.email || '-'}</td>
                      <td>{client.totalEntries}</td>
                      <td>{getStatusBadge(client)}</td>
                      <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                      <td>
                        {!client.isDisqualified && (
                          <Button variant="outline-warning" size="sm" className="me-1" onClick={() => handleDisqualify(client)} title="Disqualify">
                            <FontAwesomeIcon icon={faBan} fixedWidth />
                          </Button>
                        )}
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(client)} title="Delete">
                          <FontAwesomeIcon icon={faTrash} fixedWidth />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.First disabled={currentPage === 1} onClick={() => setCurrentPage(1)} />
                  <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} />
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                    const page = startPage + i;
                    if (page > totalPages) return null;
                    return (
                      <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                        {page}
                      </Pagination.Item>
                    );
                  })}
                  <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} />
                  <Pagination.Last disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}
