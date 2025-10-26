import React, { useEffect, useState } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Store as StoreIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  SupportAgent as SupportAgentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContextMongo';
import { useNavigate } from 'react-router-dom';
import SoporteTecnicoModal from '../SoporteTecnicoModal';
import NotificacionesModal from '../common/NotificacionesModal';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const AppBar = ({ children }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { user, logout } = useAuth();
  console.log({ user, logout });
  const navigate = useNavigate();
  const [openSoporte, setOpenSoporte] = useState(false);
  const [openNotificaciones, setOpenNotificaciones] = useState(false);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      handleClose();
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleNavigate = (path) => {
    handleClose();
    navigate(path);
  };

  useEffect(() => {
    if (!user) return;
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const q = query(
      collection(db, 'notificaciones'),
      where('uid', '==', user.uid),
      where('fecha', '>=', hoy.toISOString().slice(0,10)),
      where('leida', '==', false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotificacionesNoLeidas(snap.size);
    });
    return () => unsub();
  }, [user]);

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - 240px)` },
        ml: { sm: '240px' },
        background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
      }}
    >
      <Toolbar>
        {children}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <StoreIcon sx={{ fontSize: 28 }} />
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 600,
              letterSpacing: '0.5px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            POSENT
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" onClick={() => setOpenNotificaciones(true)}>
            <Badge badgeContent={notificacionesNoLeidas} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            onClick={handleMenu}
            size="small"
            sx={{ 
              ml: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
            aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
          >
            <Avatar 
              src={user?.fotoUrl || user?.profileImage || user?.photoURL || undefined}
              alt={user?.displayName || user?.email}
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {(!user?.fotoUrl && !user?.profileImage && !user?.photoURL && (user?.displayName?.[0] || user?.email?.[0])) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 180,
                borderRadius: 2,
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              },
            }}
          >
            <MenuItem onClick={() => handleNavigate('/perfil')}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mi Perfil</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/settings')}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Configuración</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => setOpenSoporte(true)}>
              <ListItemIcon>
                <SupportAgentIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Soporte técnico</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cerrar Sesión</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      <SoporteTecnicoModal open={openSoporte} onClose={() => setOpenSoporte(false)} />
      <NotificacionesModal open={openNotificaciones} onClose={() => setOpenNotificaciones(false)} />
    </MuiAppBar>
  );
}; 