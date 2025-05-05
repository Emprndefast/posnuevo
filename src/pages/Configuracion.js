import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import { useConfig } from '../hooks/useConfig';
import BusinessInfoCard from '../components/config/BusinessInfoCard';
import GeneralPreferencesCard from '../components/config/GeneralPreferencesCard';
import DateTimeCard from '../components/config/DateTimeCard';
import PrintingCard from '../components/config/PrintingCard';
import AdvancedCard from '../components/config/AdvancedCard';
import { Help, Save, Restore, Download, Upload } from '@mui/icons-material';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import ContentCard from '../components/layout/ContentCard';
import ContentSection from '../components/layout/ContentSection';
import { pageStyles, cardStyles } from '../styles/commonStyles';

const Configuracion = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { config, loading, error, updateConfig, updateConfigField, restoreDefaultConfig, exportConfig, importConfig } = useConfig();
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', title: '', message: '' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Efecto para manejar cambios no guardados
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleTabChange = (event, newValue) => {
    if (hasUnsavedChanges) {
      setConfirmDialog({
        open: true,
        type: 'tabChange',
        title: 'Cambios no guardados',
        message: 'Tienes cambios sin guardar. ¿Deseas continuar sin guardar los cambios?'
      });
    } else {
      setActiveTab(newValue);
    }
  };

  const handleConfigChange = async (newConfig) => {
    try {
      setHasUnsavedChanges(true);
      await updateConfig(newConfig);
      showNotification('Configuración actualizada correctamente', 'success');
      setHasUnsavedChanges(false);
    } catch (error) {
      showNotification(`Error al actualizar la configuración: ${error.message}`, 'error');
    }
  };

  const handleRestoreDefault = async () => {
    setConfirmDialog({
      open: true,
      type: 'restore',
      title: 'Restaurar configuración',
      message: '¿Estás seguro de que deseas restaurar todos los valores a su configuración por defecto? Esta acción no se puede deshacer.'
    });
  };

  const confirmRestoreDefault = async () => {
    try {
      await restoreDefaultConfig();
      showNotification('Configuración restaurada a valores por defecto', 'success');
      setHasUnsavedChanges(false);
    } catch (error) {
      showNotification(`Error al restaurar la configuración: ${error.message}`, 'error');
    }
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleExportConfig = async () => {
    try {
      await exportConfig();
      showNotification('Configuración exportada correctamente', 'success');
    } catch (error) {
      showNotification(`Error al exportar la configuración: ${error.message}`, 'error');
    }
  };

  const handleImportConfig = async (configData) => {
    setConfirmDialog({
      open: true,
      type: 'import',
      title: 'Importar configuración',
      message: '¿Estás seguro de que deseas importar esta configuración? Se sobrescribirán todos los valores actuales.'
    });
  };

  const confirmImportConfig = async (configData) => {
    try {
      await importConfig(configData);
      showNotification('Configuración importada correctamente', 'success');
      setHasUnsavedChanges(false);
    } catch (error) {
      showNotification(`Error al importar la configuración: ${error.message}`, 'error');
    }
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleConfirmAction = () => {
    switch (confirmDialog.type) {
      case 'restore':
        confirmRestoreDefault();
        break;
      case 'tabChange':
        setActiveTab(confirmDialog.newTab);
        setHasUnsavedChanges(false);
        break;
      default:
        break;
    }
    handleCloseConfirmDialog();
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography>Cargando configuración...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          Error al cargar la configuración: {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          startIcon={<Restore />}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <ResponsiveLayout>
      <ContentSection columns={2}>
        <DateTimeCard
          config={config}
          onConfigChange={handleConfigChange}
        />

        <PrintingCard
          config={config}
          onConfigChange={handleConfigChange}
        />

        <AdvancedCard
          config={config}
          onConfigChange={handleConfigChange}
          onExportConfig={handleExportConfig}
          onImportConfig={handleImportConfig}
          onRestoreDefault={handleRestoreDefault}
        />
      </ContentSection>
    </ResponsiveLayout>
  );
};

export default Configuracion;