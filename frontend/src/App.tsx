import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ContextBuilder from './Contexts/Utils/ContextBuilder';
import AuthProvider from './Contexts/Auth/AuthProvider';
import UserProvider from './Contexts/User/UserProvider';
import NetworkProvider from './Contexts/Network/NetworkProvider';
import ProfileProvider from './Contexts/Profile/ProfileProvider';
import ProductProvider from './Contexts/Product/ProductProvider';
import OrderProvider from './Contexts/Order/OrderProvider';
import InvoiceProvider from './Contexts/Invoice/InvoiceProvider';
import ImageProvider from './Contexts/Image/ImageProvider';
import TemplateProvider from './Contexts/Template/TemplateProvider';
import { AuthProvider as NewAuthProvider } from './Contexts/AuthContext';
import { CampaignProvider } from './Contexts/CampaignContext';
import { ClientProvider } from './Contexts/ClientContext';
import { PrizeProvider } from './Contexts/PrizeContext';
import { WinnerProvider } from './Contexts/WinnerContext';
import { PublicCampaignProvider } from './Contexts/PublicCampaignContext';
import RouteFallback from './Components/RouteFallback';
import { ConfirmProvider } from './Components/ui/ConfirmModal';
import { Toaster } from './Components/ui/Toaster';

// T046 (SC-005): every route is code-split, so /c/:slug and /widget/:slug do not download the
// panel shell (Header -> ImageModal -> react-image-crop), react-quill, moment or the HomePage.
const Layout = lazy(() => import('./Components/Layout'));
const HomePage = lazy(() => import('./Pages/HomePage'));
const UserPage = lazy(() => import('./Pages/UserPage'));
const PasswordPage = lazy(() => import('./Pages/PasswordPage'));
const LoginPage = lazy(() => import('./Pages/LoginPage'));
const RecoveryPage = lazy(() => import('./Pages/RecoveryPage'));
const DashboardPage = lazy(() => import('./Pages/DashboardPage'));
const NetworkEditPage = lazy(() => import('./Pages/NetworkEditPage'));
const NetworkListPage = lazy(() => import('./Pages/NetworkListPage'));
const NetworkInsertPage = lazy(() => import('./Pages/NetworkInsertPage'));
const ProductEditPage = lazy(() => import('./Pages/ProductEditPage'));
const ProductSearchPage = lazy(() => import('./Pages/ProductSearchPage'));
const ProfileListPage = lazy(() => import('./Pages/ProfileListPage'));
const ProfileEditPage = lazy(() => import('./Pages/ProfileEditPage'));
const UserSearchPage = lazy(() => import('./Pages/UserSearchPage'));
const OrderSearchPage = lazy(() => import('./Pages/OrderSearchPage'));
const InvoiceSearchPage = lazy(() => import('./Pages/InvoiceSearchPage'));
const Error404Page = lazy(() => import('./Pages/Error404Page'));
const CampaignSearchPage = lazy(() => import('./Pages/CampaignSearchPage'));
const CampaignBuilderPage = lazy(() => import('./Pages/CampaignBuilderPage'));
const CampaignDetailPage = lazy(() => import('./Pages/CampaignDetailPage'));
const ParticipantListPage = lazy(() => import('./Pages/ParticipantListPage'));
const SubmissionModerationPage = lazy(() => import('./Pages/SubmissionModerationPage'));
const WinnerSelectionPage = lazy(() => import('./Pages/WinnerSelectionPage'));
const WidgetPage = lazy(() => import('./Pages/WidgetPage'));
const PublicCampaignPage = lazy(() => import('./Pages/PublicCampaignPage'));

function App() {
  const ContextContainer = ContextBuilder([
    AuthProvider, UserProvider, NetworkProvider, ProfileProvider, ProductProvider,
    OrderProvider, InvoiceProvider, ImageProvider, TemplateProvider,
    NewAuthProvider, CampaignProvider, ClientProvider, PrizeProvider, WinnerProvider, PublicCampaignProvider
  ]);

  return (
    <ContextContainer>
      <ConfirmProvider>
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="campaigns">
            <Route index element={<CampaignSearchPage />} />
            <Route path="new" element={<CampaignBuilderPage />} />
            <Route path=":campaignId" element={<CampaignDetailPage />} />
            <Route path=":campaignId/edit" element={<CampaignBuilderPage />} />
            <Route path=":campaignId/participants" element={<ParticipantListPage />} />
            <Route path=":campaignId/submissions" element={<SubmissionModerationPage />} />
            <Route path=":campaignId/winners" element={<WinnerSelectionPage />} />
          </Route>
          <Route path="network">
            <Route index element={<NetworkInsertPage />} />
            <Route path="search" element={<NetworkListPage />} />
          </Route>
          <Route path="account">
            <Route index element={<LoginPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="edit-account" element={<UserPage />} />
            <Route path="new-account" element={<UserPage />} />
            <Route path="recovery-password" element={<RecoveryPage />} />
            <Route path="change-password" element={<PasswordPage />} />
          </Route>
          <Route path="admin">
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="network" element={<NetworkEditPage />} />
            <Route path="teams" element={<UserSearchPage />} />
            <Route path="teams">
              <Route index element={<UserSearchPage />} />
              <Route path=":pageNum" element={<UserSearchPage />} />
            </Route>
            <Route path="orders" element={<OrderSearchPage />} />
            <Route path="invoices" element={<InvoiceSearchPage />} />
            <Route path="products">
              <Route index element={<ProductSearchPage />} />
              <Route path="new" element={<ProductEditPage />} />
              <Route path=":productId" element={<ProductEditPage />} />
            </Route>
            <Route path="team-structure">
              <Route index element={<ProfileListPage />} />
              <Route path="new" element={<ProfileEditPage />} />
              <Route path=":profileId" element={<ProfileEditPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="c/:slug" element={<PublicCampaignPage />} />
        <Route path="widget/:slug" element={<WidgetPage />} />
        <Route path="*" element={<Error404Page />} />
      </Routes>
      </Suspense>
      </ConfirmProvider>
      <Toaster />
    </ContextContainer>
  );
}

export default App;
