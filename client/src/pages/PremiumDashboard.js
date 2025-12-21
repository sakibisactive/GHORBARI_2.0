import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// NOTE: No Navbar import here because it is in App.js now

const PremiumDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    // Updated container styles to center content vertically and horizontally
    <div className="container" style={{ 
      textAlign: 'center', 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      
      {/* 1. WELCOME MESSAGE */}
      
      
      {/* 2. DASHBOARD GRID (Forces Horizontal Layout) */}
      <div className="dashboard-grid">
        
        <button className="dash-btn" onClick={() => navigate('/explore')}>
          <span style={{fontSize: '2.5rem'}}>🔍</span>
          {t('explore_btn') || "EXPLORE"}
        </button>

        <button className="dash-btn" onClick={() => navigate('/suggestion')}>
          <span style={{fontSize: '2.5rem'}}>💡</span>
          {t('suggestion_btn') || "SUGGESTION"}
        </button>

        <button className="dash-btn" onClick={() => navigate('/price-analysis')}>
          <span style={{fontSize: '2.5rem'}}>📈</span>
          {t('analysis_btn') || "PRICE ANALYSIS"}
        </button>

        <button className="dash-btn" onClick={() => navigate('/contacts')}>
          <span style={{fontSize: '2.5rem'}}>📞</span>
          {t('contacts_btn') || "CONTACTS"}
        </button>

        <button className="dash-btn" onClick={() => navigate('/advertise')}>
          <span style={{fontSize: '2.5rem'}}>📢</span>
          {t('advertise_btn') || "ADVERTISE"}
        </button>

      </div>
    </div>
  );
};

export default PremiumDashboard;