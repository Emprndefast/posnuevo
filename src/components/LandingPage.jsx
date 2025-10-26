import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  // Cargar la landing page HTML directamente
  React.useEffect(() => {
    // Usar window.location para cargar la página HTML
    const landingUrl = process.env.PUBLIC_URL + '/landing/index.html';
    window.location.href = landingUrl;
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ fontSize: '48px', color: '#007bff' }}>🚀</div>
      <div style={{ fontSize: '24px', color: '#333', fontWeight: 'bold' }}>POSENT</div>
      <div style={{ fontSize: '16px', color: '#666' }}>Redirigiendo...</div>
      <div style={{ fontSize: '14px', color: '#999', textAlign: 'center', maxWidth: '400px' }}>
        Si no eres redirigido automáticamente, 
        <a href="/landing/index.html" style={{ color: '#007bff', textDecoration: 'none', marginLeft: '5px' }}>
          haz clic aquí
        </a>
      </div>
    </div>
  );
};

export default LandingPage;
