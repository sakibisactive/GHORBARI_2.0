import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const SuggestionPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); // 2. Initialize hook
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/premium/suggestion', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setProperties(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load suggestions.');
      } finally {
        setLoading(false);
      }
    };
    
    if(user && user.token) fetchSuggestions();
    else setError('Please login as Premium User');
    
  }, []);

  if (loading) return <div className="container" style={{color: 'white'}}><h1>Loading...</h1></div>;
  if (error) return <div className="container" style={{color: 'red'}}><h1>{error}</h1></div>;

  return (
    <div className="container">
      
      
      
      
      {properties.length === 0 && (
          <div className="card" style={{padding: '50px', textAlign: 'center'}}>
              <h2>No Properties Found matching criteria.</h2>
          </div>
      )}

      <div className="grid-cards">
        {properties.map((prop, index) => (
          // 3. Added onClick and cursor: pointer here
          <div 
            key={prop._id} 
            className="card" 
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => navigate(`/property/${prop._id}`)}
          >
            <div style={{ position: 'absolute', top: 10, right: 10, background: '#27ae60', color: 'white', padding: '5px', borderRadius: '5px', fontWeight: 'bold' }}>
               #{index + 1}
            </div>
            
            <img 
                src={prop.images && prop.images[0] ? prop.images[0] : "https://via.placeholder.com/300"} 
                alt="Property" 
                style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '10px' }}
            />

            <h3>{prop.type ? prop.type.toUpperCase() : 'PROPERTY'} in {prop.location}</h3>
            <p><strong>Price:</strong> {prop.price.toLocaleString()} TK</p>
            <hr style={{margin: '10px 0', opacity: 0.5}}/>
            
            <p style={{ color: '#ffffffff', fontWeight: 'bold' }}>1. Crime Rate: {prop.crimeRate} (Low is good)</p>
            <p style={{ color: '#ffffffff' }}>2. Hospital: {prop.distHospital} km</p>
            <p style={{ color: '#ffffffff' }}>3. School: {prop.distSchool} km</p>
            <p style={{ color: '#ffffffff' }}>4. Market: {prop.distMarket} km</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionPage;