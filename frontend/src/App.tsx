import { Routes, Route, Outlet, Link } from "react-router-dom";
import ContextBuilder from './Contexts/Utils/ContextBuilder';
import AuthProvider from './Contexts/Auth/AuthProvider';
import UserPage from './Pages/UserPage';
import PasswordPage from './Pages/PasswordPage';
import LoginPage from './Pages/LoginPage';
import RecoveryPage from './Pages/RecoveryPage';
import UserProvider from './Contexts/User/UserProvider';
import HomePage from './Pages/HomePage';
import DashboardPage from './Pages/DashboardPage';
import NetworkEditPage from './Pages/NetworkEditPage';
import NetworkListPage from './Pages/NetworkListPage';
import ProductEditPage from './Pages/ProductEditPage';
import NetworkInsertPage from './Pages/NetworkInsertPage';
import NetworkProvider from './Contexts/Network/NetworkProvider';
import ProfileProvider from './Contexts/Profile/ProfileProvider';
import ProfileListPage from './Pages/ProfileListPage';
import ProfileEditPage from './Pages/ProfileEditPage';
import UserSearchPage from './Pages/UserSearchPage';
import ProductProvider from './Contexts/Product/ProductProvider';
import ProductSearchPage from './Pages/ProductSearchPage';
import RequestAccessPage from './Pages/RequestAccessPage';
import OrderProvider from './Contexts/Order/OrderProvider';
import Error404Page from './Pages/Error404Page';
import OrderSearchPage from './Pages/OrderSearchPage';
import InvoiceProvider from './Contexts/Invoice/InvoiceProvider';
import InvoiceSearchPage from './Pages/InvoiceSearchPage';
import ImageProvider from './Contexts/Image/ImageProvider';
import TemplateProvider from './Contexts/Template/TemplateProvider';
import { AuthProvider as NewAuthProvider } from './Contexts/AuthContext';
import { CampaignProvider } from './Contexts/CampaignContext';
import { ClientProvider } from './Contexts/ClientContext';
import { PrizeProvider } from './Contexts/PrizeContext';
import { WinnerProvider } from './Contexts/WinnerContext';
import { PublicCampaignProvider } from './Contexts/PublicCampaignContext';
import CampaignSearchPage from './Pages/CampaignSearchPage';
import CampaignBuilderPage from './Pages/CampaignBuilderPage';
import CampaignDetailPage from './Pages/CampaignDetailPage';
import ParticipantListPage from './Pages/ParticipantListPage';
import SubmissionModerationPage from './Pages/SubmissionModerationPage';
import WinnerSelectionPage from './Pages/WinnerSelectionPage';
import WidgetPage from './Pages/WidgetPage';
import PublicCampaignPage from './Pages/PublicCampaignPage';
import ScriptLoader from './Components/ScriptLoader';
import Header from './Components/Header';
import 'aos/dist/aos.css';

function Layout() {
  return (
    <>
      <Header />
      <main className="main"></main>
      <Outlet />
    </>
  );
}

function App() {
  const ContextContainer = ContextBuilder([
    AuthProvider, UserProvider, NetworkProvider, ProfileProvider, ProductProvider,
    OrderProvider, InvoiceProvider, ImageProvider, TemplateProvider,
    NewAuthProvider, CampaignProvider, ClientProvider, PrizeProvider, WinnerProvider, PublicCampaignProvider
  ]);

  return (
    <ContextContainer>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="campaigns">
            <Route index element={<CampaignSearchPage />} />
            <Route path="new" element={<CampaignBuilderPage />} />
            <Route path=":campaignId" element={<CampaignDetailPage />} />
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
      <ScriptLoader />
    </ContextContainer>
  );
}

export default App;
