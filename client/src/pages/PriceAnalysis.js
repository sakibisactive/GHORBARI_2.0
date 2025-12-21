import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PriceAnalysis = () => {
  const [area, setArea] = useState('Mirpur');
  const [propertyType, setPropertyType] = useState('avgPriceApartment'); // Default to Apartment
  const [graphData, setGraphData] = useState([]);

  const areas = ["Mirpur", "Uttara", "Dhanmondi", "Gulistan", "Gulshan", "Badda", "Motijheel", "Farmgate", "Agargao", "Shaymoly", "Mohammadpur", "Azimpur", "Bashundhara", "Baridhara"];

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:5000/api/premium/analysis?area=${area}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setGraphData(res.data);
    } catch (err) {
      alert('Error fetching data');
    }
  };

  return (
    <div className="container">
      
      
      <div className="form-container" style={{ maxWidth: '800px', margin: '20px auto' }}>
        <form onSubmit={fetchData} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          <select value={area} onChange={(e) => setArea(e.target.value)} style={{flex: 1, minWidth: '150px'}}>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} style={{flex: 1, minWidth: '150px'}}>
            <option value="avgPricePlot">Plot</option>
            <option value="avgPriceApartment">Apartment</option>
            <option value="avgPriceBuilding">Building</option>
          </select>

          <button type="submit" className="btn-primary" style={{flex: '0 0 100px'}}>ANALYZE</button>
        </form>

        <div style={{ marginTop: '40px', height: '400px' }}>
          {graphData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={graphData}
                margin={{ top: 20, right: 30, left: 50, bottom: 10 }}
              >
                {/* FIX 1: Change grid lines to faint white */}
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.3)" />
                
                {/* FIX 2: Change Axis Line and Text color to White */}
                <XAxis 
                    dataKey="year" 
                    stroke="#ffffff" 
                    tick={{ fill: '#ffffff' }} 
                />
                <YAxis 
                    stroke="#ffffff" 
                    tick={{ fill: '#ffffff' }} 
                />
                
                <Tooltip />
                <Legend wrapperStyle={{ color: 'white' }} /> 
                <Line type="monotone" dataKey={propertyType} stroke="#3ccde7ff" activeDot={{ r: 8 }} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', marginTop: '50px', color: '#ffffffff' }}>Select options and click Analyze to see the graph.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceAnalysis;