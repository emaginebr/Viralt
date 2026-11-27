import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CampaignWidgetProps {
  slug: string;
}

interface ViraltResizeMessage {
  type: 'viralt-resize';
  slug: string;
  height: number;
}

const isResizeMessage = (data: unknown): data is ViraltResizeMessage => {
  if (!data || typeof data !== 'object') return false;
  const message = data as Partial<ViraltResizeMessage>;
  return message.type === 'viralt-resize' && typeof message.height === 'number';
};

/** Embeds /widget/:slug and follows its height via the `viralt-resize` contract. */
const CampaignWidget = ({ slug }: CampaignWidgetProps) => {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(400);

  useEffect(() => {
    const handleMessage = (e: MessageEvent): void => {
      if (isResizeMessage(e.data) && e.data.slug === slug) {
        setHeight(e.data.height);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [slug]);

  const baseUrl = import.meta.env.VITE_API_URL
    ? new URL(import.meta.env.VITE_API_URL).origin
    : window.location.origin;

  return (
    <iframe
      ref={iframeRef}
      src={`${baseUrl}/widget/${slug}`}
      // The height is a runtime value sent by the widget, so it stays inline.
      style={{ height: `${height}px` }}
      className="block w-full overflow-hidden border-0"
      title={t('campaignWidget.iframe_title', { slug })}
    />
  );
};

export default CampaignWidget;
