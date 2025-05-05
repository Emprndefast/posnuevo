import { telegramService } from '../services/telegramService';

const testBotConnection = async () => {
  try {
    // Prueba de conexión básica
    console.log('🔄 Probando conexión con el bot...');
    
    // Reemplaza estos valores con tu configuración real
    const testConfig = {
      botToken: '7590460830:AAEl3QXcaVhZaRHysyZVZIN2Rzqb8EWbYwk',
      chatId: '8102483318'
    };

    // Prueba el envío de un mensaje de prueba
    const result = await telegramService.testConnection(
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
    const saleResult = await telegramService.notifySale(saleData);
    console.log('✅ Notificación de venta enviada:', saleResult);

  } catch (error) {
    console.error('❌ Error en la prueba de conexión:', {
      message: error.message,
      details: error.response?.data
    });
  }
};

// Ejecutar la prueba
testBotConnection(); 