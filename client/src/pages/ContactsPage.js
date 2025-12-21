import React, { useState } from 'react';
import axios from 'axios';
// NOTE: Navbar import REMOVED to fix double navbar issue

const ContactsPage = () => {
  const [view, setView] = useState('main'); // main, developer, interior, technician
  const [list, setList] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = user && user.token;

  const fetchServices = async (category) => {
    try {
        const res = await axios.get(`http://localhost:5000/api/public/services?category=${category}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setList(res.data);
        setView(category);
    } catch (error) {
        alert('Error loading services');
    }
  };

  const renderList = () => (
      <div style={{ width: '100%' }}>
          <div style={{ textAlign: 'left' }}>
            <button className="btn-primary" onClick={() => setView('main')} style={{ marginBottom: '20px' }}>⬅ Back</button>
          </div>
          <div className="grid-cards">
            {list.map(item => (
                <div key={item._id} className="card" style={{ padding: '20px', textAlign: 'left' }}>
                    <h3>{item.name}</h3>
                    <p>Contact: {item.contactInfo}</p>
                    {item.officeLocation && <p>Location: {item.officeLocation}</p>}
                    <p>Projects Done: {item.projectsCompleted}</p>
                </div>
            ))}
          </div>
      </div>
  );

  return (
    // FIX 1: Added styles here to Center Vertically & Horizontally
    <div className="container" style={{ 
        textAlign: 'center', 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center'
    }}>
      
      
      {view === 'main' ? (
          <div className="dashboard-grid">
              
              {/* BUTTON 1: Edit the text "DEVELOPERS" below to change it */}
              <button className="dash-btn" onClick={() => fetchServices('developer')}>
                  <span style={{fontSize: '5.5rem'}}>🏢</span>
                  DEVELOPERS
              </button>

              {/* BUTTON 2: Edit the text "INTERIOR DESIGN" below */}
              <button className="dash-btn" onClick={() => fetchServices('interior')}>
                  <span style={{fontSize: '5.5rem'}}>🛋️</span>
                  INTERIOR DESIGN
              </button>

              {/* BUTTON 3: Edit the text "TECHNICIANS" below */}
              <button className="dash-btn" onClick={() => fetchServices('technician')}>
                  <span style={{fontSize: '5.5rem'}}>🔧</span>
                  TECHNICIANS
              </button>

          </div>
      ) : renderList()}
    </div>
  );
};

export default ContactsPage;