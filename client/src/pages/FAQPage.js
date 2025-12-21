import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext'; // Import this

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // 1. Get Translation Helper
  const { t, lang } = useLanguage();

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user && user.role === 'admin';
  const token = user && user.token;

  useEffect(() => {
    if(token) fetchFAQs();
  }, [token]);

  const fetchFAQs = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/actions/faq', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setFaqs(res.data);
    } catch(err) { console.log(err); }
  };

  const handleAsk = async () => {
      await axios.post('http://localhost:5000/api/actions/faq', { 
          question, 
          category: 'General Info' 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Question sent to Admin!');
      setQuestion('');
      setShowForm(false); 
      fetchFAQs();
  };

  const handleAnswer = async (id) => {
      const ans = prompt("Enter Answer:");
      if(ans) {
        await axios.put(`http://localhost:5000/api/actions/faq/${id}`, { answer: ans }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchFAQs();
      }
  };

  const groupByCategory = (faqList) => {
    return faqList.reduce((groups, item) => {
      const category = item.category || 'General Info';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
      return groups;
    }, {});
  };

  const groupedFaqs = groupByCategory(faqs);
  const rawCategories = ['All', ...Object.keys(groupedFaqs)];

  // --- MAPPING HELPERS ---

  // Map DB Category String -> Translation Key
  const categoryMap = {
      'All': 'cat_all',
      'Membership & Account': 'cat_membership',
      'Property Management': 'cat_property',
      'Safety & Legal': 'cat_safety',
      'General Info': 'cat_general'
  };

  // Helper to translate DB content (Question/Answer)
  // It checks if 'translations.BN[text]' exists. If yes, return it. If no, return original text.
  const translateDBContent = (text) => {
      if(lang === 'EN') return text; // If English, just show DB text
      
      // Attempt to find the key in the BN object
      // Note: We access the translations object via t() usually, but t() requires a key. 
      // Since these are dynamic, we use a trick: t(text) returns the text if key missing.
      // However, our keys ARE the English sentences.
      return t(text); 
  };

  return (
    <div className="container">
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', textShadow: '2px 2px 4px black', marginBottom:'30px' }}>
            {t('faq_page_title')}
        </h1>
        
        {/* --- CATEGORY BUTTONS --- */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
            {rawCategories.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        backgroundColor: selectedCategory === cat ? '#4db8ff' : 'rgba(255,255,255,0.2)',
                        color: selectedCategory === cat ? '#000' : '#fff',
                        transition: '0.3s'
                    }}
                >
                    {/* Translate the category name */}
                    {t(categoryMap[cat] || cat).toUpperCase()} 
                </button>
            ))}
        </div>

        {/* ASK BUTTON */}
        <button 
            className="btn-primary" 
            onClick={() => setShowForm(!showForm)} 
            style={{ marginBottom: '20px' }}
        >
            {showForm ? t('faq_cancel_btn') : t('faq_ask_btn')}
        </button>
        
        {/* FORM */}
        {showForm && (
            <div className="form-container" style={{ margin: '0 auto 30px auto', maxWidth: '600px' }}>
                <input 
                    type="text" 
                    placeholder={t('faq_placeholder')}
                    value={question} 
                    onChange={e => setQuestion(e.target.value)} 
                    style={{ marginBottom: '10px' }}
                />
                <button className="btn-primary" onClick={handleAsk} style={{ width: '100%' }}>
                    {t('faq_submit_btn')}
                </button>
            </div>
        )}

        {/* --- FAQ LIST --- */}
        <div style={{ paddingBottom: '50px' }}>
            {Object.keys(groupedFaqs)
                .filter(category => selectedCategory === 'All' || selectedCategory === category)
                .map((category) => (
                    <div key={category} style={{ marginBottom: '40px' }}>
                        
                        {/* Section Header */}
                        <h2 style={{ 
                            color: '#4db8ff', 
                            textAlign: 'left', 
                            borderBottom: '2px solid #4db8ff', 
                            paddingBottom: '10px', 
                            marginBottom: '20px',
                            textShadow: '1px 1px 2px black'
                        }}>
                            {t(categoryMap[category] || category)}
                        </h2>

                        {/* Questions */}
                        {groupedFaqs[category].map(faq => (
                            <div key={faq._id} className="card" style={{ padding: '20px', marginBottom: '15px', textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                                <h3 style={{ margin: '5px 0', color: '#ffffffff', fontSize:'1.1rem' }}>
                                    Q: {translateDBContent(faq.question)}
                                </h3>
                                {faq.isAnswered ? (
                                    <p style={{ color: '#ddd', marginTop: '10px' }}>
                                        A: {translateDBContent(faq.answer)}
                                    </p>
                                ) : (
                                    <p style={{ color: '#aaa', fontStyle: 'italic', marginTop: '10px' }}>
                                        {t('faq_waiting')}
                                    </p>
                                )}
                                
                                {isAdmin && !faq.isAnswered && (
                                    <button className="btn-primary" style={{ marginTop: '10px', fontSize: '0.8rem' }} onClick={() => handleAnswer(faq._id)}>
                                        {t('faq_reply')}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;