import React, { useState, useEffect } from 'react';

const BackgroundSlideshow = () => {
  const images = [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80"
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <>
      {images.map((img, index) => (
        <div
          key={index}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1, // Behind everything
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat', // <--- FIXES THE BOTTOM STRIP ISSUE
            opacity: index === current ? 1 : 0, // Cross-fade logic
            transition: 'opacity 1.5s ease-in-out', // Smooth fade
            pointerEvents: 'none'
          }}
        />
      ))}
    </>
  );
};

export default BackgroundSlideshow;