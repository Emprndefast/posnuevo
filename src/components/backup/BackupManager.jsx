import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Backup as BackupIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { backupService } from '../../services/backupService';
import { useAuth } from '../../context/AuthContextMongo';
import { useSubscription } from '../../hooks/useSubscription';

export const BackupManager = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [creatingBackup, setCreatingBackup] = useState(false);

  // Cargar lista de respaldos
  const loadBackups = async () => {
    try {
      setLoading(true);
      const backupsList = await backupService.getBackupsList(user.uid);
      setBackups(backupsList);
    } catch (err) {
      setError('Error al cargar los respaldos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, [user.uid]);

  // Crear nuevo respaldo
  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      setError(null);
      setSuccess(null);

      const backup = await backupService.createBackup(user.uid, subscription);
      
      setSuccess('Respaldo creado exitosamente');
      await loadBackups(); // Recargar lista
    } catch (err) {
      setError('Error al crear respaldo: ' + err.message);
    } finally {
      setCreatingBackup(false);
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = (backup) => {
    setSelectedBackup(backup);
    setOpenConfirmDialog(true);
  };

  // Eliminar respaldo
  const handleDeleteBackup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await backupService.deleteBackup(user.uid, selectedBackup.id, selectedBackup.fileName);
      
      setSuccess('Respaldo eliminado exitosamente');
      setOpenConfirmDialog(false);
      await loadBackups(); // Recargar lista
    } catch (err) {
      setError('Error al eliminar respaldo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Formatear tamaño en bytes
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
          <BackupIcon sx={{ mr: 1 }} /> Respaldos de Datos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={creatingBackup ? <CircularProgress size={20} color="inherit" /> : <BackupIcon />}
          onClick={handleCreateBackup}
          disabled={creatingBackup || !subscription?.isActive}
        >
          Crear Respaldo
        </Button>
      </Box>

      {!subscription?.isActive && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          icon={<WarningIcon />}
        >
          Necesitas una suscripción activa para crear respaldos automáticos. 
          Los respaldos manuales están disponibles en el plan gratuito.
        </Alert>
      )}

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Paper elevation={2}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : backups.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No hay respaldos disponibles
            </Typography>
          </Box>
        ) : (
          <List>
            {backups.map((backup) => (
              <ListItem
                key={backup.id}
                secondaryAction={
                  <Box>
                    <Tooltip title="Descargar respaldo">
                      <IconButton 
                        edge="end" 
                        aria-label="descargar"
                        onClick={() => window.open(backup.downloadURL, '_blank')}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar respaldo">
                      <IconButton 
                        edge="end" 
                        aria-label="eliminar"
                        onClick={() => handleConfirmDelete(backup)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {backup.fileName}
                      <Tooltip title={`Productos: ${backup.items.productos}, Ventas: ${backup.items.ventas}, Clientes: ${backup.items.clientes}`}>
                        <InfoIcon sx={{ ml: 1, fontSize: 20, color: 'action.active' }} />
                      </Tooltip>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {format(backup.createdAt, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                      </Typography>
                      <Chip 
                        label={formatSize(backup.size)} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el respaldo{' '}
            <strong>{selectedBackup?.fileName}</strong>?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenConfirmDialog(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteBackup}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 