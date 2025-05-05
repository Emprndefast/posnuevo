const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = () => {
  // Datos que quieres incluir en el token
  const payload = {
    id: 'bot-client',
    role: 'bot',
    permissions: [
      'read:inventory',
      'read:sales',
      'read:customers',
      'read:reports',
      'notify:stock',
      'notify:sales'
    ]
  };

  try {
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' } // El token expira en 30 días
    );
    
    console.log('Token JWT generado:');
    console.log(token);
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('\nToken decodificado:');
    console.log(JSON.stringify(decoded, null, 2));

    // Mostrar información de uso
    console.log('\nEjemplos de uso:');
    console.log('1. Consultar inventario:');
    console.log('curl -H "Authorization: Bearer ' + token + '" http://localhost:3001/api/inventario');
    console.log('\n2. Consultar ventas:');
    console.log('curl -H "Authorization: Bearer ' + token + '" http://localhost:3001/api/ventas/resumen_hoy');
  } catch (error) {
    console.error('Error al generar el token:', error);
  }
};

generateToken(); 