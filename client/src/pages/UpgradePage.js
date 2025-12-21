import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// NOTE: Navbar removed to avoid double navbar

const UpgradePage = () => {
  const [referral, setReferral] = useState('');
  const [step, setStep] = useState(1);
  const [price, setPrice] = useState(1000);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user && user.token;

  const checkReferral = () => {
    if(referral.trim() !== "") {
        // Simple client-side check to see if they typed something. 
        // Real validation happens on backend, but we update UI to show potential discount.
        setPrice(950);
    } else {
        setPrice(1000);
    }
    setStep(2);
  };

  const handlePayment = async () => {
      try {
          // Simulate BKash Payment
          const confirmPayment = window.confirm(`Pay ${price} TK via BKash?`);
          if(!confirmPayment) return;

          const res = await axios.post('http://localhost:5000/api/actions/upgrade', 
            { referralEmail: referral }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Success Notification
          alert(res.data.message);
          navigate('/user-dashboard');
      } catch (err) {
          const msg = (err.response && err.response.data && err.response.data.message) || 'Error processing request';
          alert(msg);
          // If referral failed, go back to step 1
          if(err.response && err.response.status === 400) setStep(1);
      }
  };

  return (
    <div className="container center-screen-content">
      <div className="form-container" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ color: '#0ec9e2ff', marginBottom: '20px' }}>PAYMENT</h2>
          
          {step === 1 ? (
              <React.Fragment>
                  
                  
                  <input 
                      type="email" 
                      placeholder="Referrer Premium Member's Email to get 50 TK OFF" 
                      value={referral}
                      onChange={e => setReferral(e.target.value)}
                  />
                  <button className="btn-primary" onClick={checkReferral}>PROCEED TO PAYMENT</button>
                  <button 
                    style={{ marginTop: '15px', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', display: 'block', margin: '10px auto' }} 
                    onClick={() => { setReferral(''); setPrice(1000); setStep(2); }}
                  >
                      
                  </button>
              </React.Fragment>
          ) : (
              <React.Fragment>
                  
                  
                  <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                    <button className="btn-primary" style={{ background: '#0eb0e2ff' }} onClick={handlePayment}>
                        PAY NOW
                    </button>
                    <button className="btn-primary" style={{ background: '#95a5a6' }} onClick={() => setStep(1)}>
                        BACK
                    </button>
                  </div>
              </React.Fragment>
          )}
      </div>
    </div>
  );
};

export default UpgradePage;