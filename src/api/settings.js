import api from './api';

// Obtener todas las configuraciones
export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

// Actualizar configuraciones
export const updateSettings = async (settingsData) => {
  const response = await api.patch('/settings', settingsData);
  return response.data;
};

// Obtener configuración específica por clave
export const getSettingByKey = async (key) => {
  const response = await api.get(`/settings/${key}`);
  return response.data;
};

// Obtener configuración general del sistema
export const getSystemSettings = async () => {
  const response = await api.get('/settings/system');
  return response.data;
};

// Actualizar configuración general
export const updateSystemSettings = async (settings) => {
  const response = await api.patch('/settings/system', settings);
  return response.data;
};

// Obtener configuración de impresora fiscal
export const getPrinterSettings = async () => {
  const response = await api.get('/settings/printer');
  return response.data;
};

// Actualizar configuración de impresora
export const updatePrinterSettings = async (settings) => {
  const response = await api.patch('/settings/printer', settings);
  return response.data;
};

// Obtener configuración de impuestos
export const getTaxSettings = async () => {
  const response = await api.get('/settings/taxes');
  return response.data;
};

// Actualizar configuración de impuestos
export const updateTaxSettings = async (settings) => {
  const response = await api.patch('/settings/taxes', settings);
  return response.data;
};

// Obtener configuración de notificaciones
export const getNotificationSettings = async () => {
  const response = await api.get('/settings/notifications');
  return response.data;
};

// Actualizar configuración de notificaciones
export const updateNotificationSettings = async (settings) => {
  const response = await api.patch('/settings/notifications', settings);
  return response.data;
};

// Obtener configuración de respaldo
export const getBackupSettings = async () => {
  const response = await api.get('/settings/backup');
  return response.data;
};

// Actualizar configuración de respaldo
export const updateBackupSettings = async (settings) => {
  const response = await api.patch('/settings/backup', settings);
  return response.data;
};

// Realizar respaldo manual
export const createManualBackup = async () => {
  const response = await api.post('/settings/backup/manual');
  return response.data;
};

// Restaurar desde respaldo
export const restoreFromBackup = async (backupId) => {
  const response = await api.post(`/settings/backup/restore/${backupId}`);
  return response.data;
}; 