import { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCampaign } from '../../hooks/useCampaign';
import { campaignService } from '../../Services/campaignService';

const WidgetPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { selectedCampaign, setSelectedCampaign } = useCampaign();

  // Load campaign by slug on mount
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const loadCampaign = async () => {
      try {
        const result = await campaignService.getBySlug(slug);
        if (!cancelled && result.sucesso && result.campaign) {
          setSelectedCampaign(result.campaign);
        }
      } catch {
        /* silent fail for widget */
      }
    };
    loadCampaign();
    return () => { cancelled = true; };
  }, [slug, setSelectedCampaign]);

  // Send height to parent via postMessage
  const sendHeight = useCallback(() => {
    if (!slug) return;
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage(
      { type: 'viralt-resize', slug, height },
      '*'
    );
  }, [slug]);

  useEffect(() => {
    sendHeight();
    window.addEventListener('resize', sendHeight);

    // Observe body for content changes
    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      window.removeEventListener('resize', sendHeight);
      observer.disconnect();
    };
  }, [sendHeight]);

  // Apply theme CSS variables from campaign data
  useEffect(() => {
    if (!selectedCampaign) return;
    const root = document.documentElement;
    if (selectedCampaign.themePrimaryColor) root.style.setProperty('--theme-primary', selectedCampaign.themePrimaryColor);
    if (selectedCampaign.themeSecondaryColor) root.style.setProperty('--theme-secondary', selectedCampaign.themeSecondaryColor);
    if (selectedCampaign.themeBgColor) root.style.setProperty('--theme-bg', selectedCampaign.themeBgColor);
    if (selectedCampaign.themeFont) root.style.setProperty('--theme-font', selectedCampaign.themeFont);

    return () => {
      root.style.removeProperty('--theme-primary');
      root.style.removeProperty('--theme-secondary');
      root.style.removeProperty('--theme-bg');
      root.style.removeProperty('--theme-font');
    };
  }, [selectedCampaign]);

  // Set Open Graph meta tags
  useEffect(() => {
    if (!selectedCampaign) return;
    document.title = selectedCampaign.title;

    const setMeta = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('og:title', selectedCampaign.title);
    if (selectedCampaign.description) setMeta('og:description', selectedCampaign.description.replace(/<[^>]*>/g, ''));
    if (selectedCampaign.topImage) setMeta('og:image', selectedCampaign.topImage);
    if (selectedCampaign.slug) setMeta('og:url', `${window.location.origin}/c/${selectedCampaign.slug}`);
    setMeta('og:type', 'website');
  }, [selectedCampaign]);

  if (!selectedCampaign) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: selectedCampaign.themeFont || 'inherit',
        backgroundColor: selectedCampaign.themeBgColor || 'transparent',
        color: selectedCampaign.themePrimaryColor || 'inherit',
        padding: '1rem',
      }}
    >
      {selectedCampaign.logoImage && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <img
            src={selectedCampaign.logoImage}
            alt={selectedCampaign.title}
            style={{ maxHeight: '80px', objectFit: 'contain' }}
          />
        </div>
      )}
      <h3 style={{ textAlign: 'center' }}>{selectedCampaign.title}</h3>
      {selectedCampaign.description && (
        <div
          style={{ marginTop: '0.5rem' }}
          dangerouslySetInnerHTML={{ __html: selectedCampaign.description }}
        />
      )}
      {selectedCampaign.topImage && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <img
            src={selectedCampaign.topImage}
            alt=""
            style={{ maxWidth: '100%', borderRadius: '8px' }}
          />
        </div>
      )}
    </div>
  );
};

export default WidgetPage;
