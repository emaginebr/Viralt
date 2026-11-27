import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCode, faCopy } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface EmbedCodeSectionProps {
  slug: string;
  baseUrl: string;
}

const EmbedCodeSection = ({ slug, baseUrl }: EmbedCodeSectionProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const embedCode = `<div id="viralt-widget" data-campaign="${slug}" data-url="${baseUrl}"></div>\n<script src="${baseUrl}/widget.js"></script>`;

  const markCopied = useCallback(() => {
    setCopied(true);
    toast.success(t('embedCode.copiedToast'));
    setTimeout(() => setCopied(false), 2000);
  }, [t]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      markCopied();
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = embedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      markCopied();
    }
  }, [embedCode, markCopied]);

  return (
    <Card as="section" aria-labelledby="embed-code-title">
      <CardHeader>
        <div>
          <CardTitle id="embed-code-title" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCode} aria-hidden="true" />
            {t('embedCode.title')}
          </CardTitle>
          <CardDescription>{t('embedCode.description')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          label={t('embedCode.label')}
          hideLabel
          rows={4}
          readOnly
          value={embedCode}
          className="font-mono text-sm"
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />
        <div>
          <Button
            variant={copied ? 'secondary' : 'outline'}
            leftIcon={<FontAwesomeIcon icon={copied ? faCheck : faCopy} aria-hidden="true" />}
            onClick={handleCopy}
          >
            {copied ? t('embedCode.copied') : t('embedCode.copy')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmbedCodeSection;
