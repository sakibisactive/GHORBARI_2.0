import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import BackgroundSlideshow from './components/BackgroundSlideshow';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import PremiumDashboard from './pages/PremiumDashboard';
import UserDashboard from './pages/UserDashboard';
import ExplorePage from './pages/ExplorePage';
import PropertyDetails from './pages/PropertyDetails';
import ContactsPage from './pages/ContactsPage';
import StoriesPage from './pages/StoriesPage';
import FAQPage from './pages/FAQPage';
import UpgradePage from './pages/UpgradePage';
import PriceAnalysis from './pages/PriceAnalysis';
import SuggestionPage from './pages/SuggestionPage';
import AdvertisePage from './pages/AdvertisePage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage'; // Ensure this file exists

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = ['/', '/auth'].includes(location.pathname);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user ? user.role : 'guest';

  return (
    <>
      {!hideNavbar && <Navbar role={role} />}
      {children}
    </>
  );
};

function App() {
  return (
    <LanguageProvider>
      <BackgroundSlideshow />
      <Router>
        <Layout>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/premium-dashboard" element={<PremiumDashboard />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/upgrade" element={<UpgradePage />} />
              <Route path="/price-analysis" element={<PriceAnalysis />} />
              <Route path="/suggestion" element={<SuggestionPage />} />
              <Route path="/advertise" element={<AdvertisePage />} />
              
              {/* NEW ROUTES */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
            </Routes>
          </div>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;