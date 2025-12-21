import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const StoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newStory, setNewStory] = useState({ title: '', content: '', category: 'Sale' });
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // NEW: State to track comment text for each story individually
  const [commentTexts, setCommentTexts] = useState({}); 

  // Get 'lang' from context to conditionally translate DB content
  const { t, lang } = useLanguage();

  const user = JSON.parse(localStorage.getItem('user'));
  const isPremium = user && user.role === 'premium';
  const token = user && user.token;

  useEffect(() => {
    if(token) fetchStories();
  }, [token]);

  const fetchStories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/actions/stories', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setStories(res.data);
      } catch(err) { console.log(err); }
  };

  const handleSubmit = async () => {
     if(!newStory.title || !newStory.content) return alert("Please fill all fields");

     try {
        await axios.post('http://localhost:5000/api/actions/stories', newStory, {
             headers: { Authorization: `Bearer ${token}` }
        });
        alert("Story Submitted");
        setShowForm(false);
        setNewStory({ title: '', content: '', category: 'Sale' }); 
        fetchStories(); 
     } catch(err) { alert("Error"); }
  };

  const handleLike = async (id) => {
      await axios.put(`http://localhost:5000/api/actions/story/${id}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
      });
      fetchStories();
  };

  // NEW: Wrapper to handle comment submission via Button OR Enter key
  const submitComment = async (id) => {
      const text = commentTexts[id];
      if(!text) return; // Don't submit empty comments

      await axios.post(`http://localhost:5000/api/actions/story/${id}/comment`, { text }, {
          headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear the input for this specific story
      setCommentTexts(prev => ({ ...prev, [id]: '' }));
      fetchStories();
  };

  const categories = ['All', 'Sale', 'Rent'];
  const categoryMap = { 'All': 'scat_all', 'Sale': 'sell', 'Rent': 'rent' };
  const getCatLabel = (cat) => t(categoryMap[cat] || cat);

  // NEW: Helper to translate dynamic content (Title/Content)
  // This expects the English text to be a key in your BN translations object
  const translateDBContent = (text) => {
    if(lang === 'EN') return text;
    return t(text);
  };

  return (
    <div className="container">
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        
        
        {/* CATEGORY BUTTONS */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
            {categories.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        backgroundColor: selectedCategory === cat ? '#3ce7e7ff' : 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        transition: '0.3s'
                    }}
                >
                    {getCatLabel(cat).toUpperCase()}
                </button>
            ))}
        </div>

        {/* WRITE STORY BUTTON */}
        {isPremium && (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginBottom: '20px' }}>
                {showForm ? t('story_cancel_btn') : t('story_write_btn')}
            </button>
        )}
        
        {/* WRITE STORY FORM */}
        {showForm && (
            <div className="form-container" style={{ margin: '0 auto 30px auto', maxWidth: '600px', backgroundColor:'rgba(0,0,0,0.8)', padding:'20px', borderRadius:'10px' }}>
                <input 
                    placeholder={t('story_title_placeholder')}
                    value={newStory.title}
                    onChange={(e) => setNewStory({...newStory, title: e.target.value})} 
                    style={{ marginBottom: '10px', width: '100%', padding:'10px', color: '#000' }} // Added color
                />
                
                <select 
                    value={newStory.category}
                    onChange={(e) => setNewStory({...newStory, category: e.target.value})}
                    style={{ marginBottom: '10px', width: '100%', padding:'10px', color: '#000' }} // Added color
                >
                    <option value="Sale">Sale</option>
                    <option value="Rent">Rent</option>
                </select>

                <textarea 
                    placeholder={t('story_content_placeholder')}
                    value={newStory.content}
                    onChange={(e) => setNewStory({...newStory, content: e.target.value})} 
                    style={{ height: '100px', marginBottom: '10px', width: '100%', padding:'10px', color: '#000' }} // Added color
                />
                <button className="btn-primary" onClick={handleSubmit} style={{ width: '100%' }}>
                    {t('story_submit_btn')}
                </button>
            </div>
        )}

        {/* STORY LIST */}
        <div className="grid-cards" style={{ marginTop: '20px' }}>
            {stories
                .filter(story => selectedCategory === 'All' || story.category === selectedCategory)
                .map(story => (
                    <div key={story._id} className="card" style={{ padding: '20px', textAlign: 'left',  color:'#333' }}>
                        
                        <span style={{ 
                            fontSize:'0.7rem',  color:'white', 
                            padding:'2px 8px', borderRadius:'10px', display: 'inline-block', marginBottom: '5px'
                        }}>
                            {getCatLabel(story.category || 'Sale')}
                        </span>

                        <h3 style={{ margin: '5px 0' }}>{translateDBContent(story.title)}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'gray', fontStyle: 'italic' }}>
                            {t('story_by')} {story.authorName}
                        </p>
                        <p style={{ margin: '15px 0', lineHeight: '1.5' }}>{translateDBContent(story.content)}</p>
                        
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <button onClick={() => handleLike(story._id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#3cdce7ff', fontSize: '1.2rem', padding: 0 }}>
                                ❤️ {story.likes}
                            </button>
                        </div>

                        {/* COMMENTS SECTION */}
                        <div style={{ marginTop: '15px', background: '#f1f2f6', padding: '15px', borderRadius: '8px' }}>
                            <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>
                                {t('story_comments')} ({story.comments ? story.comments.length : 0})
                            </h5>
                            
                            <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '10px' }}>
                                {story.comments && story.comments.map((c, i) => (
                                    <p key={i} style={{ fontSize: '0.85rem', margin: '5px 0', color: '#555' }}>
                                        <strong>{c.user}:</strong> {c.text}
                                    </p>
                                ))}
                            </div>
                            
                            {/* NEW: Input Group with Button */}
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input 
                                    type="text" 
                                    placeholder={t('story_comment_placeholder')} 
                                    value={commentTexts[story._id] || ''} // Controlled input
                                    onChange={(e) => setCommentTexts({ ...commentTexts, [story._id]: e.target.value })}
                                    onKeyDown={(e) => {
                                        if(e.key === 'Enter') submitComment(story._id);
                                    }}
                                    style={{ 
                                        flex: 1, 
                                        padding: '8px', 
                                        borderRadius: '5px', 
                                        border: '1px solid #ddd',
                                        color: '#333', // FIXED: Force black text
                                        backgroundColor: '#fff' 
                                    }}
                                />
                                <button 
                                    onClick={() => submitComment(story._id)}
                                    style={{
                                        backgroundColor: '#3cdce7ff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        padding: '0 15px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ➤
                                </button>
                            </div>
                        </div>
                    </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default StoriesPage;