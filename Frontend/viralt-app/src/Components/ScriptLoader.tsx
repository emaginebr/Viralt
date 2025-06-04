import { useEffect } from 'react';

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
};


const ScriptLoader = (): React.ReactNode => {
  useEffect(() => {
    const loadAllScripts = async () => {
      try {
        await loadScript(process.env.PUBLIC_URL + '/assets/vendor/bootstrap/js/bootstrap.bundle.min.js');
        await loadScript(process.env.PUBLIC_URL + '/assets/vendor/php-email-form/validate.js');
        await loadScript(process.env.PUBLIC_URL + '/assets/vendor/aos/aos.js');
        await loadScript(process.env.PUBLIC_URL + '/assets/vendor/glightbox/js/glightbox.min.js');
        await loadScript(process.env.PUBLIC_URL + '/assets/vendor/swiper/swiper-bundle.min.js');
        await loadScript(process.env.PUBLIC_URL + '/assets/vendor/purecounter/purecounter_vanilla.js');
        await loadScript(process.env.PUBLIC_URL + '/assets/js/main.js');
      } catch (error) {
        console.error(error);
      }
    };

    loadAllScripts();
  }, []);

  return null;
};

export default ScriptLoader;
