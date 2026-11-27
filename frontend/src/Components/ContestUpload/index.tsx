import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage, faUpload } from '@fortawesome/free-solid-svg-icons';
import { Alert, Button, Card, CardContent, CardTitle, FileInput, Input } from '../ui';
import { getApiUrl } from '../../Services/apiHelpers';

interface ContestUploadProps {
  campaignId: number;
  clientId: number;
  onSubmitted?: () => void;
}

const formatSize = (bytes: number): string =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * ContestUpload component - File upload for contest submissions.
 * Shown when campaign.entryType === 3 (Contest).
 */
const ContestUpload = ({ campaignId, clientId, onSubmitted }: ContestUploadProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFilesChange = useCallback((files: FileList | null) => {
    setFile(files?.[0] ?? null);
    setError(null);
    setSuccess(false);
  }, []);

  const handleRemove = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) {
      setError(t('contestUpload.error_no_file'));
      fileInputRef.current?.focus();
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

      const response = await fetch(`${getApiUrl()}/api/Submission/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || t('contestUpload.error_failed'));
      }

      setSuccess(true);
      setFile(null);
      setCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('contestUpload.error_failed'));
    } finally {
      setSubmitting(false);
    }
  }, [file, caption, campaignId, clientId, onSubmitted, t]);

  return (
    <Card as="section" aria-labelledby="contest-upload-title">
      <CardContent className="flex flex-col gap-5">
        <CardTitle id="contest-upload-title">{t('contestUpload.title')}</CardTitle>

        <div aria-live="polite" className="flex flex-col gap-3">
          {success && <Alert variant="success" title={t('contestUpload.success')} />}
        </div>
        {error && (
          <Alert
            variant="danger"
            title={t('contestUpload.error_title')}
            dismissible
            dismissLabel={t('shared.dismissAlert')}
            onDismiss={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <FileInput
          ref={fileInputRef}
          id="contest-file-input"
          label={t('contestUpload.file_label')}
          hint={t('contestUpload.file_hint')}
          prompt={t('contestUpload.file_prompt')}
          dropPrompt={t('contestUpload.file_drop')}
          dragPrompt={t('contestUpload.file_drag')}
          accept="image/*,video/*"
          disabled={submitting}
          onFilesChange={handleFilesChange}
          selected={
            file ? (
              <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted p-3">
                <FontAwesomeIcon icon={faFileImage} aria-hidden="true" className="text-xl text-muted-foreground" />
                <p className="min-w-0 flex-1 text-sm">
                  <span className="block truncate font-semibold">{file.name}</span>
                  <span className="text-muted-foreground">{formatSize(file.size)}</span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  aria-label={t('contestUpload.remove_aria', { name: file.name })}
                >
                  {t('contestUpload.remove')}
                </Button>
              </div>
            ) : undefined
          }
        />

        <Input
          label={
            <>
              {t('contestUpload.caption_label')}{' '}
              <span className="font-normal text-muted-foreground">{t('shared.optional')}</span>
            </>
          }
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={t('contestUpload.caption_placeholder')}
          maxLength={280}
          disabled={submitting}
        />

        <div>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!file}
            loading={submitting}
            loadingText={t('contestUpload.submitting')}
            leftIcon={<FontAwesomeIcon icon={faUpload} aria-hidden="true" />}
          >
            {t('contestUpload.submit')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContestUpload;
