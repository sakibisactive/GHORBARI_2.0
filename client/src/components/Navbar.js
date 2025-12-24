import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ role }) => {
  const navigate = useNavigate();
  const { lang, toggleLanguage, t } = useLanguage();
  
  // State
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  
  // User Data
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;

  // 1. Fetch Notifications on Mount (If user exists)
  useEffect(() => {
    if (token) {
        axios.get('http://localhost:5000/api/actions/notifications', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setNotifications(res.data))
        .catch(err => console.log("Notification fetch error (Ignore if not logged in)"));
    }
  }, [token]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 2. Handle Bell Click (Toggle Dropdown & Mark as Read)
  const handleBellClick = async () => {
      if (!showNotifDropdown && unreadCount > 0) {
          try {
              // Mark all as read in Backend
              await axios.put('http://localhost:5000/api/actions/notifications/read', {}, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              // Mark locally as read to remove red dot immediately
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          } catch(err) { console.error(err); }
      }
      setShowNotifDropdown(!showNotifDropdown);
  };

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
            await axios.put('http://localhost:5000/api/actions/delete-request', {}, {
                headers: { Authorization: `Bearer ${token}` }
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

        {/* --- PREMIUM FEATURES (Payment, Wishlist, Notifications) --- */}
        {role === 'premium' && (
            <>
                <button onClick={() => navigate('/upgrade')} title="Pay / Renew" style={{ color: '#27ae60' }}>💳</button>
                <button onClick={() => navigate('/wishlist')} title="Wishlist" style={{ color: '#ff7675' }}>❤️</button>
                
                {/* NOTIFICATION BELL AREA */}
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button 
                        onClick={handleBellClick} 
                        title="Notifications" 
                        style={{ position: 'relative', color: unreadCount > 0 ? 'red' : 'inherit' }}
                    >
                        {unreadCount > 0 ? '🔔' : '🔕'}
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: -5, right: -5,
                                background: 'red', color: 'white', borderRadius: '50%',
                                width: '15px', height: '15px', fontSize: '0.7rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* NOTIFICATION DROPDOWN */}
                    {showNotifDropdown && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '50px',
                            width: '300px',
                            backgroundColor: '#2c3e50',
                            color: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                            zIndex: 1000,
                            padding: '10px',
                            textAlign: 'left'
                        }}>
                            <h4 style={{ borderBottom: '1px solid #555', paddingBottom: '5px', margin: '0 0 10px 0' }}>Notifications</h4>
                            
                            {notifications.length === 0 && <p style={{color:'#aaa', fontSize:'0.9rem'}}>No notifications</p>}
                            
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {notifications.map(n => (
                                    <div key={n._id} style={{ 
                                        padding: '10px', 
                                        borderBottom: '1px solid #444', 
                                        fontSize: '0.85rem',
                                        opacity: n.isRead ? 0.6 : 1,
                                        backgroundColor: n.isRead ? 'transparent' : 'rgba(255,255,255,0.1)'
                                    }}>
                                        <p style={{ margin: '0 0 5px 0' }}>{n.message}</p>
                                        <small style={{ color: '#aaa' }}>{new Date(n.createdAt).toLocaleDateString()}</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
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