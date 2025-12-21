import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
// NOTE: Navbar import REMOVED to fix double navbar issue

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user'));
  // Safe checks
  const isPremium = user && user.role === 'premium';
  const isAdmin = user && user.role === 'admin';
  const token = user && user.token;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/public/property/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProperty(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if(token) fetchDetails();
  }, [id, token]);

  const handlePrint = () => {
      window.print();
  };

  const handleMeet = async () => { 
      alert("Meeting request sent to Admin!");
  };
  
  const handleOffer = () => { 
      alert(`Offer of ${offerPrice} TK sent successfully!`); 
  };
  
  const addToWishlist = async () => {
      try {
        await axios.post('http://localhost:5000/api/actions/wishlist', { propertyId: property._id }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert('Wishlist Updated');
      } catch(err) { alert("Error adding to wishlist"); }
  };

  if (!property) return <div className="container" style={{color:'white'}}><h1>Loading...</h1></div>;

  // CHECK: Is the logged-in user the owner of this property?
  // property.ownerId might be populated object or just ID depending on backend controller
  const isOwner = user && property.ownerId && (property.ownerId._id === user._id || property.ownerId === user._id);

  return (
    // Navbar component removed from here
    <div className="container">
      {/* FIX: Removed 'card' class. Used inline styles to keep it clean and static (no hover effect) */}
      <div style={{ 
          background: 'var(--card-bg)', 
          padding: '30px', 
          marginTop: '40px', 
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h1 style={{ margin: 0 }}>{property.type.toUpperCase()} in {property.location}</h1>
            
            {/* HIDE FOR OWNER: PDF & Wishlist Buttons */}
            {!isOwner && (
                <div>
                    <button onClick={handlePrint} className="btn-primary no-print" style={{ marginRight: '10px', background: '#34495e', fontSize: '0.9rem' }}>🖨️ PDF</button>
                    <button onClick={addToWishlist} className="no-print" style={{ background: '#ff7675', border: 'none', fontSize: '1.5rem', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px' }} title="Add to Wishlist">❤️</button>
                </div>
            )}
        </div>

        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div>
                <img 
                    src={property.images && property.images[0] ? property.images[0] : "https://via.placeholder.com/400"} 
                    alt="Property" 
                    style={{ width: '100%', borderRadius: '10px', maxHeight: '400px', objectFit: 'cover' }} 
                />
            </div>
            <div>
                <h2 style={{ color: '#27ae60', marginTop: 0 }}>{property.price.toLocaleString()} TK</h2>
                
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', margin: '15px 0' }}>
                    <p style={{ color: '#333' }}><strong>Status:</strong> {property.searchType === 'sell' ? 'For Sale' : 'For Rent'}</p>
                    <p style={{ color: '#333' }}><strong>Size:</strong> {property.details.size} sq ft</p>
                    <p style={{ color: '#333' }}><strong>Floor:</strong> {property.details.floor || 'N/A'}</p>
                    <p style={{ color: '#333' }}><strong>Details:</strong> {property.details.description || 'No description provided.'}</p>
                    <p style={{ color: '#333' }}><strong>Rating:</strong> {property.rating} / 5 ⭐</p>
                </div>
                
                { (isPremium || isAdmin) ? (
                    <div style={{ marginTop: '20px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                        <h3 style={{ color: '#d35400', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            👑 Premium Content
                        </h3>
                        
                        <p><strong>Owner Contact:</strong> {property.contactEmail || "Hidden"}</p>
                        
                        {/* HIDE FOR OWNER: Meet & Offer Section */}
                        {!isOwner && (
                            <div className="no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginTop: '15px' }}>
                                <button className="btn-primary" onClick={handleMeet}>🤝 MEET OWNER</button>
                                
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input 
                                        type="number" 
                                        placeholder="Offer Price" 
                                        value={offerPrice} 
                                        onChange={(e) => setOfferPrice(e.target.value)} 
                                        style={{ width: '150px', margin: 0 }}
                                    />
                                    <button className="btn-primary" onClick={handleOffer} style={{ background: '#27ae60' }}>OFFER</button>
                                </div>
                            </div>
                        )}

                        
                              <h3>360° View Simulator</h3>
                              <div class="img-box">
                                <iframe iframe width="600px" height="350px" frameborder="0" src="https://momento360.com/e/u/94c06bdff792487ab3e3bca940d233ba?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true"></iframe>
                              </div>


                              <p style={{fontSize: '0.8rem', marginTop: '5px'}}>(Interactive view in real deployment)</p>
                        </div>
                    
                ) : (
                    <div className="no-print" style={{ background: '#fff3cd', color: '#856404', padding: '15px', marginTop: '20px', borderRadius: '8px', border: '1px solid #ffeeba' }}>
                        <h3>🔒 Premium Features Locked</h3>
                        <p>Upgrade to Premium membership to see:</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>Owner Contact Details</li>
                            <li>360° Property View</li>
                            <li>Price Negotiation Options</li>
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