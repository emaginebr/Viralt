import { useEffect } from 'react';

interface TrackingPixelsProps {
  gaTrackingId: string | null;
  fbPixelId: string | null;
  tiktokPixelId: string | null;
  gtmId: string | null;
}

/** Injects tracking pixel scripts for non-null IDs. Cleans up on unmount. */
export default function TrackingPixels({ gaTrackingId, fbPixelId, tiktokPixelId, gtmId }: TrackingPixelsProps) {

  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];

    // Google Analytics (gtag.js)
    if (gaTrackingId) {
      const gaLoader = document.createElement('script');
      gaLoader.src = `https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`;
      gaLoader.async = true;
      document.head.appendChild(gaLoader);
      scripts.push(gaLoader);

      const gaInit = document.createElement('script');
      gaInit.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaTrackingId}');
      `;
      document.head.appendChild(gaInit);
      scripts.push(gaInit);
    }

    // Facebook Pixel
    if (fbPixelId) {
      const fbScript = document.createElement('script');
      fbScript.textContent = `
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${fbPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
      scripts.push(fbScript);
    }

    // TikTok Pixel
    if (tiktokPixelId) {
      const ttScript = document.createElement('script');
      ttScript.textContent = `
        !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
        ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");
        o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
        var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${tiktokPixelId}');ttq.page()}(window,document,'ttq');
      `;
      document.head.appendChild(ttScript);
      scripts.push(ttScript);
    }

    // Google Tag Manager
    if (gtmId) {
      const gtmScript = document.createElement('script');
      gtmScript.textContent = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
        j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
        f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');
      `;
      document.head.appendChild(gtmScript);
      scripts.push(gtmScript);
    }

    return () => {
      scripts.forEach((script) => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [gaTrackingId, fbPixelId, tiktokPixelId, gtmId]);

  return null;
}
