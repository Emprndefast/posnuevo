import api from './api';

// Validar token de bot de Telegram
const validateBotToken = (token) => {
  const tokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;
  return tokenRegex.test(token);
};

// Validar chat ID
const validateChatId = (chatId) => {
  return typeof chatId === 'string' && chatId.length > 0;
};

// Guardar configuración de Telegram
export const saveTelegramConfig = async (config) => {
  try {
    if (!validateBotToken(config.botToken)) {
      throw new Error('Token de bot inválido');
    }
    if (!validateChatId(config.chatId)) {
      throw new Error('Chat ID inválido');
    }

    const response = await api.post('/telegram/config', config);
    return response.data;
  } catch (error) {
    console.error('Error al guardar configuración de Telegram:', error);
    throw error;
  }
};

// Obtener configuración de Telegram
export const getTelegramConfig = async () => {
  try {
    const response = await api.get('/telegram/config');
    return response.data;
  } catch (error) {
    console.error('Error al obtener configuración de Telegram:', error);
    throw error;
  }
};

// Actualizar configuración de Telegram
export const updateTelegramConfig = async (config) => {
  if (!validateBotToken(config.botToken)) {
    throw new Error('Token de bot inválido');
  }
  if (!validateChatId(config.chatId)) {
    throw new Error('Chat ID inválido');
  }

  const response = await api.patch('/telegram/config', config);
  return response.data;
};

// Eliminar configuración de Telegram
export const deleteTelegramConfig = async () => {
  const response = await api.delete('/telegram/config');
  return response.data;
};

// Probar conexión con bot
export const testTelegramConnection = async (config) => {
  try {
    const response = await api.post('/telegram/test', config);
    return response.data;
  } catch (error) {
    console.error('Error al probar conexión de Telegram:', error);
    throw error;
  }
}; 