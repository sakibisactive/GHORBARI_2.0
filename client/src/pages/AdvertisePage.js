import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const AdvertisePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user'));
  const [formData, setFormData] = useState({
    type: 'apartment',
    searchType: 'sell',
    location: 'Mirpur',
    price: '',
    size: '',
    floor: '',
    description: ''
  });

  const areas = ["Mirpur", "Uttara", "Dhanmondi", "Gulistan", "Gulshan", "Badda", "Bashundhara", "Baridhara"];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Structure data for backend
    const payload = {
      type: formData.type,
      searchType: formData.searchType,
      location: formData.location,
      price: formData.price,
      details: {
        size: formData.size,
        floor: formData.floor,
        description: formData.description
      }
    };

    try {
      await axios.post('http://localhost:5000/api/premium/advertise', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Ad submitted! Waiting for Admin Approval.');
      navigate('/premium-dashboard');
    } catch (err) {
      alert('Failed to submit ad.');
    }
  };

  return (
    <div>
      <div className="flex-center" style={{ minHeight: '100vh', padding: '20px' }}>
        <div className="form-container" style={{ maxWidth: '600px' }}>
          <h2>{t('advertise_property')}</h2>
          <form onSubmit={handleSubmit}>
            <label>{t('property_type')}</label>
            <select name="type" onChange={handleChange}>
              <option value="apartment">{t('apartment')}</option>
              <option value="building">{t('building')}</option>
              <option value="plot">{t('plot')}</option>
            </select>

            <label>{t('advertise_type')}</label>
            <select name="searchType" onChange={handleChange}>
              <option value="sell">{t('sell')}</option>
              <option value="rent">{t('rent')}</option>
            </select>

            <label>{t('location')}</label>
            <select name="location" onChange={handleChange} value={formData.location}>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <label>{t('price_tk')}</label>
            <input type="number" name="price" placeholder={t('price_tk')} required onChange={handleChange} />

            <label>{t('size_sqft')}</label>
            <input type="number" name="size" placeholder={t('size_sqft_placeholder')} onChange={handleChange} />
            
            <label>{t('floor_level')}</label>
            <input type="number" name="floor" placeholder={t('floor_level_placeholder')} onChange={handleChange} />

            <label>{t('description')}</label>
            <textarea name="description" placeholder={t('details_placeholder')} onChange={handleChange}></textarea>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>{t('submit_for_approval')}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdvertisePage;