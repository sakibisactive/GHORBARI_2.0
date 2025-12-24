import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token; 
  
  const [stats, setStats] = useState({ total: 0, rentCount: 0, sellCount: 0 });
  const [myProperties, setMyProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    if (!token) { 
        navigate('/auth'); 
        return; 
    }

    if (user.role === 'premium') {
        axios.get('http://localhost:5000/api/premium/profile-stats', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setStats(res.data.stats);
            setMyProperties(res.data.properties);
        }).catch(err => console.error(err));
    }
  }, [token, navigate, user.role]);

  const handleUpdatePrice = async (id) => {
      try {
          await axios.put(`http://localhost:5000/api/premium/property/${id}/price`, { newPrice }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          alert('Price Updated!');
          setEditingId(null);
          setMyProperties(prev => prev.map(p => p._id === id ? { ...p, price: newPrice } : p));
      } catch(err) { alert("Failed to update"); }
  };

  const handleToggleStatus = async (id, currentStatus) => {
      try {
          const res = await axios.put(`http://localhost:5000/api/premium/property/${id}/status`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setMyProperties(prev => prev.map(item => 
              item._id === id ? { ...item, status: res.data.status } : item
          ));
      } catch(err) { alert("Failed to update status"); }
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', color: 'white', marginTop: '20px' }}>DASHBOARD</h1>
      
      {/* STATS */}
      <div className="dashboard-grid">
          <div className="card" style={{ padding: '20px' }}>
              <h3>TOTAL</h3>
              <p style={{ fontSize: '5rem', color: '#13ebffff' }}>{stats.total}</p>
          </div>
          <div className="card" style={{ padding: '20px' }}>
              <h3>RENT</h3>
              <p style={{ fontSize: '5rem', color: '#13ebffff' }}>{stats.rentCount}</p>
          </div>
          <div className="card" style={{ padding: '20px' }}>
              <h3>SALE</h3>
              <p style={{ fontSize: '5rem', color: '#13ebffff' }}>{stats.sellCount}</p>
          </div>
      </div>

      {/* PROPERTIES LIST */}
      <h2 style={{ color: 'white', marginTop: '40px', borderBottom: '2px solid white', display: 'inline-block' }}>My Properties</h2>
      
      <div className="grid-cards" style={{ marginTop: '20px' }}>
          {myProperties.map(p => (
              <div key={p._id} className="card" style={{ padding: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                  
                  {/* Left Side: Image & Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={p.images[0] || "https://via.placeholder.com/100"} alt="prop" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px' }} />
                      <div style={{ textAlign: 'left' }}>
                          <h4 style={{ margin: 0, color: '#fff' }}>{p.type.toUpperCase()} - {p.location}</h4>
                          
                          <p style={{ fontSize: '0.85rem', color: '#f1c40f', fontWeight: 'bold', margin: '3px 0' }}>
                              ID: {p._id.slice(-6).toUpperCase()}
                          </p>

                          <p style={{ margin: '5px 0', color: '#ccc' }}>{p.price} TK</p>
                          
                          {/* --- STATUS REPLACED WITH DOT --- */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                              <span style={{ fontSize: '0.8rem', color: '#ccc' }}>Status:</span>
                              <div 
                                title={p.status === 'available' ? "Available" : "Unavailable"}
                                style={{ 
                                  width: '12px', 
                                  height: '12px', 
                                  borderRadius: '50%', 
                                  // Green (#2ecc71) if Available, Red (#e74c3c) if Unavailable
                                  backgroundColor: p.status === 'available' ? '#2ecc71' : '#e74c3c',
                                  boxShadow: p.status === 'available' ? '0 0 5px #2ecc71' : '0 0 5px #e74c3c'
                                }}
                              ></div>
                          </div>
                          {/* -------------------------------- */}

                      </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div>
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <button className="btn-primary" onClick={() => navigate(`/property/${p._id}`)} style={{ fontSize: '0.8rem', marginRight: '10px' }}>
                                  View
                              </button>
                              
                              <button className="btn-primary" onClick={() => setEditingId(p._id)} style={{ fontSize: '0.8rem', background: '#34495e' }}>
                                  Edit Price
                              </button>

                              <button 
                                  className="btn-primary" 
                                  onClick={() => handleToggleStatus(p._id, p.status)} 
                                  style={{ 
                                      fontSize: '0.8rem', 
                                      background: p.status === 'available' ? '#720000ff' : '#27ae60' 
                                  }}
                              >
                                  {p.status === 'available' ? "Mark Unavailable" : "Mark Available"}
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default ProfilePage;