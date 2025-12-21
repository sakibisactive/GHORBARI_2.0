import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// NOTE: Navbar import REMOVED to fix double navbar issue

const ExplorePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user'));

  const [filters, setFilters] = useState({
    type: '', searchType: '', location: '', priceSort: ''
  });
  const [properties, setProperties] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const areas = ["Mirpur", "Uttara", "Dhanmondi", "Gulistan", "Gulshan", "Badda", "Bashundhara", "Baridhara", "Farmgate"];

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = async () => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:5000/api/public/search?${queryParams}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProperties(res.data);
      setHasSearched(true);
    } catch (error) {
      alert('Error fetching properties');
    }
  };

  const handleSaveSearch = async () => {
      const name = prompt("Enter a name for this search:");
      if(name) {
          try {
            await axios.post('http://localhost:5000/api/actions/save-search', 
                { name, filters }, 
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            alert('Search Saved!');
          } catch(err) { alert('Error saving search'); }
      }
  };

  return (
    // Navbar component removed from here
    <div className="container">
      {/* Adding top margin to push content below the fixed global navbar */}
      <div style={{ marginTop: '40px' }}> 
        <h1 style={{ color: 'white', textShadow: '2px 2px 4px black', textAlign: 'center' }}>
            {t('search_header')}
        </h1>
        
        <div className="form-container" style={{ maxWidth: '100%', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          {/* 1. PROPERTY TYPE ICON */}
          <select name="type" onChange={handleChange} value={filters.type} style={{flex: '1 1 200px'}}>
            <option value="">🏠 </option> 
            <option value="plot">Plot</option>
            <option value="apartment">Apartment</option>
            <option value="building">Building</option>
          </select>

          {/* 2. SEARCH TYPE ICON (Magnifying Glass) */}
          <select name="searchType" onChange={handleChange} value={filters.searchType} style={{flex: '1 1 200px'}}>
            <option value="">🔍 </option>
            <option value="sell">{t('sell')}</option>
            <option value="rent">{t('rent')}</option>
          </select>

          {/* 3. LOCATION ICON */}
          <select name="location" onChange={handleChange} value={filters.location} style={{flex: '1 1 200px'}}>
            <option value="">📍 </option>
            {areas.sort().map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* 4. PRICE ICON (Dollar) */}
          <select name="priceSort" onChange={handleChange} value={filters.priceSort} style={{flex: '1 1 200px'}}>
            <option value="">💲 </option>
            <option value="low-high">Low to High</option>
            <option value="high-low">High to Low</option>
          </select>
          
          <div style={{flex: '1 1 100%', display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px'}}>
            <button className="btn-primary" onClick={handleSearch} style={{minWidth: '150px'}}>{t('search_btn')}</button>
            <button className="btn-primary" style={{ background: '#8e44ad', minWidth: '150px' }} onClick={handleSaveSearch}>💾 Save Search</button>
          </div>
        </div>

        <div className="grid-cards" style={{ marginTop: '30px' }}>
          {hasSearched && properties.length === 0 && (
              <div className="card" style={{padding: '20px', textAlign: 'center', width: '100%'}}>
                  <p>No properties found matching your criteria.</p>
              </div>
          )}

          {properties.map(p => (
            <div key={p._id} className="card" onClick={() => navigate(`/property/${p._id}`)} style={{ cursor: 'pointer' }}>
               <img 
                  src={p.images && p.images[0] ? p.images[0] : "https://via.placeholder.com/300"} 
                  alt="Prop" 
               />
               <h3>ID: {p._id.substring(p._id.length - 6).toUpperCase()}</h3>
               <p style={{fontWeight: 'bold'}}>{p.type.toUpperCase()} - {p.location}</p>
               <p style={{ color: '#27ae60', fontSize: '1.1rem', fontWeight: 'bold' }}>{p.price.toLocaleString()} TK</p>
               <div style={{padding: '0 15px 15px'}}>
                   <button className="btn-primary" style={{width: '100%', fontSize: '0.8rem'}}>View Details</button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;