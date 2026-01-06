import React from 'react';
import './live.scss';

const TVScreen = () => {
  return (
    <div className="tv-screen">
      <iframe 
        src={`http://${window.location.hostname}:4316/main`} 
        title="TV Screen"
        width="100%" 
        height="100%"
      />
    </div>
  );
};

export default TVScreen;
