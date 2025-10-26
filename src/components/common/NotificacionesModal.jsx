import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Typography, Box, IconButton, Badge } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../context/AuthContextMongo';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const notificacionesMock = [
  { id: 1, mensaje: 'Venta realizada: $500', leida: false, fecha: '2024-06-01 10:00' },
  { id: 2, mensaje: 'Stock bajo: Producto XYZ', leida: false, fecha: '2024-06-01 11:00' },
  { id: 3, mensaje: 'Nuevo pedido recibido', leida: true, fecha: '2024-06-01 12:00' },
];

const NotificacionesModal = ({ open, onClose }) => {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    if (!user) return;
    // Mostrar todas las notificaciones del usuario (sin filtrar por fecha)
    const q = query(
      collection(db, 'notificaciones'),
      where('uid', '==', user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotificaciones(data.sort((a, b) => b.fecha.localeCompare(a.fecha)));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (open && notificaciones.length > 0) {
      // Marcar todas como leídas en Firestore
      notificaciones.forEach(async (n) => {
        if (!n.leida) {
          await updateDoc(doc(db, 'notificaciones', n.id), { leida: true });
        }
      });
    }
  }, [open, notificaciones]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Notificaciones del día</DialogTitle>
      <DialogContent>
        <List>
          {notificaciones.length === 0 && (
            <Typography variant="body2" color="text.secondary">No hay notificaciones.</Typography>
          )}
          {notificaciones.map((n) => (
            <ListItem key={n.id} sx={{ bgcolor: n.leida ? 'inherit' : 'rgba(25, 118, 210, 0.08)', borderRadius: 1, mb: 1 }}>
              <ListItemText
                primary={n.mensaje}
                secondary={n.fecha}
                primaryTypographyProps={{ fontWeight: n.leida ? 'normal' : 'bold' }}
              />
              {!n.leida && <Badge color="primary" variant="dot" />}
              {n.leida && <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} />}
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default NotificacionesModal; 