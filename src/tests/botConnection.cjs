const axios = require('axios');

// Configuración para pruebas
const API_CONFIG = {
  BOT_BASE_URL: 'https://posentbot.vercel.app',
  TELEGRAM_API_URL: 'https://api.telegram.org/bot'
};

// Configuración de Telegram
const TELEGRAM_CONFIG = {
  API_BASE_URL: 'https://api.telegram.org/bot',
  MESSAGE_TYPES: {
    SALE: 'sale',
    LOW_STOCK: 'lowStock',
    OUT_OF_STOCK: 'outOfStock',
    DAILY_SUMMARY: 'dailySummary'
  },
  MESSAGE_TEMPLATES: {
    sale: (data) => `
<b>💰 Nueva Venta Realizada</b>
📅 Fecha: ${new Date(data.date).toLocaleString()}
👤 Cliente: ${data.customer || 'Cliente General'}
💳 Método de Pago: ${data.paymentMethod}

<b>Productos:</b>
${data.items.map(item => `• ${item.name} x${item.quantity} - $${item.price}`).join('\n')}

<b>Total: $${data.total}</b>
    `.trim(),
    lowStock: (data) => `
<b>⚠️ Alerta de Stock Bajo</b>
Producto: ${data.name}
Stock Actual: ${data.currentStock}
Stock Mínimo: ${data.minStock}
    `.trim(),
    outOfStock: (data) => `
<b>🚨 ALERTA: Producto Agotado</b>
Producto: ${data.name}
Código: ${data.code}

Se requiere reposición inmediata.
    `.trim(),
    dailySummary: (data) => `
<b>📊 Resumen Diario de Ventas</b>
📅 Fecha: ${new Date(data.date).toLocaleDateString()}
💰 Total Ventas: $${data.totalSales}
🛒 Total Productos Vendidos: ${data.totalItems}
👤 Total Clientes: ${data.totalCustomers}
    `.trim()
  },
  ERROR_MESSAGES: {
    CONNECTION_ERROR: 'Error al conectar con Telegram',
    INVALID_CONFIG: 'La configuración de Telegram está incompleta',
    SEND_ERROR: 'Error al enviar mensaje a Telegram'
  }
};

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

// Función para probar la conexión con el bot
async function testConnection(botToken, chatId) {
  try {
    if (!botToken || !chatId) {
      throw new Error(TELEGRAM_CONFIG.ERROR_MESSAGES.INVALID_CONFIG);
    }

    const response = await axios.post(
      `${TELEGRAM_CONFIG.API_BASE_URL}${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: '✅ Conexión exitosa con Telegram',
        parse_mode: 'HTML'
      }
    );

    return {
      success: true,
      message: 'Conexión con Telegram establecida correctamente'
    };
  } catch (error) {
    console.error('Error al probar conexión con Telegram:', error);
    throw new Error(
      error.response?.data?.description || 
      TELEGRAM_CONFIG.ERROR_MESSAGES.CONNECTION_ERROR
    );
  }
}

// Función para enviar una notificación
async function sendNotification(type, data) {
  try {
    const { botToken, chatId } = data;
    
    if (!botToken || !chatId) {
      throw new Error(TELEGRAM_CONFIG.ERROR_MESSAGES.INVALID_CONFIG);
    }

    const messageTemplate = TELEGRAM_CONFIG.MESSAGE_TEMPLATES[type];
    if (!messageTemplate) {
      throw new Error(`Tipo de notificación no válido: ${type}`);
    }

    const message = messageTemplate(data);

    const response = await axios.post(
      `${TELEGRAM_CONFIG.API_BASE_URL}${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }
    );

    return {
      success: true,
      message: 'Notificación enviada correctamente',
      data: response.data
    };
  } catch (error) {
    console.error('Error al enviar notificación a Telegram:', {
      type,
      error: error.message,
      response: error.response?.data
    });
    throw new Error(
      error.response?.data?.description || 
      TELEGRAM_CONFIG.ERROR_MESSAGES.SEND_ERROR
    );
  }
}

// Función principal de prueba
async function testBotConnection() {
  try {
    // Prueba de conexión básica
    console.log('🔄 Probando conexión con el bot...');
    
    // Reemplaza estos valores con tu configuración real
    const testConfig = {
      botToken: '7590460830:AAEl3QXcaVhZaRHysyZVZIN2Rzqb8EWbYwk',
      chatId: '8102483318'
    };

    // Prueba el envío de un mensaje de prueba
    const result = await testConnection(
      testConfig.botToken,
      testConfig.chatId
    );

    console.log('✅ Prueba exitosa:', result);

    // Prueba el envío de una notificación de venta
    const saleData = {
      botToken: testConfig.botToken,
      chatId: testConfig.chatId,
      items: [
        { name: 'Producto de prueba', quantity: 1, price: 100 }
      ],
      total: 100,
      paymentMethod: 'Efectivo',
      date: new Date()
    };

    console.log('🔄 Enviando notificación de venta de prueba...');
    const saleResult = await sendNotification(TELEGRAM_CONFIG.MESSAGE_TYPES.SALE, saleData);
    console.log('✅ Notificación de venta enviada:', saleResult);

  } catch (error) {
    console.error('❌ Error en la prueba de conexión:', {
      message: error.message,
      details: error.response?.data
    });
  }
}

// Ejecutar la prueba
testBotConnection(); 