import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { CONFIG_DEFAULT } from '../constants/configConstants';

const CONFIG_DOC_ID = 'system_config';

export const configService = {
  // Obtener la configuración del usuario
  async getConfig() {
    try {
      const configDoc = await getDoc(doc(db, 'config', CONFIG_DOC_ID));
      if (configDoc.exists()) {
        return configDoc.data();
      }
      return CONFIG_DEFAULT;
    } catch (error) {
      console.error('Error getting config:', error);
      throw error;
    }
  },
  
  // Guardar la configuración del usuario
  async saveConfig(config) {
    try {
      await setDoc(doc(db, 'config', CONFIG_DOC_ID), config);
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  },
  
  // Actualizar campos específicos de la configuración
  async updateConfig(section, field, value) {
    try {
      const configRef = doc(db, 'config', CONFIG_DOC_ID);
      await updateDoc(configRef, {
        [`${section}.${field}`]: value
      });
      return true;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  },
  
  // Restaurar configuración por defecto
  async restoreDefaultConfig() {
    try {
      await this.saveConfig(CONFIG_DEFAULT);
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
      
      // Validar estructura básica
      if (!config.inventario || !config.respaldo || !config.interfaz || 
          !config.ventas || !config.impresion) {
        throw new Error('Formato de configuración inválido');
      }

      await this.saveConfig(config);
      return config;
    } catch (error) {
      console.error('Error importing config:', error);
      throw error;
    }
  }
}; 