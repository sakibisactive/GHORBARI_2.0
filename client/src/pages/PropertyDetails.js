import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PropertyDetails = () => {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [userRating, setUserRating] = useState('5');

  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;

  const isPremium = user?.role === 'premium';
  const isAdmin = user?.role === 'admin';

  // Fetch property details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/public/property/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProperty(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchDetails();
  }, [id, token]);

  if (!property) {
    return (
      <div className="container" style={{ color: 'white' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  // Check if current user is owner
  const isOwner =
    user &&
    property.ownerId &&
    (property.ownerId === user._id || property.ownerId._id === user._id);

  // Event Handlers
  const handlePrint = () => window.print();

  const handleMeet = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/actions/meet-request',
        { propertyId: property._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Meeting request sent to Admin! Check email for details later.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  // Replace the old handleOffer with this:
  const handleOffer = async () => { 
      if(!offerPrice || offerPrice <= 0) return alert("Please enter a valid amount");
      
      try {
          await axios.post('http://localhost:5000/api/actions/offer', 
            { propertyId: id, amount: offerPrice },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert(`Offer of ${offerPrice} TK sent successfully! The owner has been notified.`);
          setOfferPrice(''); // Clear input
      } catch (err) {
          alert("Failed to send offer.");
      }
  };

  const addToWishlist = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/actions/wishlist',
        { propertyId: property._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Wishlist Updated');
    } catch {
      alert('Error adding to wishlist');
    }
  };

  const handleRate = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/public/property/${id}/rate`,
        { rating: userRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Thanks for rating!');
    } catch {
      alert('Error rating');
    }
  };

  return (
    <div className="container">
      <div
        style={{
          background: 'var(--card-bg)',
          padding: '30px',
          marginTop: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <h2>{property.type.toUpperCase()} - {property.location}</h2>
<p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '10px' }}>
    Property ID: <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>
        {property._id.slice(-6).toUpperCase()}
    </span>
</p>

          {/* PDF & Wishlist (hide if owner) */}
          {!isOwner && (
            <div>
              <button
                onClick={handlePrint}
                className="btn-primary no-print"
                style={{
                  marginRight: '10px',
                  background: '#34495e',
                  fontSize: '0.9rem',
                }}
              >
                🖨️ PDF
              </button>
              <button
                onClick={addToWishlist}
                className="no-print"
                style={{
                  background: '#ff7675',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                }}
                title="Add to Wishlist"
              >
                ❤️
              </button>
            </div>
          )}
        </div>

        <div
          className="grid-cards"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
        >
          {/* Property Image */}
          <div>
            <img
              src={
                property.images && property.images[0]
                  ? property.images[0]
                  : 'https://via.placeholder.com/400'
              }
              alt="Property"
              style={{
                width: '100%',
                borderRadius: '10px',
                maxHeight: '400px',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Property Details */}
          <div>
            <h2 style={{ color: '#27ae60', marginTop: 0 }}>
              {property.price.toLocaleString()} TK
            </h2>

            <div
              style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                margin: '15px 0',
              }}
            >
              <p><strong>Status:</strong> {property.searchType === 'sell' ? 'For Sale' : 'For Rent'}</p>
              <p><strong>Size:</strong> {property.details.size} sq ft</p>
              <p><strong>Floor:</strong> {property.details.floor || 'N/A'}</p>
              <p><strong>Details:</strong> {property.details.description || 'No description provided.'}</p>
              <p><strong>Rating:</strong> {property.rating} / 5 ⭐</p>
            </div>

            {/* Premium / Admin Section */}
            {(isPremium || isAdmin) ? (
              <div style={{ marginTop: '20px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                <h3 style={{ color: '#d35400' }}>👑 Premium Content</h3>
                <p><strong>Owner Contact:</strong> {property.contactEmail || 'Hidden'}</p>

                {/* Meeting & Offer (hide if owner) */}
                {!isOwner && (
                  <div className="no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="btn-primary" onClick={handleMeet}>
                      🤝 MEET OWNER
                    </button>

                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input
                        type="number"
                        placeholder="Offer Price"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        style={{ width: '150px' }}
                      />
                      <button
                        className="btn-primary"
                        onClick={handleOffer}
                        style={{ background: '#27ae60' }}
                      >
                        OFFER
                      </button>
                    </div>
                  </div>
                )}

                {/* ⭐ Rating (only premium and not owner) */}
                {isPremium && !isOwner && (
                  <div style={{ marginTop: '15px' }}>
                    <label>Rate this Property: </label>
                    <select
                      value={userRating}
                      onChange={(e) => setUserRating(e.target.value)}
                      style={{ padding: '5px', marginLeft: '10px' }}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                    <button
                      className="btn-primary"
                      onClick={handleRate}
                      style={{ marginLeft: '10px' }}
                    >
                      Rate
                    </button>
                  </div>
                )}

                {/* 360° View */}
                <h3 style={{ marginTop: '25px' }}>360° View Simulator</h3>
                <div className="img-box">
                  <iframe
                    width="600"
                    height="350"
                    frameBorder="0"
                    src="https://momento360.com/e/u/94c06bdff792487ab3e3bca940d233ba?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true"
                    title="360-view"
                  ></iframe>
                </div>
                <p style={{ fontSize: '0.8rem' }}>
                  (Interactive view in real deployment)
                </p>
              </div>
            ) : (
              <div
                className="no-print"
                style={{
                  background: '#fff3cd',
                  color: '#856404',
                  padding: '15px',
                  marginTop: '20px',
                  borderRadius: '8px',
                  border: '1px solid #ffeeba',
                }}
              >
                <h3>🔒 Premium Features Locked</h3>
                <ul>
                  <li>Owner Contact Details</li>
                  <li>360° Property View</li>
                  <li>Price Negotiation</li>
                  <li>Meeting Scheduler</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
