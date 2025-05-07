import React, { useState, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  useTheme, 
  useMediaQuery, 
  AppBar, 
  Toolbar, 
  Tooltip,
  Typography,
  Avatar,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Badge
} from '@mui/material';
import { Navigation } from './Navigation';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import StoreIcon from '@mui/icons-material/Store';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../../context/AuthContext';
import SoporteTecnicoModal from '../SoporteTecnicoModal';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import NotificacionesModal from '../common/NotificacionesModal';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import CanvaFlyerGenerator from '../canva/CanvaFlyerGenerator';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSoporte, setOpenSoporte] = useState(false);
  const [openNotificaciones, setOpenNotificaciones] = useState(false);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notificaciones'),
      where('uid', '==', user.uid),
      where('leida', '==', false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotificacionesNoLeidas(snap.size);
    });
    return () => unsub();
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/perfil');
    handleMenuClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    handleMenuClose();
  };

  const drawerWidth = isMobile ? '100%' : isTablet ? '280px' : '240px';

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth})` },
          ml: { xs: 0, sm: drawerWidth },
          zIndex: theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 1,
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StoreIcon sx={{ color: 'white' }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.8))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              POSENT
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {user && (
            <>
              <IconButton color="inherit" onClick={() => setOpenNotificaciones(true)}>
                <Badge badgeContent={notificacionesNoLeidas} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <NotificacionesModal open={openNotificaciones} onClose={() => setOpenNotificaciones(false)} />

              <Tooltip title="Opciones de perfil">
                <Box 
                  onClick={handleMenuOpen}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    cursor: 'pointer',
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <Box sx={{ 
                    textAlign: 'right', 
                    display: { xs: 'none', sm: 'block' }
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        color: 'white'
                      }}
                    >
                      {user.displayName || user.email?.split('@')[0]}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        display: 'block'
                      }}
                    >
                      Administrador
                    </Typography>
                  </Box>
                  <Avatar 
                    src={user.photoURL}
                    alt={user.displayName}
                    sx={{ 
                      width: 35, 
                      height: 35,
                      border: '2px solid',
                      borderColor: 'rgba(255,255,255,0.8)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      bgcolor: 'primary.dark',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    {user.displayName?.[0] || user.email?.[0]}
                  </Avatar>
                </Box>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 1,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    '& .MuiMenuItem-root': {
                      py: 1.5,
                      px: 2,
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  Mi Perfil
                </MenuItem>
                <MenuItem onClick={() => navigate('/settings')}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Configuración
                </MenuItem>
                <MenuItem onClick={() => setOpenSoporte(true)}>
                  <ListItemIcon>
                    <SupportAgentIcon fontSize="small" />
                  </ListItemIcon>
                  Soporte técnico
                </MenuItem>
                <MenuItem onClick={() => navigate('/canva-flyer')}>
                  <ListItemIcon>
                    <SupportAgentIcon fontSize="small" />
                  </ListItemIcon>
                  Generar Flyer Canva
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Navigation 
        mobileOpen={mobileOpen} 
        onClose={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          width: { 
            xs: '100%',
            sm: `calc(100% - ${drawerWidth})` 
          },
          ml: { 
            xs: 0,
            sm: drawerWidth 
          },
          mt: { 
            xs: '56px',
            sm: '64px' 
          },
          overflow: 'auto',
          maxWidth: '100%'
        }}
      >
        <Routes>
          {/* ...otras rutas... */}
          <Route path="/canva-flyer" element={<CanvaFlyerGenerator />} />
        </Routes>
        {children}
      </Box>
      <SoporteTecnicoModal open={openSoporte} onClose={() => setOpenSoporte(false)} />
    </Box>
  );
}; 

export default Layout; 