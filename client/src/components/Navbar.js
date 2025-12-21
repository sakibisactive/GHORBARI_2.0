import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ role }) => {
  const navigate = useNavigate();
  const { lang, toggleLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);
  const [hasNotification, setHasNotification] = useState(false); 
  const toggleTheme = () => {
    if (darkMode) {
      document.body.removeAttribute('data-theme');
      setDarkMode(false);
    } else {
      document.body.setAttribute('data-theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleDeleteRequest = async () => {
      const confirmDelete = window.confirm("Are you sure you want to request account deletion?");
      if (confirmDelete) {
          try {
            const user = JSON.parse(localStorage.getItem('user'));
            await axios.put('http://localhost:5000/api/actions/delete-request', {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert('Deletion Request Sent to Admin.');
          } catch (err) {
            alert('Failed to send request.');
          }
      }
  };

  return (
    <nav className="navbar">
      <h2 style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
        {t('nav_title')} <span style={{ fontSize: '0.8rem' }}>({role && role.toUpperCase()})</span>
      </h2>
      
      <div className="nav-icons flex-center">
        <button onClick={toggleLanguage}>
            {lang === 'EN' ? '🇧🇩 BN' : '🇺🇸 EN'}
        </button>

        <button onClick={toggleTheme}>
            {darkMode ? '☀️' : '🌙'}
        </button>

        {/* PAYMENT ICON (Premium Only) */}
        {role === 'premium' && (
            <>
                <button onClick={() => navigate('/upgrade')} title="Pay" style={{ color: '#27ae60' }}>💳</button>
                <button onClick={() => navigate('/wishlist')} title="Wishlist" style={{ color: '#ff7675' }}>❤️</button>
                <button title="Notifications" style={{ color: hasNotification ? 'red' : 'inherit' }}>
                    {hasNotification ? '🔔' : '🔕'}
                </button>
            </>
        )}

        <button onClick={() => navigate('/stories')} title={t('nav_stories')}>📖</button>
        <button onClick={() => navigate('/faq')} title={t('nav_faq')}>❓</button>
        
        <button onClick={() => navigate('/profile')} title="Profile">👤</button>

        {role !== 'admin' && (
            <button onClick={handleDeleteRequest} title="Request Account Deletion" style={{ color: '#e74c3c' }}>
                🗑️
            </button>
        )}
        
        <button onClick={handleLogout} title={t('nav_logout')}>🚪</button>
      </div>
    </nav>
  );
};

export default Navbar;