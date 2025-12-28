import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const res = await axios.post(`http://localhost:5000/api/users${endpoint}`, formData);
      
      localStorage.setItem('user', JSON.stringify(res.data));
      
      if(res.data.role === 'admin') navigate('/admin-dashboard');
      else if(res.data.role === 'premium') navigate('/premium-dashboard');
      else navigate('/user-dashboard');

    } catch (err) {
      const msg = (err.response && err.response.data && err.response.data.message) || 'Error occurred';
      alert(msg); // Display error message
      console.error(msg);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <div className="form-container">
        <h2 style={{ textAlign: 'center' }}>{isLogin ? t('login') : t('register')}</h2>
        
        <form onSubmit={onSubmit}>
          <input 
            type="email" 
            name="email" 
            value={email} 
            placeholder={t('email_placeholder')} 
            onChange={onChange} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            value={password} 
            placeholder={t('pass_placeholder')} 
            onChange={onChange} 
            required 
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {isLogin ? t('login') : t('register')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          {isLogin ? t('no_account') : t('have_account')}
          <span 
            style={{ color: 'blue', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }} 
            onClick={() => setIsLogin(!isLogin)}
          >
             {isLogin ? t('register') : t('login')}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;