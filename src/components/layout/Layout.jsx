import React, { useState, useEffect, startTransition } from 'react';
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
  Badge,
  Input,
  InputAdornment
} from '@mui/material';
import { Navigation } from './Navigation';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import StoreIcon from '@mui/icons-material/Store';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../context/AuthContextMongo';
import SoporteTecnicoModal from '../SoporteTecnicoModal';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import NotificacionesModal from '../common/NotificacionesModal';
import CanvaFlyerGenerator from '../canva/CanvaFlyerGenerator';
// Firebase imports - Mocked for backward compatibility
import { db, collection, query, where, onSnapshot } from '../../firebase/config';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSoporte, setOpenSoporte] = useState(false);
  const [openNotificaciones, setOpenNotificaciones] = useState(false);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
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
    startTransition(() => {
      navigate('/perfil');
    });
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

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const drawerWidth = isMobile ? '100%' : '280px';

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      flexDirection: isMobile ? 'column' : 'row',
      bgcolor: '#f5f5f5'
    }}>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth})` },
          ml: { xs: 0, sm: drawerWidth },
          zIndex: theme.zIndex.drawer + 1,
          background: 'white',
          color: 'gray.900',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '56px', sm: '56px' }, px: 2 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 1,
                color: 'gray.700',
                '&:hover': {
                  bgcolor: 'gray.100'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Search Bar - Similar to Whabot */}
          <Box 
            sx={{ 
              flex: 1, 
              mx: { xs: 1, md: 4 },
              display: { xs: 'none', md: 'block' }
            }}
          >
            <Input
              placeholder="Buscar productos, clientes, ventas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'gray.400' }} />
                </InputAdornment>
              }
              sx={{
                bgcolor: 'white',
                borderRadius: '12px',
                px: 2,
                py: 0.5,
                border: '1px solid #e5e7eb',
                '&:hover': {
                  borderColor: '#805AD5'
                },
                '&:focus-within': {
                  borderColor: '#805AD5',
                  boxShadow: '0 0 0 2px rgba(128, 90, 213, 0.2)'
                },
                '& .MuiInput-input': {
                  fontSize: '0.875rem',
                  py: 1
                }
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {user && (
            <>
              <IconButton 
                color="inherit" 
                onClick={() => setOpenNotificaciones(true)}
                sx={{
                  color: 'gray.600',
                  mr: 1,
                  '&:hover': {
                    bgcolor: 'gray.100'
                  }
                }}
              >
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
                    gap: 1,
                    cursor: 'pointer',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'gray.100'
                    }
                  }}
                >
                  <Avatar 
                    src={user.photoURL}
                    alt={user.displayName}
                    sx={{ 
                      width: 32, 
                      height: 32,
                      border: '1px solid',
                      borderColor: 'gray.200',
                      bgcolor: 'primary.main'
                    }}
                  >
                    {user.displayName?.[0] || user.email?.[0]}
                  </Avatar>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: 'gray.700',
                        fontSize: '0.875rem'
                      }}
                    >
                      {user.displayName || user.email?.split('@')[0]}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'gray.500',
                        display: 'block'
                      }}
                    >
                      Administrador
                    </Typography>
                  </Box>
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
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid',
                    borderColor: 'gray.200',
                    '& .MuiMenuItem-root': {
                      py: 1.5,
                      px: 2,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'purple.50'
                      }
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
                <MenuItem onClick={() => startTransition(() => navigate('/settings'))}>
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
                <Divider />
                <MenuItem 
                  onClick={handleLogout} 
                  sx={{ 
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.50',
                      color: 'error.dark'
                    }
                  }}
                >
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
          p: { xs: 2, sm: 3, md: 4 },
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
            sm: '56px' 
          },
          overflow: 'auto',
          maxWidth: '100%',
          bgcolor: '#f5f5f5'
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