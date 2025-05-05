import { useState, useEffect } from 'react';
import { configService } from '../services/configService';
import { CONFIG_DEFAULT } from '../constants/configConstants';

export const useConfig = () => {
  const [config, setConfig] = useState(CONFIG_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const userConfig = await configService.getConfig();
      setConfig(userConfig || CONFIG_DEFAULT);
      setError(null);
    } catch (err) {
      setError('Error al cargar la configuración');
      console.error('Error loading config:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      setLoading(true);
      await configService.saveConfig(newConfig);
      setConfig(newConfig);
      setError(null);
      return true;
    } catch (err) {
      setError('Error al actualizar la configuración');
      console.error('Error updating config:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateConfigField = async (section, field, value) => {
    try {
      setLoading(true);
      const updatedConfig = {
        ...config,
        [section]: {
          ...config[section],
          [field]: value
        }
      };
      await configService.updateConfig(section, field, value);
      setConfig(updatedConfig);
      setError(null);
      return true;
    } catch (err) {
      setError('Error al actualizar el campo de configuración');
      console.error('Error updating config field:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restoreDefaultConfig = async () => {
    try {
      setLoading(true);
      await configService.restoreDefaultConfig();
      setConfig(CONFIG_DEFAULT);
      setError(null);
      return true;
    } catch (err) {
      setError('Error al restaurar la configuración por defecto');
      console.error('Error restoring default config:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const exportConfig = async () => {
    try {
      return await configService.exportConfig();
    } catch (err) {
      setError('Error al exportar la configuración');
      console.error('Error exporting config:', err);
      return null;
    }
  };

  const importConfig = async (configData) => {
    try {
      setLoading(true);
      const importedConfig = await configService.importConfig(configData);
      setConfig(importedConfig);
      setError(null);
      return true;
    } catch (err) {
      setError('Error al importar la configuración');
      console.error('Error importing config:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    error,
    updateConfig,
    updateConfigField,
    restoreDefaultConfig,
    exportConfig,
    importConfig
  };
}; 