import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    // We remove the local background logic here and force transparency
    // so the global BackgroundSlideshow.js works perfectly.
    <div className="hero-section" style={{ background: 'transparent', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', color: 'white', zIndex: 1 }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '20px', textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
          {t('hero_title') || "GHORBARI"}
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '40px', textShadow: '1px 1px 5px rgba(0,0,0,0.7)' }}>
          {t('hero_subtitle') || "Find your dream property today"}
        </p>
        <button className="big-btn" onClick={() => navigate('/auth')}>
          {t('hero_btn') || "GET STARTED"}
        </button>
      </div>
    </div>
  );
};

export default LandingPage;