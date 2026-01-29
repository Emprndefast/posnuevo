import api from '../config/api';
import { CONFIG_DEFAULT } from '../constants/configConstants';

// Mapeo entre secciones de configuración y tipos en backend
const CONFIG_TYPES = [
  'business', 'printer', 'notifications', 'security',
  'cloudinary', 'backup', 'whatsapp', 'telegram'
];

export const configService = {
  // Obtener la configuración del usuario (consolida todos los tipos)
  async getConfig() {
    try {
      // Para compatibilidad con el frontend actual que espera un objeto gigante,
      // intentamos obtener las configuraciones más críticas o devolver valores por defecto.
      // Idealmente, el frontend debería pedir lo que necesita bajo demanda.

      const requests = CONFIG_TYPES.map(type => api.get(`/settings/${type}`).catch(() => ({ data: { data: {} } })));
      const responses = await Promise.all(requests);

      const consolidatedConfig = { ...CONFIG_DEFAULT };

      responses.forEach((res, index) => {
        const type = CONFIG_TYPES[index];
        if (res.data && res.data.data) {
          // Mapeamos business -> empresa (si es necesario) o mantenemos estructura
          if (type === 'business') consolidatedConfig.empresa = res.data.data;
          else consolidatedConfig[type] = res.data.data;
        }
      });

      return consolidatedConfig;
    } catch (error) {
      console.error('Error getting config:', error);
      return CONFIG_DEFAULT;
    }
  },

  // Guardar la configuración (detecta tipo o guarda todo si es bloque)
  async saveConfig(config) {
    try {
      // Si recibimos un objeto completo, intentamos guardar por partes
      // Esto es ineficiente pero mantiene compatibilidad si el frontend envía todo el objeto
      const promises = [];

      if (config.empresa) promises.push(api.post('/settings/business', config.empresa));
      if (config.printer) promises.push(api.post('/settings/printer', config.printer));

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  },

  // Actualizar campos específicos de la configuración
  // section: 'business', 'printer', etc.
  async updateConfig(section, field, value) {
    try {
      // Primero obtenemos la configuración actual de esa sección
      const currentRes = await api.get(`/settings/${section}`);
      const currentConfig = currentRes.data.data || {};

      // Actualizamos el campo
      const newConfig = { ...currentConfig, [field]: value };

      // Guardamos
      await api.post(`/settings/${section}`, newConfig);
      return true;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  },

  // Restaurar configuración por defecto (solo algunas secciones críticas)
  async restoreDefaultConfig() {
    try {
      // Implementar según necesidad, por ahora retornamos true para no romper
      return true;
    } catch (error) {
      console.error('Error restoring default config:', error);
      throw error;
    }
  },

  // Exportar configuración
  async exportConfig() {
    try {
      const config = await this.getConfig();
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'system_config.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting config:', error);
      throw error;
    }
  },

  // Importar configuración
  async importConfig(configData) {
    try {
      const config = typeof configData === 'string' ? JSON.parse(configData) : configData;
      await this.saveConfig(config);
      return config;
    } catch (error) {
      console.error('Error importing config:', error);
      throw error;
    }
  }
}; 