import axios from 'axios';
import api from '../api/api';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { TELEGRAM_CONFIG } from '../config/telegram';
import { API_CONFIG } from '../config/api';

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

class TelegramService {
  constructor() {
    // Use the shared `api` instance (configured with REACT_APP_API_URL or default to http://localhost:3002/api)
    this.telegramApiUrl = API_CONFIG.TELEGRAM_API_URL;
    if (!process.env.REACT_APP_API_URL) {
      console.warn('REACT_APP_API_URL no está definida. Usando el valor por defecto de la instancia `api` (http://localhost:3002/api).');
    }
  }

  async testConnection(botToken, chatId) {
    try {
      if (!botToken || !chatId) {
        throw new Error(TELEGRAM_CONFIG.ERROR_MESSAGES.INVALID_CONFIG);
      }

      // Primero probamos la conexión con el bot en Vercel
      try {
        // Use centralized api instance so it respects REACT_APP_API_URL
        const botResponse = await api.post('/telegram/test', { botToken, chatId });
        console.log('✅ Conexión con el bot backend exitosa:', botResponse.data);
      } catch (botError) {
        console.error('❌ Error al conectar con el bot backend:', botError.message, botError.response?.data);
        // Continuamos con la prueba de Telegram API
      }

      // Luego probamos la conexión directa con la API de Telegram
      const response = await axios.post(
        `${this.telegramApiUrl}${botToken}/sendMessage`,
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

  async saveConfig(userId, config) {
    try {
      const settingsRef = doc(db, 'settings', userId);
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        // Actualizar configuración existente
        await updateDoc(settingsRef, {
          telegram: {
            ...config,
            updatedAt: new Date()
          }
        });
      } else {
        // Crear nueva configuración
        await setDoc(settingsRef, {
          telegram: {
            ...config,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error al guardar configuración de Telegram:', error);
      throw new Error('Error al guardar la configuración de Telegram');
    }
  }

  async loadConfig(userId) {
    try {
      const settingsRef = doc(db, 'settings', userId);
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists() && settingsDoc.data().telegram) {
        return settingsDoc.data().telegram;
      }

      return null;
    } catch (error) {
      console.error('Error al cargar configuración de Telegram:', error);
      throw new Error('Error al cargar la configuración de Telegram');
    }
  }

  async sendNotification(type, data) {
    try {
      const { botToken, chatId } = data;
      
      if (!botToken || !chatId) {
        throw new Error(TELEGRAM_CONFIG.ERROR_MESSAGES.INVALID_CONFIG);
      }

      // Enviar la notificación a través del backend
      // Use centralized api instance (honors REACT_APP_API_URL)
      const response = await api.post('/bot/notify', {
        botToken,
        chatId,
        type,
        data
      });

      console.log('✅ Notificación enviada a través del backend:', response.data);
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

  async notifySale(saleData) {
    return await this.sendNotification(TELEGRAM_CONFIG.MESSAGE_TYPES.SALE, saleData);
  }

  async notifyLowStock(productData) {
    return await this.sendNotification(TELEGRAM_CONFIG.MESSAGE_TYPES.LOW_STOCK, productData);
  }

  async notifyOutOfStock(productData) {
    try {
      console.log('Iniciando notificación de stock agotado con datos:', productData);
      const result = await this.sendNotification(TELEGRAM_CONFIG.MESSAGE_TYPES.OUT_OF_STOCK, productData);
      console.log('Resultado de la notificación de stock agotado:', result);
      return result;
    } catch (error) {
      console.error('Error detallado en notifyOutOfStock:', error);
      throw error;
    }
  }

  async sendDailySummary(summaryData) {
    return await this.sendNotification(TELEGRAM_CONFIG.MESSAGE_TYPES.DAILY_SUMMARY, summaryData);
  }
}

export const telegramService = new TelegramService();

export const sendTelegramMessage = async (message) => {
  try {
    const config = await getTelegramConfig();
    
    if (!config || !config.botToken || !config.chatId) {
      throw new Error('Configuración de Telegram no encontrada');
    }

    const response = await fetch(`${TELEGRAM_API_URL}${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      throw new Error('Error al enviar mensaje a Telegram');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en sendTelegramMessage:', error);
    throw error;
  }
};

export const formatSaleMessage = (sale) => {
  const { items, total, paymentMethod, date } = sale;
  
  const itemsList = items.map(item => 
    `• ${item.name} x${item.quantity} - $${item.price}`
  ).join('\n');

  return `
<b>Nueva Venta Realizada</b>
📅 Fecha: ${new Date(date).toLocaleString()}
💰 Total: $${total}
💳 Método de Pago: ${paymentMethod}

<b>Productos:</b>
${itemsList}
  `.trim();
};

export const formatLowStockMessage = (product) => {
  return `
<b>⚠️ Alerta de Stock Bajo</b>
Producto: ${product.name}
Stock Actual: ${product.stock}
Stock Mínimo: ${product.minStock}
  `.trim();
};

export const formatNewOrderMessage = (order) => {
  return `
<b>🆕 Nueva Orden Recibida</b>
Orden #${order.id}
Cliente: ${order.customerName}
Total: $${order.total}
Estado: ${order.status}
  `.trim();
}; 