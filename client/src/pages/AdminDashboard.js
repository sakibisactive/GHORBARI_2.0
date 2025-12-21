import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage(); // Get translation helper
  
  const [activeTab, setActiveTab] = useState('main'); 
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const config = {
    headers: { Authorization: `Bearer ${user?.token}` },
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      if (activeTab === 'main') return; 

      setLoading(true);
      try {
        let endpoint = '';
        if (activeTab === 'verification') endpoint = '/api/admin/verification';
        if (activeTab === 'property') endpoint = '/api/admin/properties';
        if (activeTab === 'story') endpoint = '/api/admin/stories';
        if (activeTab === 'deletion') endpoint = '/api/admin/deletion-requests';

        if (endpoint) {
          const res = await axios.get(`http://localhost:5000${endpoint}`, config);
          if (Array.isArray(res.data)) {
            setData(res.data);
          } else {
            setData([]); 
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]); 
      }
      setLoading(false);
    };

    fetchData();
  }, [activeTab, navigate]);

  // ACTIONS
  const approveUser = async (id) => {
    if(!window.confirm("Approve this user for Premium?")) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/verify/${id}`, {}, config);
      alert("User Approved!");
      setData(data.filter(u => u._id !== id));
    } catch (err) { alert('Action failed'); }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/property-status/${id}`, {}, config);
      setData(data.map(item => item._id === id ? { ...item, status: item.status === 'available' ? 'unavailable' : 'available' } : item));
    } catch (err) { alert('Action failed'); }
  };

  const reviewStory = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/story-review/${id}`, { status }, config);
      setData(data.filter(item => item._id !== id));
    } catch (err) { alert('Action failed'); }
  };

  const handleDeleteUser = async (id, email) => {
      const confirm = window.prompt(`Type "DELETE" to confirm deleting user: ${email}`);
      if (confirm === 'DELETE') {
          try {
              await axios.delete(`http://localhost:5000/api/admin/users/${id}`, config);
              alert('User Account Deleted Permanently.');
              setData(data.filter(u => u._id !== id));
          } catch (err) {
              alert('Failed to delete user.');
          }
      }
  };

  // RENDER CONTENT
  const renderContent = () => {
    if (loading) return <div style={{color: 'white', marginTop: '20px'}}>{t('loading')}</div>;
    if (!data) return null;

    if (activeTab === 'verification') {
      return (
        <div className="grid-cards">
          {data.length === 0 && <div className="card"><p>No pending verification requests.</p></div>}
          {data.map(u => (
            <div key={u._id} className="card">
              <h3>{u.email}</h3>
              <p>{t('admin_req_premium')}</p>
              <p>{t('admin_referral')} {u.referralUsed || t('admin_none')}</p>
              <button className="btn-primary" onClick={() => approveUser(u._id)}>{t('admin_approve_btn')}</button>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'deletion') {
        return (
          <div className="grid-cards">
            {data.length === 0 && <div className="card"><p>No pending deletion requests.</p></div>}
            {data.map(u => (
              <div key={u._id} className="card" style={{ border: '1px solid red' }}>
                <h3 style={{color: 'red'}}>{t('admin_delete_req_title')}</h3>
                <p><strong>Email:</strong> {u.email}</p>
                <p><strong>Role:</strong> {u.role}</p>
                <button 
                    className="btn-primary" 
                    style={{ background: 'red' }} 
                    onClick={() => handleDeleteUser(u._id, u.email)}
                >
                    {t('admin_confirm_delete')}
                </button>
              </div>
            ))}
          </div>
        );
      }

    if (activeTab === 'property') {
      return (
        <div style={{overflowX: 'auto', background: 'var(--card-bg)', padding: '20px', borderRadius: '10px'}}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ textAlign: 'left', background: 'var(--accent-color)', color: 'white' }}>
                <th style={{padding: '10px'}}>{t('th_type')}</th>
                <th style={{padding: '10px'}}>{t('th_location')}</th>
                <th style={{padding: '10px'}}>{t('th_owner')}</th>
                <th style={{padding: '10px'}}>{t('th_price')}</th>
                <th style={{padding: '10px'}}>{t('th_status')}</th>
                <th style={{padding: '10px'}}>{t('th_action')}</th>
                </tr>
            </thead>
            <tbody>
                {data.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{padding: '10px'}}>{p.type}</td>
                    <td style={{padding: '10px'}}>{p.location}</td>
                    <td style={{padding: '10px', fontSize:'0.9rem', color:'#555'}}>
                        {p.ownerEmail || p.email || "Unknown"}
                    </td>
                    <td style={{padding: '10px'}}>{p.price} TK</td>
                    
                    <td style={{
                        padding: '10px', 
                        color: p.status === 'available' ? 'var(--accent-color)' : 'red', 
                        fontWeight: 'bold' 
                    }}>
                        {p.status === 'available' ? t('status_available') : t('status_unavailable')}
                    </td>
                    
                    <td style={{padding: '10px'}}>
                    <button className="btn-primary" style={{padding: '5px 10px', fontSize: '0.8rem'}} onClick={() => toggleStatus(p._id)}>
                        {p.status === 'available' ? t('btn_mark_unavailable') : t('btn_mark_available')}
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      );
    }

    if (activeTab === 'story') {
      return (
        <div className="grid-cards">
           {data.length === 0 && <div className="card"><p>No pending stories.</p></div>}
           {data.map(s => (
             <div key={s._id} className="card">
               <h4>{s.title}</h4>
               <p style={{fontStyle: 'italic'}}>By: {s.authorName}</p>
               <p>{s.content}</p>
               <div style={{marginTop: '10px', display: 'flex', gap: '10px'}}>
                    <button className="btn-primary" onClick={() => reviewStory(s._id, 'approved')}>{t('btn_accept')}</button>
                    <button className="btn-primary" style={{ background: 'red' }} onClick={() => reviewStory(s._id, 'rejected')}>{t('btn_reject')}</button>
               </div>
             </div>
           ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={activeTab === 'main' ? "container center-screen-content" : "container"}>
      
      {activeTab === 'main' ? (
        <>
            <div className="dashboard-grid">
                {/* --- MAIN DASHBOARD BUTTONS --- */}
                <button className="dash-btn" onClick={() => setActiveTab('verification')}>
                    <span style={{fontSize: '2.5rem'}}>👥</span>
                    {t('admin_verification')}
                </button>

                <button className="dash-btn" onClick={() => setActiveTab('property')}>
                    <span style={{fontSize: '2.5rem'}}>🏠</span>
                    {t('admin_properties')}
                </button>

                <button className="dash-btn" onClick={() => setActiveTab('story')}>
                    <span style={{fontSize: '2.5rem'}}>📝</span>
                    {t('admin_stories')}
                </button>

                <button className="dash-btn" onClick={() => setActiveTab('deletion')}>
                    <span style={{fontSize: '2.5rem'}}>🗑️</span>
                    {t('admin_deletion')}
                </button>
            </div>
        </>
      ) : (
        <div style={{ marginTop: '40px' }}>
            <button className="btn-primary" onClick={() => setActiveTab('main')} style={{ marginBottom: '20px' }}>
                {t('admin_back_btn')}
            </button>
            {renderContent()}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;