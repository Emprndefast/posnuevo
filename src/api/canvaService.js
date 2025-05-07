// src/api/canvaService.js
// Servicio para generar flyers promocionales con Canva
// NOTA: Debes configurar las credenciales y endpoints reales de Canva

import QRCode from 'qrcode'; // npm install qrcode

const CANVA_API_URL = 'https://api.canva.com/v1/';
const CANVA_API_KEY = process.env.REACT_APP_CANVA_API_KEY; // Configura esto en Vercel

// Generar flyer promocional en Canva
export async function generateCanvaFlyer({ name, price, imageUrl, buyUrl }) {
  // 1. Generar QR como dataURL
  const qrDataUrl = await QRCode.toDataURL(buyUrl);

  // 2. Construir elementos para la plantilla (ajusta según la API real de Canva)
  const elements = [
    { type: 'image', src: imageUrl, position: { x: 0, y: 0 }, size: { width: 300, height: 300 } },
    { type: 'text', text: name, position: { x: 20, y: 320 }, style: { fontSize: 24, fontWeight: 'bold' } },
    { type: 'text', text: `$${price}`, position: { x: 20, y: 360 }, style: { fontSize: 20, color: '#2ecc40' } },
    { type: 'image', src: qrDataUrl, position: { x: 220, y: 320 }, size: { width: 60, height: 60 } }
  ];

  // 3. Llamar a Canva API para crear el diseño (esto es un ejemplo, ajusta según la API real)
  const response = await fetch(`${CANVA_API_URL}designs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CANVA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      template_id: 'default-flyer-template',
      elements
    })
  });
  if (!response.ok) throw new Error('Error al crear flyer en Canva');
  return await response.json();
} 