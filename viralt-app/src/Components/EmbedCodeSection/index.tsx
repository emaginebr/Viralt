import { useState, useCallback } from 'react';

interface EmbedCodeSectionProps {
  slug: string;
  baseUrl: string;
}

const EmbedCodeSection = ({ slug, baseUrl }: EmbedCodeSectionProps) => {
  const [copied, setCopied] = useState(false);

  const embedCode = `<div id="viralt-widget" data-campaign="${slug}" data-url="${baseUrl}"></div>\n<script src="${baseUrl}/widget.js"></script>`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = embedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [embedCode]);

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Embed Code</h5>
        <p className="text-muted">
          Copy the code below and paste it into your website to embed the campaign widget.
        </p>
        <textarea
          className="form-control font-monospace"
          rows={4}
          readOnly
          value={embedCode}
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />
        <button
          className={`btn mt-2 ${copied ? 'btn-success' : 'btn-outline-primary'}`}
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
};

export default EmbedCodeSection;
