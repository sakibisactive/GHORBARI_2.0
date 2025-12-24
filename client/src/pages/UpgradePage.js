import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UpgradePage = () => {
  const [referral, setReferral] = useState('');
  const [step, setStep] = useState(1);
  const [price, setPrice] = useState(1000); // Default
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user && user.token;
  const isPremium = user && user.role === 'premium';

  // 1. Fetch the correct price on load
  useEffect(() => {
      const fetchPrice = async () => {
          try {
              const res = await axios.get('http://localhost:5000/api/actions/subscription-price', {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setPrice(res.data.price);
          } catch (err) { console.error(err); }
          setLoading(false);
      };
      if(token) fetchPrice();
  }, [token]);

  const checkReferral = () => {
    if(referral.trim() !== "") {
        setPrice(950); // Visual update for Non-Premium user
    } else {
        setPrice(1000);
    }
    setStep(2);
  };

  const handlePayment = async () => {
      const confirmPayment = window.confirm(`Pay ${price} TK via BKash?`);
      if(!confirmPayment) return;

      try {
          const res = await axios.post('http://localhost:5000/api/actions/upgrade', 
            { referralEmail: isPremium ? null : referral }, // Premium users don't send referrals
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          alert(res.data.message);
          navigate(isPremium ? '/premium-dashboard' : '/user-dashboard');
      } catch (err) {
          const msg = err.response?.data?.message || 'Error processing request';
          alert(msg);
          if(err.response?.status === 400) setStep(1);
      }
  };

  if(loading) return <div className="container center-screen-content"><h2 style={{color:'white'}}>Loading...</h2></div>;

  return (
    <div className="container center-screen-content">
      <div className="form-container" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ color: '#0ec9e2ff', marginBottom: '20px' }}>
              {isPremium ? "RENEW SUBSCRIPTION" : "UPGRADE TO PREMIUM"}
          </h2>
          
          {/* LOGIC: Only show Referral Input if NOT Premium */}
          {!isPremium && step === 1 ? (
              <React.Fragment>
                  <p style={{color: '#13c6deff', marginBottom: '50px'}}>
                      Standard Price: 1000 TK<br/>
                      <span style={{color: 'red'}}>Referral Price: 950 TK</span>
                  </p>
                  <input 
                      type="email" 
                      placeholder="Referrer Email (Optional)" 
                      value={referral}
                      onChange={e => setReferral(e.target.value)}
                  />
                  <button className="btn-primary" onClick={checkReferral}>NEXT</button>
                  
              </React.Fragment>
          ) : (
              // Step 2 (Or Step 1 for Premium Users)
              <React.Fragment>
                  <h3 style={{ marginBottom: '20px' }}>Total Payable: {price} TK</h3>
                  
                  {isPremium && price < 1000 && (
                      <p style={{color: 'green', fontWeight: 'bold', marginBottom: '20px'}}>
                          🎉 You have a referral discount applied!
                      </p>
                  )}

                  <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                    <button className="btn-primary" style={{ background: '#0eb0e2ff' }} onClick={handlePayment}>
                        PAY NOW
                    </button>
                    
                    {!isPremium && (
                        <button className="btn-primary" style={{ background: '#95a5a6' }} onClick={() => setStep(1)}>
                            BACK
                        </button>
                    )}
                  </div>
              </React.Fragment>
          )}
      </div>
    </div>
  );
};

export default UpgradePage;