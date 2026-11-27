import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/figtree';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/jetbrains-mono';
import 'react-loading-skeleton/dist/skeleton.css';
import './styles/index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from './Components/ScrollToTop';
import RouteFallback from './Components/RouteFallback';
import './i18n'; // Import i18next configuration

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.VITE_SITE_BASENAME}>
      <ScrollToTop />
      <React.Suspense fallback={<RouteFallback />}>
        <App />
      </React.Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
