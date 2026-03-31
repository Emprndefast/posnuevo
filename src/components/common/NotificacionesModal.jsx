import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Typography, Box, IconButton, Badge, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContextMongo';
import api from '../../api/api';

const NotificacionesModal = ({ open, onClose }) => {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  // Intentar cargar notificaciones desde MongoDB
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !open) return;
      setLoading(true);
      try {
        const response = await api.get('/notifications');
        if (response.data && Array.isArray(response.data)) {
          setNotificaciones(response.data);
        }
      } catch (error) {
        console.warn('Endpoint de notificaciones no disponible en MongoDB, usando mocks.');
        // Si falla (porque el endpoint no existe aún), podemos usar mocks o dejar vacío
        setNotificaciones([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user, open]);

  // Marcar como leídas
  const handleMarkAsRead = async () => {
    if (!user || notificaciones.length === 0) return;
    try {
      // Intentar marcar en el backend
      await api.post('/notifications/mark-as-read');
    } catch (error) {
      console.error('Error al marcar notificaciones como leídas:', error);
    }
  };

  useEffect(() => {
    if (open && notificaciones.some(n => !n.leida)) {
      handleMarkAsRead();
    }
  }, [open, notificaciones]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        pb: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Notificaciones</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2, minHeight: 150 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List>
            {notificaciones.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">¡Todo al día! ✨ No hay notificaciones nuevas.</Typography>
              </Box>
            ) : (
              notificaciones.map((n) => (
                <ListItem 
                  key={n._id || n.id} 
                  sx={{ 
                    bgcolor: n.leida ? 'transparent' : 'rgba(25, 118, 210, 0.05)', 
                    borderRadius: 2, 
                    mb: 1,
                    border: n.leida ? '1px solid transparent' : '1px solid rgba(25, 118, 210, 0.1)'
                  }}
                >
                  <ListItemText
                    primary={n.titulo || n.mensaje}
                    secondary={n.fecha || new Date(n.timestamp).toLocaleString()}
                    primaryTypographyProps={{ 
                      fontWeight: n.leida ? 500 : 800,
                      fontSize: '0.9rem',
                      color: n.leida ? 'text.secondary' : 'text.primary'
                    }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                  {!n.leida && <Badge color="primary" variant="dot" sx={{ ml: 1 }} />}
                  {n.leida && <CheckCircleIcon color="success" sx={{ fontSize: 18, ml: 1, opacity: 0.5 }} />}
                </ListItem>
              ))
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificacionesModal;