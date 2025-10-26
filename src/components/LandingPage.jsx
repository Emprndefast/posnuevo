import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir directamente a la landing page HTML
    window.location.href = '/landing/index.html';
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ fontSize: '24px', color: '#007bff' }}>🚀</div>
      <div style={{ fontSize: '18px', color: '#666' }}>Redirigiendo a POSENT...</div>
      <div style={{ fontSize: '14px', color: '#999' }}>
        Si no eres redirigido automáticamente, 
        <a href="/landing/index.html" style={{ color: '#007bff', textDecoration: 'none' }}>
          haz clic aquí
        </a>
      </div>
    </div>
  );
};

export default LandingPage;
