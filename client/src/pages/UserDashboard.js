import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

// NOTE: Navbar import REMOVED to fix double navbar

const UserDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user'));
  const [savedSearches, setSavedSearches] = useState([]);

  useEffect(() => {
    if(!user) return navigate('/auth');

    // Fetch Saved Searches
    axios.get('http://localhost:5000/api/actions/save-search', {
        headers: { Authorization: `Bearer ${user.token}` }
    }).then(res => setSavedSearches(res.data)).catch(err => console.log(err));

  }, [navigate, user]);

  return (
    // Uses the same centering class as Premium Dashboard
    <div className="container center-screen-content">
      
      

      {/* Upgrade Banner */}
      <div style={{ padding: '20px', borderRadius: '10px', marginBottom: '30px', maxWidth: '600px', color: '#ffffffff', fontWeight: 'bold' }}>
          ⭐ WANT 360° VIEWS & PRICE ANALYSIS? 
          <button 
            style={{ marginLeft: '10px', padding: '8px 15px', background: '#0aa4caff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            onClick={() => navigate('/upgrade')}
          >
              UPGRADE NOW
          </button>
      </div>

      {/* DASHBOARD GRID (Same style as Premium) */}
      <div className="dashboard-grid">
         
         <button className="dash-btn" onClick={() => navigate('/explore')}>
            <span style={{fontSize: '2.5rem'}}>🔍</span>
            {t('explore_btn')}
         </button>

         

      </div>

      {/* Saved Searches Section */}
      {savedSearches.length > 0 && (
          <div className="card" style={{ marginTop: '40px', width: '100%', maxWidth: '800px', padding: '20px' }}>
              <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>💾 Saved Searches</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {savedSearches.map(s => (
                      <button 
                          key={s._id} 
                          className="btn-primary" 
                          style={{ fontSize: '0.9rem', padding: '8px 15px' }}
                          onClick={() => {
    // Pass the saved filters to Explore Page via state
    navigate('/explore', { state: { filters: s.filters } });
}}
                      >
                          {s.name}
                      </button>
                  ))}
              </div>
          </div>
      )}

    </div>
  );
};

export default UserDashboard;