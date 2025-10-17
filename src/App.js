import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ToastContainer';
import { ThemeProvider } from './contexts/ThemeContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import AppHomePage from './components/AppHomePage';
import BrandRegistration from './components/BrandRegistration';
import InfluencerRegistration from './components/InfluencerRegistration';
import InfluencerDashboard from './components/InfluencerDashboard';
import BrandLogin from './components/BrandLogin';
import InfluencerLogin from './components/InfluencerLogin';
import AdminLogin from './components/AdminLogin';
import BrandDashboard from './components/BrandDashboard';
import CreateCampaign from './components/CreateCampaign';
import UpdateCampaign from './components/UpdateCampaign';
import CampaignProposals from './components/CampaignProposals';
import AdminDashboard from './components/AdminDashboard';
import Chat from './components/Chat';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import BrandProfile from './components/BrandProfile';
import InfluencerProfile from './components/InfluencerProfile';
import NotFound from './components/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <div id="app">
            <NavBar />
            <div className="app-content">
              <Routes>
                <Route path="/" element={<AppHomePage />} />
                <Route path="/brand-register" element={<BrandRegistration />} />
                <Route path="/influencer-register" element={<InfluencerRegistration />} />
                <Route path="/brand-login" element={<BrandLogin />} />
                <Route path="/influencer-login" element={<InfluencerLogin />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/influencer-dashboard" element={<InfluencerDashboard />} />
                <Route path="/brand-dashboard" element={<BrandDashboard />} />
                <Route path="/create-campaign" element={<CreateCampaign />} />
                <Route path="/update-campaign/:campaignId" element={<UpdateCampaign />} />
                <Route path="/campaign/:campaignId/proposals" element={<CampaignProposals />} />
                <Route path="/campaign/:campaignId/proposals/:proposalId/chat" element={<Chat />} />
                <Route path="/brand/:brandId" element={<BrandProfile />} />
                <Route path="/influencer/:influencerId" element={<InfluencerProfile />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
