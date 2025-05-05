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

// Función para explorar la API del bot en Vercel
async function exploreVercelBot() {
  try {
    console.log('🔍 Explorando la API del bot en Vercel...');
    
    // Probar diferentes rutas comunes
    const routes = [
      '/',
      '/api',
      '/api/bot',
      '/api/telegram',
      '/api/webhook',
      '/api/webhook/telegram',
      '/api/telegram/webhook',
      '/api/telegram/send',
      '/api/telegram/message',
      '/api/telegram/notify',
      '/api/telegram/test'
    ];
    
    for (const route of routes) {
      try {
        console.log(`\n🔄 Probando ruta: ${route}`);
        const response = await axios.get(`${BOT_URL}${route}`);
        console.log(`✅ Respuesta de ${route}:`, response.data);
      } catch (error) {
        console.log(`❌ Error al acceder a ${route}:`, error.message);
      }
    }
    
    // Probar enviar un mensaje a diferentes endpoints
    const postRoutes = [
      '/api/bot',
      '/api/telegram',
      '/api/webhook',
      '/api/webhook/telegram',
      '/api/telegram/webhook',
      '/api/telegram/send',
      '/api/telegram/message',
      '/api/telegram/notify',
      '/api/telegram/test'
    ];
    
    for (const route of postRoutes) {
      try {
        console.log(`\n🔄 Probando POST a: ${route}`);
        const response = await axios.post(
          `${BOT_URL}${route}`,
          {
            botToken: BOT_TOKEN,
            chatId: CHAT_ID,
            message: '🔍 Exploración de API',
            type: 'test'
          }
        );
        console.log(`✅ Respuesta de POST a ${route}:`, response.data);
      } catch (error) {
        console.log(`❌ Error al enviar POST a ${route}:`, error.message);
      }
    }
    
    console.log('\n✅ Exploración completada');
  } catch (error) {
    console.error('❌ Error en la exploración:', {
      message: error.message,
      details: error.response?.data
    });
  }
}

// Ejecutar la exploración
exploreVercelBot(); 