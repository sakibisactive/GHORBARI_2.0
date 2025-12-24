import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ExplorePage = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state;
  const { t } = useLanguage();

  const user = JSON.parse(localStorage.getItem('user'));
  const isPremium = user && user.role === 'premium';

  const [filters, setFilters] = useState({
    type: '',
    searchType: '',
    location: '',
    priceSort: ''
  });

  const [properties, setProperties] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const areas = [
    "Mirpur", "Uttara", "Dhanmondi", "Gulistan",
    "Gulshan", "Badda", "Bashundhara", "Baridhara", "Farmgate"
  ];

  /* ---------------- LOAD SAVED FILTERS ---------------- */
  useEffect(() => {
  if (!user) return;

  // 1️⃣ If filters are passed via navigation, use them
  if (locationState?.filters) {
    setFilters(prev => {
      // Only update if different from current filters
      return JSON.stringify(prev) !== JSON.stringify(locationState.filters)
        ? locationState.filters
        : prev;
    });
    return;
  }

  // 2️⃣ Load last session filters for premium users
  if (isPremium) {
    const lastSession = localStorage.getItem(`premium_last_search_${user._id}`);
    if (lastSession) {
      const parsed = JSON.parse(lastSession);
      setFilters(prev => {
        // Only update if different from current filters
        return JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev;
      });
    }
  }
}, []); // Run only once on mount


  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);

    if (isPremium && user) {
      localStorage.setItem(
        `premium_last_search_${user._id}`,
        JSON.stringify(updated)
      );
    }
  };

  /* ---------------- SEARCH ---------------- */
  const handleSearch = async () => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await axios.get(
        `http://localhost:5000/api/public/search?${queryParams}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProperties(res.data);
      setHasSearched(true);
    } catch {
      alert('Error fetching properties');
    }
  };

  /* ---------------- SAVE SEARCH ---------------- */
  const handleSaveSearch = async () => {
    if (!isPremium) return alert("Only Premium Members can save searches.");

    const name = prompt("Enter a name for this search:");
    if (!name) return;

    try {
      await axios.post(
        'http://localhost:5000/api/actions/save-search',
        { name, filters },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Search Saved to Dashboard!");
    } catch {
      alert("Failed to save search");
    }
  };

  /* ---------------- STYLES ---------------- */

  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: hasSearched ? 'flex-start' : 'center',
    alignItems: 'center'
  };

  const searchBoxStyle = {
    width: '50%',
    padding: '20px',
    borderRadius: '10px',
    marginTop: hasSearched ? '20px' : '0'
  };

  const controlsStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  };

  const selectStyle = {
    width: '140px',
    padding: '7px 10px',
    borderRadius: '100px',
    border: '10px solid #16b7b4ff',
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: '23px',
    appearance: 'none',
    textAlign: 'center'
  };

  const buttonStyle = {
    padding: '7px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3498db',
    color: '#fff',
    fontSize: '23px',
    fontWeight: '600',
    cursor: 'pointer'
  };

  const saveButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#8e44ad'
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="container" style={pageStyle}>
      <div style={searchBoxStyle}>
        <div style={controlsStyle}>
          <select name="type" value={filters.type} onChange={handleChange} style={selectStyle}>
            <option value="">Property</option>
            <option value="apartment">Apartment</option>
            <option value="building">Building</option>
            <option value="plot">Plot</option>
          </select>

          <select name="searchType" value={filters.searchType} onChange={handleChange} style={selectStyle}>
            <option value="">Type</option>
            <option value="sell">Buy</option>
            <option value="rent">Rent</option>
          </select>

          <select name="location" value={filters.location} onChange={handleChange} style={selectStyle}>
            <option value="">Location</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select name="priceSort" value={filters.priceSort} onChange={handleChange} style={selectStyle}>
            <option value="">Price</option>
            <option value="low-high">Low → High</option>
            <option value="high-low">High → Low</option>
          </select>

          <button style={buttonStyle} onClick={handleSearch}>
            SEARCH
          </button>

          {isPremium && (
            <button style={saveButtonStyle} onClick={handleSaveSearch}>
              SAVE
            </button>
          )}
        </div>
      </div>

      {hasSearched && (
        <div className="grid-cards" style={{ marginTop: '30px', width: '100%' }}>
          {properties.length === 0 && (
            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              No properties found.
            </div>
          )}

          {properties.map(p => (
            <div
              key={p._id}
              className="card"
              onClick={() => navigate(`/property/${p._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={p.images?.[0] || "https://via.placeholder.com/300"}
                alt="Property"
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              />
              <div style={{ padding: '15px' }}>
                <h3>{p.type.toUpperCase()}</h3>
                <p><strong>{p.location}</strong></p>
                <p style={{ color: '#27ae60', fontWeight: 'bold' }}>
                  {p.price.toLocaleString()} TK
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
