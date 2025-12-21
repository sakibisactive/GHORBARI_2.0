import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WishlistPage = () => {
  const [rentList, setRentList] = useState([]);
  const [sellList, setSellList] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) return navigate('/auth');

    const fetchWishlist = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/premium/wishlist', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setRentList(res.data.forRent);
            setSellList(res.data.forSell);
        } catch (err) { console.error(err); }
    };
    fetchWishlist();
  }, [user, navigate]);

  const renderSection = (title, list) => (
      <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: 'white', textShadow: '1px 1px 2px black', borderBottom: '2px solid white', paddingBottom: '10px', display: 'inline-block' }}>
              {title} ({list.length})
          </h2>
          {list.length === 0 && <p style={{ color: '#eee' }}>No properties in this list.</p>}
          
          <div className="grid-cards">
              {list.map(p => (
                  <div key={p._id} className="card" onClick={() => navigate(`/property/${p._id}`)} style={{ cursor: 'pointer' }}>
                      <img src={p.images && p.images[0] ? p.images[0] : "https://via.placeholder.com/300"} alt="prop" style={{ height: '150px' }} />
                      <div style={{ padding: '15px' }}>
                          <h4>{p.type.toUpperCase()} - {p.location}</h4>
                          <p style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{p.price.toLocaleString()} TK</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div className="container" style={{ marginTop: '40px' }}>
      <h1 style={{ textAlign: 'center', color: 'white', marginBottom: '40px', textShadow: '2px 2px 4px black' }}>My Wishlist ❤️</h1>
      {renderSection("Properties For Sale", sellList)}
      {renderSection("Properties For Rent", rentList)}
    </div>
  );
};

export default WishlistPage;