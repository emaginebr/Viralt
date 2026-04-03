import { useState, useCallback } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

interface ContestUploadProps {
  campaignId: number;
  clientId: number;
  onSubmitted?: () => void;
}

/**
 * ContestUpload component - File upload for contest submissions.
 * Shown when campaign.entryType === 3 (Contest).
 * Can be integrated into PublicCampaignPage when it exists.
 */
export default function ContestUpload({ campaignId, clientId, onSubmitted }: ContestUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('campaignId', campaignId.toString());
      formData.append('clientId', clientId.toString());
      formData.append('caption', caption);

      const apiUrl = process.env.REACT_APP_API_URL || 'https://localhost:44374';
      const response = await fetch(`${apiUrl}/api/Submission/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Upload failed');
      }

      setSuccess(true);
      setFile(null);
      setCaption('');
      // Reset the file input
      const fileInput = document.getElementById('contest-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  }, [file, caption, campaignId, clientId, onSubmitted]);

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Submit Your Entry</Card.Title>

        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {success && <Alert variant="success">Your submission has been uploaded successfully!</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Upload Image or Video</Form.Label>
          <Form.Control
            id="contest-file-input"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          <Form.Text className="text-muted">
            Accepted formats: JPG, PNG, GIF, MP4, MOV, WebM
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Caption (optional)</Form.Label>
          <Form.Control
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption to your submission"
            maxLength={280}
          />
        </Form.Group>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={submitting || !file}
        >
          {submitting ? (
            <><Spinner animation="border" size="sm" className="me-2" />Uploading...</>
          ) : (
            <><FontAwesomeIcon icon={faUpload} fixedWidth className="me-2" />Submit Entry</>
          )}
        </Button>
      </Card.Body>
    </Card>
  );
}
