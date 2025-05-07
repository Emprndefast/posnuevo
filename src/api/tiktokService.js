// src/api/tiktokService.js
// Servicio para sincronizar productos con TikTok Shop
// NOTA: Debes configurar las credenciales y endpoints reales de TikTok Shop

const TIKTOK_API_URL = 'https://open-api.tiktokglobalshop.com/v1/';
const TIKTOK_ACCESS_TOKEN = process.env.REACT_APP_TIKTOK_ACCESS_TOKEN; // Configura esto en Vercel

// Crear producto en TikTok Shop
export async function createTikTokProduct(product) {
  // Construye el payload según la documentación de TikTok Shop
  const payload = {
    title: product.name,
    description: product.description || '',
    price: product.price,
    stock: product.stock,
    image_url: product.imageUrl,
    sku: product.sku || product.id,
    // ...otros campos requeridos
  };

  const response = await fetch(`${TIKTOK_API_URL}products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TIKTOK_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Error al crear producto en TikTok Shop');
  return await response.json();
}

// Actualizar producto en TikTok Shop
export async function updateTikTokProduct(productId, product) {
  const payload = {
    title: product.name,
    description: product.description || '',
    price: product.price,
    stock: product.stock,
    image_url: product.imageUrl,
    sku: product.sku || productId,
    // ...otros campos requeridos
  };

  const response = await fetch(`${TIKTOK_API_URL}products/${productId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${TIKTOK_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Error al actualizar producto en TikTok Shop');
  return await response.json();
}

// Eliminar producto en TikTok Shop
export async function deleteTikTokProduct(productId) {
  const response = await fetch(`${TIKTOK_API_URL}products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${TIKTOK_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Error al eliminar producto en TikTok Shop');
  return await response.json();
} 