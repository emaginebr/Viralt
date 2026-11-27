import { useEffect, useRef, useState } from 'react';

interface CampaignWidgetProps {
  slug: string;
}

const CampaignWidget = ({ slug }: CampaignWidgetProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(400);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'viralt-resize' && e.data.slug === slug) {
        setHeight(e.data.height);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [slug]);

  const baseUrl = process.env.REACT_APP_API_URL
    ? new URL(process.env.REACT_APP_API_URL).origin
    : window.location.origin;

  return (
    <iframe
      ref={iframeRef}
      src={`${baseUrl}/widget/${slug}`}
      style={{
        width: '100%',
        height: `${height}px`,
        border: 'none',
        overflow: 'hidden',
      }}
      title={`Campaign widget: ${slug}`}
    />
  );
};

export default CampaignWidget;
