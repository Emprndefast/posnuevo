const axios = require('axios');

// Configuración para pruebas
const BOT_URL = 'https://posentbot.vercel.app';
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

// Función para probar la conexión con el bot en Vercel
async function testVercelBot() {
  try {
    console.log('🔄 Probando conexión con el bot en Vercel...');
    
    // Prueba el endpoint de test
    console.log('🔄 Probando endpoint /api/bot/test...');
    const testResponse = await axios.post(
      `${BOT_URL}/api/bot/test`,
      {
        botToken: BOT_TOKEN,
        chatId: CHAT_ID
      }
    );
    console.log('✅ Respuesta del endpoint /api/bot/test:', testResponse.data);

    // Prueba el endpoint de notificación
    console.log('🔄 Probando endpoint /api/bot/notify...');
    const notifyResponse = await axios.post(
      `${BOT_URL}/api/bot/notify`,
      {
        botToken: BOT_TOKEN,
        chatId: CHAT_ID,
        message: '🔔 Prueba de notificación desde el POS local',
        type: 'test'
      }
    );
    console.log('✅ Respuesta del endpoint /api/bot/notify:', notifyResponse.data);

    console.log('✅ Todas las pruebas completadas con éxito');
  } catch (error) {
    console.error('❌ Error en la prueba de conexión con el bot en Vercel:', {
      message: error.message,
      details: error.response?.data
    });
  }
}

// Ejecutar la prueba
testVercelBot(); 