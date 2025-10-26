import React, { useState, useEffect } from 'react';
import {
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Divider,
  useMediaQuery,
  Tooltip,
  SwipeableDrawer,
  useTheme as useMuiTheme,
  alpha,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Build as ReparacionesIcon,
  Inventory as InventarioIcon,
  People as ClientesIcon,
  Settings as ConfiguracionIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  BarChart as BarChartIcon,
  LocalShipping as ProveedoresIcon,
  Handyman as ServiciosIcon,
  CardMembership as SubscriptionIcon,
} from '@mui/icons-material';
import { useTheme } from '../pages/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContextMongo';

const drawerWidth = 280;
const collapsedWidth = 80;

const NavigationDrawer = ({ children }) => {
  const muiTheme = useMuiTheme();
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('sm', 'md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile && !isTablet);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Cerrar el drawer en móvil cuando cambia la ruta
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Mostrar un mensaje de error al usuario
      alert('Error al cerrar sesión. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Reparaciones', icon: <ReparacionesIcon />, path: '/reparaciones' },
    { text: 'Inventario', icon: <InventarioIcon />, path: '/inventario' },
    { text: 'Contabilidad', icon: <BarChartIcon />, path: '/contabilidad' },
    { text: 'Clientes', icon: <ClientesIcon />, path: '/clientes' },
    { text: 'Servicios', icon: <ServiciosIcon />, path: '/servicios' },
    { text: 'Proveedores', icon: <ProveedoresIcon />, path: '/proveedores' },
    { text: 'Suscripciones', icon: <SubscriptionIcon />, path: '/subscriptions' },
    { text: 'Mi Cuenta', icon: <AccountCircleIcon />, path: '/perfil' },
    { text: 'Configuración', icon: <ConfiguracionIcon />, path: '/configuracion' },
    { text: 'Cerrar sesión', icon: <LogoutIcon />, action: 'logout' },
  ];

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: darkMode 
        ? 'linear-gradient(180deg, #1a1a1a 0%, #121212 100%)' 
        : 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
    }}>
      <Toolbar sx={{ 
        minHeight: { xs: 56, sm: 64 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: drawerOpen ? 'space-between' : 'center',
        px: 2,
      }}>
        {drawerOpen ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar 
                src="/logo.png" 
                alt="Logo" 
                sx={{ 
                  width: 40, 
                  height: 40,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Reparaciones NT
              </Typography>
            </Box>
            <IconButton
              onClick={() => setDrawerOpen(false)}
              sx={{
                color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                '&:hover': {
                  color: darkMode ? '#fff' : '#000',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </>
        ) : (
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{
              color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              '&:hover': {
                color: darkMode ? '#fff' : '#000',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      <Divider sx={{ 
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        mx: 2,
      }} />

      <List sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        px: 2,
        '& .MuiListItem-root': {
          borderRadius: 2,
          mb: 1,
        }
      }}>
        {menuItems.map(({ text, icon, path, action }) => {
          const isActive = path === location.pathname;
          return (
            <Tooltip 
              key={text} 
              title={!drawerOpen ? text : ''} 
              placement="right"
            >
              <ListItem
                button
                disabled={action === 'logout' && isLoggingOut}
                onClick={() => {
                  if (action === 'logout') {
                    handleLogout();
                  } else {
                    navigate(path);
                    if (isMobile) setMobileOpen(false);
                  }
                }}
                sx={{
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  backgroundColor: isActive 
                    ? alpha(darkMode ? '#fff' : '#000', darkMode ? 0.1 : 0.05)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(darkMode ? '#fff' : '#000', darkMode ? 0.15 : 0.08),
                  },
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  '&::after': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: '60%',
                    backgroundColor: 'primary.main',
                    borderRadius: '0 4px 4px 0',
                  } : {},
                }}
              >
                <ListItemIcon
                  sx={{ 
                    minWidth: 0, 
                    mr: drawerOpen ? 2 : 'auto', 
                    justifyContent: 'center',
                    color: isActive ? 'primary.main' : darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                    transition: 'color 0.2s ease-in-out',
                  }}
                >
                  {icon}
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText 
                    primary={text} 
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: isActive ? 600 : 400,
                        color: darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
                      }
                    }}
                  />
                )}
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );

  // Componente de drawer para móvil con gestos de deslizamiento
  const MobileDrawer = () => (
    <SwipeableDrawer
      variant="temporary"
      anchor="left"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      onOpen={() => setMobileOpen(true)}
      ModalProps={{
        keepMounted: true, // Mejor rendimiento en dispositivos móviles
      }}
      sx={{
        display: { xs: 'block', sm: 'none' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: darkMode ? '#121212' : '#fff',
        },
      }}
    >
      {drawerContent}
    </SwipeableDrawer>
  );

  // Componente de drawer para tablet y escritorio
  const DesktopDrawer = () => (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', sm: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerOpen ? drawerWidth : collapsedWidth,
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          backgroundColor: darkMode ? '#121212' : '#fff',
          borderRight: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
        },
      }}
      open={true}
    >
      {drawerContent}
    </Drawer>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: muiTheme.zIndex.drawer + 1,
          backgroundColor: darkMode ? '#1e1e1e' : '#fff',
          color: darkMode ? '#fff' : '#000',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Reparaciones POS
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerOpen ? drawerWidth : collapsedWidth } }}
      >
        <MobileDrawer />
        <DesktopDrawer />
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pt: { xs: 9, sm: 10 },
          transition: 'margin 0.3s ease',
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : collapsedWidth}px)` },
          ml: { sm: drawerOpen ? `${drawerWidth}px` : `${collapsedWidth}px` },
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default NavigationDrawer;
