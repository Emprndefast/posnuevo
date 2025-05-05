import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { telegramService } from '../services/telegramService';
import { enqueueSnackbar } from 'notistack';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const TelegramContext = createContext();

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram debe ser usado dentro de un TelegramProvider');
  }
  return context;
};

export const TelegramProvider = ({ children }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Obtener configuración de Telegram desde el documento del usuario
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().telegram) {
        const telegramConfig = userDoc.data().telegram;
        console.log('Configuración de Telegram cargada:', telegramConfig);
        setConfig(telegramConfig);
      } else {
        console.log('No hay configuración de Telegram guardada');
        setConfig(null);
      }
    } catch (err) {
      console.error('Error al cargar configuración de Telegram:', err);
      setError(err.message);
      enqueueSnackbar('Error al cargar configuración de Telegram: ' + err.message, {
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar configuración al iniciar o cuando cambie el usuario
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const saveConfig = async (newConfig) => {
    try {
      setLoading(true);
      setError(null);

      await telegramService.saveConfig(user.uid, newConfig);
      setConfig(newConfig);
      
      enqueueSnackbar('Configuración de Telegram guardada correctamente', { 
        variant: 'success' 
      });
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error al guardar configuración de Telegram:', err);
      enqueueSnackbar('Error al guardar la configuración de Telegram', { 
        variant: 'error' 
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (type, data) => {
    try {
      if (!config?.botToken || !config?.chatId) {
        console.warn('Configuración de Telegram incompleta. Token:', config?.botToken, 'ChatID:', config?.chatId);
        throw new Error('La configuración de Telegram está incompleta');
      }

      if (!config.notifications?.[type]) {
        console.log(`Notificación de tipo ${type} desactivada`);
        return;
      }

      // Log explícito de los datos que se enviarán
      console.log('🔑 Enviando notificación con botToken:', config.botToken, 'chatId:', config.chatId, 'type:', type);
      console.log('📤 Payload de la notificación:', {
        ...data,
        botToken: config.botToken,
        chatId: config.chatId
      });

      const response = await telegramService.sendNotification(type, {
        ...data,
        botToken: config.botToken,
        chatId: config.chatId
      });
      
      console.log('Notificación enviada correctamente:', response);
      return response;
    } catch (err) {
      console.error('Error al enviar notificación:', err);
      throw err;
    }
  };

  const notifySale = async (saleData) => {
    try {
      const debugId = Date.now();
      console.log(`[${debugId}] Intentando enviar notificación de venta:`, saleData);
      console.log(`[${debugId}] Configuración actual:`, config);
      // DEBUG: Mostrar el valor real de notifications
      console.log(`[${debugId}] DEBUG notifications:`, config.notifications);
      console.log(`[${debugId}] DEBUG notifications.sales:`, config.notifications?.sales);
      
      if (!Boolean(config?.notifications?.sales)) {
        console.log(`[${debugId}] Notificaciones de ventas desactivadas (forzado a booleano)`);
        return;
      }

      // Cambiar 'sale' por 'sales' para que coincida con la clave de configuración
      const response = await sendNotification('sales', saleData);
      console.log(`[${debugId}] Tipo enviado a sendNotification: 'sales'`);
      if (response) {
        console.log(`[${debugId}] Notificación de venta enviada correctamente`);
        enqueueSnackbar('Notificación de venta enviada correctamente', {
          variant: 'success'
        });
      }
    } catch (err) {
      console.error('Error al notificar venta:', err);
      enqueueSnackbar('Error al enviar notificación de venta: ' + err.message, {
        variant: 'error'
      });
    }
  };

  const notifyLowStock = async (productData) => {
    try {
      if (!config?.notifications?.lowStock) {
        console.log('Notificaciones de stock bajo desactivadas');
        return;
      }
      await sendNotification('lowStock', productData);
    } catch (err) {
      console.error('Error al notificar stock bajo:', err);
      enqueueSnackbar('Error al enviar notificación de stock bajo: ' + err.message, {
        variant: 'error'
      });
    }
  };

  const sendDailySummary = async (summaryData) => {
    await sendNotification('dailySummary', summaryData);
  };

  const testConnection = async (botToken, chatId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await telegramService.testConnection(botToken, chatId);
      
      if (result.success) {
        enqueueSnackbar('Conexión con Telegram establecida correctamente', {
          variant: 'success'
        });
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      enqueueSnackbar('Error al conectar con Telegram: ' + err.message, {
        variant: 'error'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    config,
    loading,
    error,
    saveConfig,
    testConnection,
    notifySale,
    notifyLowStock,
    sendDailySummary,
    sendNotification,
    reloadConfig: loadConfig
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}; 