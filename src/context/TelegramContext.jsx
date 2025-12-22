import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContextMongo';
import { telegramService } from '../services/telegramService';
import { enqueueSnackbar } from 'notistack';
// Firebase imports - Mocked for backward compatibility
import { doc, getDoc, db } from '../firebase/config';

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
      
      // Obtener configuración de Telegram desde backend MongoDB
      const token = localStorage.getItem('token');
      if (!token) {
        setConfig(null);
        return;
      }

      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
      const url = baseUrl + '/telegram/config';
      console.debug('[Telegram] GET', url, 'Authorization:', !!token);
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      if (!contentType.includes('application/json')) {
        // Respuesta inesperada (HTML por ejemplo)
        throw new Error(`Respuesta inesperada del servidor: ${text.slice(0,200)}`);
      }

      const data = JSON.parse(text);

      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }

      if (data && data.success) {
        const telegramData = data.data?.telegram || {};
        const notificationSettings = data.data?.notificationSettings || { sales: true, lowStock: true, dailySummary: false };
        const configToSet = {
          ...telegramData,
          notifications: notificationSettings
        };
        console.log('[Telegram] Config cargada correctamente:', configToSet);
        setConfig(configToSet);
      } else {
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

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuario no autenticado');

      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
      const url = baseUrl + '/telegram/config';
      console.debug('[Telegram] POST', url, 'body:', { botToken: !!newConfig?.botToken, chatId: !!newConfig?.chatId });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newConfig)
      });

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      if (!contentType.includes('application/json')) {
        throw new Error(`Respuesta inesperada del servidor: ${text.slice(0,200)}`);
      }
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      setConfig({
        ...(data.data?.telegram || newConfig),
        notifications: data.data?.notificationSettings || newConfig?.notifications || { sales: true, lowStock: true, dailySummary: false }
      });
      enqueueSnackbar('Configuración de Telegram guardada correctamente', { variant: 'success' });
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error al guardar configuración de Telegram:', err);
      enqueueSnackbar('Error al guardar la configuración de Telegram: ' + err.message, { variant: 'error' });
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

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuario no autenticado');

      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
      const url = baseUrl + '/telegram/test';
      console.debug('[Telegram] POST', url, 'botToken set:', !!botToken, 'chatId set:', !!chatId);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ botToken, chatId })
      });

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      if (!contentType.includes('application/json')) {
        throw new Error(`Respuesta inesperada del servidor: ${text.slice(0,200)}`);
      }
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      if (data.success) {
        enqueueSnackbar(data.message || 'Conexión con Telegram establecida correctamente', { variant: 'success' });
      } else {
        enqueueSnackbar(data.message || 'Error en la conexión de Telegram', { variant: 'error' });
      }

      return data;
    } catch (err) {
      setError(err.message);
      enqueueSnackbar('Error al conectar con Telegram: ' + err.message, { variant: 'error' });
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