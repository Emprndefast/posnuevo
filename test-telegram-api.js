const axios = require('axios');

// Configuración para pruebas
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
const BOT_TOKEN = '7590460830:AAEl3QXcaVhZaRHysyZVZIN2Rzqb8EWbYwk';
const CHAT_ID = '8102483318';

// Configurar interceptores de Axios
axios.interceptors.request.use(
  config => {
    console.log(`🚀 Enviando petición a: ${config.url}`);
    return config;
  },
  error => {
    console.error('❌ Error en la petición:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    console.log('✅ Respuesta recibida correctamente');
    return response;
  },
  error => {
    console.error('❌ Error en la respuesta:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Función para probar la conexión con la API de Telegram
async function testTelegramApi() {
  try {
    console.log('🔄 Probando conexión directa con la API de Telegram...');
    
    // Prueba el envío de un mensaje de prueba
    console.log('🔄 Enviando mensaje de prueba...');
    const response = await axios.post(
      `${TELEGRAM_API_URL}${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: '✅ Conexión exitosa con Telegram API',
        parse_mode: 'HTML'
      }
    );
    console.log('✅ Respuesta de la API de Telegram:', response.data);

    // Prueba el envío de una notificación de venta
    console.log('🔄 Enviando notificación de venta de prueba...');
    const saleMessage = `
<b>💰 Nueva Venta Realizada</b>
📅 Fecha: ${new Date().toLocaleString()}
👤 Cliente: Cliente de Prueba
💳 Método de Pago: Efectivo

<b>Productos:</b>
• Producto de prueba x1 - $100

<b>Total: $100</b>
    `.trim();

    const saleResponse = await axios.post(
      `${TELEGRAM_API_URL}${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: saleMessage,
        parse_mode: 'HTML'
      }
    );
    console.log('✅ Respuesta de la notificación de venta:', saleResponse.data);

    console.log('✅ Todas las pruebas completadas con éxito');
  } catch (error) {
    console.error('❌ Error en la prueba de conexión con la API de Telegram:', {
      message: error.message,
      details: error.response?.data
    });
  }
}

// Ejecutar la prueba
testTelegramApi(); 