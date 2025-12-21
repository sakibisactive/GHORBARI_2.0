import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({ total: 0, rentCount: 0, sellCount: 0 });
  const [myProperties, setMyProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }

    // Fetch Stats & Properties if Premium
    if (user.role === 'premium') {
        axios.get('http://localhost:5000/api/premium/profile-stats', {
            headers: { Authorization: `Bearer ${user.token}` }
        }).then(res => {
            setStats(res.data.stats);
            setMyProperties(res.data.properties);
        }).catch(err => console.error(err));
    }
  }, [user, navigate]);

  const handleUpdatePrice = async (id) => {
      try {
          await axios.put(`http://localhost:5000/api/premium/property/${id}/price`, { newPrice }, {
              headers: { Authorization: `Bearer ${user.token}` }
          });
          alert('Price Updated! Notifications sent to interested buyers.');
          setEditingId(null);
          // Refresh list locally
          setMyProperties(prev => prev.map(p => p._id === id ? { ...p, price: newPrice } : p));
      } catch (err) { alert('Failed to update'); }
  };

  return (
    <div className="container center-screen-content" style={{justifyContent: 'flex-start', paddingTop: '40px'}}>
      
      {/* 1. BASIC PROFILE CARD - Visible to ALL logged in users */}
      {user && (
      <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '30px' }}>
        <h2>{user.email}</h2>
        <span style={{ 
            background: 'var(--accent-color)', color: 'white', 
            padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' 
        }}>
            {user.role.toUpperCase()} MEMBER
        </span>
      </div>
      )}

      {/* 2. UPGRADE BANNER - Visible ONLY to 'user' role */}
      {user?.role === 'user' && (
      <div style={{ padding: '20px', borderRadius: '10px', marginBottom: '30px', maxWidth: '600px', color: '#ffffffff', fontWeight: 'bold' }}>
          ⭐ WANT 360° VIEWS & PRICE ANALYSIS? 
          <button 
            style={{ marginLeft: '10px', padding: '8px 15px', background: '#0aa4caff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            onClick={() => navigate('/upgrade')}
          >
              UPGRADE NOW
          </button>
      </div>
      )}

      {/* 3. PREMIUM STATS SECTION - Visible ONLY to 'premium' role */}
      {user?.role === 'premium' && (
          <div style={{ width: '100%', maxWidth: '800px', marginTop: '30px' }}>
              
              {/* Stats Grid */}
              <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  <div className="card" style={{ textAlign: 'center', background: '#34495e', color: 'white' }}>
                      <h3>Total Properties</h3>
                      <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.total}</p>
                  </div>
                  <div className="card" style={{ textAlign: 'center', background: '#34495e', color: 'white' }}>
                      <h3>For Rent</h3>
                      <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.rentCount}</p>
                  </div>
                  <div className="card" style={{ textAlign: 'center', background: '#34495e', color: 'white' }}>
                      <h3>For Sale</h3>
                      <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.sellCount}</p>
                  </div>
              </div>

              {/* Owned Properties List */}
              <h3 style={{ marginTop: '40px', color: 'white', textShadow: '1px 1px 2px black' }}>My Properties</h3>
              <div className="grid-cards">
                  {myProperties.map(p => (
                      <div key={p._id} className="card" style={{ textAlign: 'left', padding: '20px' }}>
                          <h4>{p.type.toUpperCase()} in {p.location}</h4>
                          <p style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
                              {p.searchType.toUpperCase()} - {p.price} TK
                          </p>
                          
                          {/* Edit Price Section */}
                          {editingId === p._id ? (
                              <div style={{ marginTop: '10px' }}>
                                  <input 
                                    type="number" 
                                    placeholder="New Price" 
                                    value={newPrice} 
                                    onChange={e => setNewPrice(e.target.value)}
                                    style={{ width: '100px', marginRight: '10px' }}
                                  />
                                  <button className="btn-primary" onClick={() => handleUpdatePrice(p._id)} style={{ fontSize: '0.8rem' }}>Save</button>
                                  <button onClick={() => setEditingId(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>Cancel</button>
                              </div>
                          ) : (
                              <div style={{ marginTop: '15px' }}>
                                  <button className="btn-primary" onClick={() => navigate(`/property/${p._id}`)} style={{ fontSize: '0.8rem', marginRight: '10px' }}>View</button>
                                  <button className="btn-primary" onClick={() => setEditingId(p._id)} style={{ fontSize: '0.8rem', background: '#34495e' }}>Edit Price</button>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default ProfilePage;