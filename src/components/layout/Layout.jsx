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
  InputAdornment,
  CircularProgress,
  ListItemText
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
import {
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import NotificacionesModal from '../common/NotificacionesModal';
import CanvaFlyerGenerator from '../canva/CanvaFlyerGenerator';
import api from '../../config/api';
// Firebase imports - Mocked for backward compatibility
import { db, collection, query, where, onSnapshot } from '../../firebase/config';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSoporte, setOpenSoporte] = useState(false);
  const [openNotificaciones, setOpenNotificaciones] = useState(false);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], customers: [], repairs: [], sales: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [navigationResults, setNavigationResults] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Buscar"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults({ products: [], customers: [], repairs: [], sales: [] });
      setNavigationResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Local Navigation Search
      const navMatches = [
        { title: 'Nueva Venta', path: '/quick-sale', icon: <ShoppingCartIcon />, type: 'ACCION' },
        { title: 'Productos / Inventario', path: '/products', icon: <InventoryIcon />, type: 'SECCION' },
        { title: 'Lista de Ventas', path: '/sales', icon: <ReceiptIcon />, type: 'SECCION' },
        { title: 'Clientes', path: '/customers', icon: <PeopleIcon />, type: 'SECCION' },
        { title: 'Reparaciones', path: '/repairs', icon: <BuildIcon />, type: 'SECCION' },
        { title: 'Configuración / Ajustes', path: '/settings', icon: <SettingsIcon />, type: 'SECCION' },
        { title: 'Reportes y Análisis', path: '/reports', icon: <AssessmentIcon />, type: 'SECCION' },
        { title: 'Dashboard / Inicio', path: '/dashboard', icon: <DashboardIcon />, type: 'SECCION' },
        { title: 'Caja / Arqueo', path: '/dashboard', icon: <AccountBalanceIcon />, type: 'SECCION' }
      ].filter(item => item.title.toLowerCase().includes(val.toLowerCase()));
      setNavigationResults(navMatches);

      const response = await api.get(`/search/global?q=${val}`);
      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (path) => {
    startTransition(() => {
      navigate(path);
    });
    setSearchQuery('');
    setSearchResults({ products: [], customers: [], repairs: [], sales: [] });
    setNavigationResults([]);
    setSearchAnchorEl(null);
  };

  const drawerWidth = isMobile ? '100%' : '280px';

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      flexDirection: isMobile ? 'column' : 'row',
      bgcolor: 'background.default',
      transition: 'background-color 0.3s ease'
    }}>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${drawerWidth})` },
          ml: { xs: 0, md: drawerWidth },
          zIndex: theme.zIndex.drawer + 1,
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[1],
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '64px', md: '64px' }, px: 2 }}>
          {isMobile && (
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 1,
                color: 'inherit',
                backgroundColor: 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected'
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
              display: { xs: 'none', md: 'block' },
              position: 'relative'
            }}
          >
            <Input
              placeholder="Buscar productos, clientes, ventas, configuración... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => {
                handleSearch(e.target.value);
                setSearchAnchorEl(e.currentTarget);
              }}
              onFocus={(e) => {
                if (searchQuery.length >= 2) setSearchAnchorEl(e.currentTarget);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'primary.main', mr: 1 }} />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <Box sx={{
                    px: 0.8,
                    py: 0.2,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: { xs: 'none', lg: 'block' }
                  }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>⌘K</Typography>
                  </Box>
                </InputAdornment>
              }
              disableUnderline
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                borderRadius: '12px',
                px: 2,
                py: 0.5,
                width: '100%',
                maxWidth: '600px',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover'
                },
                '&:focus-within': {
                  borderColor: 'primary.main',
                  boxShadow: `0 0 0 2px ${theme.palette.primary.main}22`,
                  bgcolor: 'background.paper'
                }
              }}
            />

            {/* Dropdown de Resultados */}
            <Menu
              anchorEl={searchAnchorEl}
              open={Boolean(searchAnchorEl) && (navigationResults.length > 0 || searchResults.products?.length > 0 || searchResults.customers?.length > 0 || searchResults.sales?.length > 0 || searchResults.repairs?.length > 0 || isSearching)}
              onClose={() => setSearchAnchorEl(null)}
              autoFocus={false}
              disableAutoFocusItem
              PaperProps={{
                sx: {
                  mt: 1,
                  width: searchAnchorEl?.offsetWidth || 600,
                  maxHeight: 500,
                  borderRadius: 2,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  border: `1px solid ${theme.palette.divider}`,
                }
              }}
            >
              {isSearching && (
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {!isSearching && navigationResults.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold', color: 'primary.main' }}>
                    ACCIONES Y SECCIONES
                  </Typography>
                  {navigationResults.map((item, idx) => (
                    <MenuItem key={idx} onClick={() => handleResultClick(item.path)}>
                      <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.title} secondary={item.type} />
                    </MenuItem>
                  ))}
                  <Divider />
                </>
              )}

              {searchResults.products?.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold', color: 'success.main' }}>
                    PRODUCTOS
                  </Typography>
                  {searchResults.products.map((p) => (
                    <MenuItem key={p._id} onClick={() => handleResultClick(`/productos`)}>
                      <ListItemIcon sx={{ minWidth: 36 }}><InventoryIcon fontSize="small" color="success" /></ListItemIcon>
                      <ListItemText primary={p.nombre} secondary={`Stock: ${p.stock} | RD$ ${p.precio}`} />
                    </MenuItem>
                  ))}
                  <Divider />
                </>
              )}

              {searchResults.customers?.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold', color: 'info.main' }}>
                    CLIENTES
                  </Typography>
                  {searchResults.customers.map((c) => (
                    <MenuItem key={c._id} onClick={() => handleResultClick(`/clientes`)}>
                      <ListItemIcon sx={{ minWidth: 36 }}><PeopleIcon fontSize="small" color="info" /></ListItemIcon>
                      <ListItemText primary={c.nombre} secondary={c.email || c.telefono} />
                    </MenuItem>
                  ))}
                  <Divider />
                </>
              )}

              {searchResults.sales?.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold', color: 'warning.main' }}>
                    VENTAS
                  </Typography>
                  {searchResults.sales.map((s) => (
                    <MenuItem key={s._id} onClick={() => handleResultClick(`/sales`)}>
                      <ListItemIcon sx={{ minWidth: 36 }}><ReceiptIcon fontSize="small" color="warning" /></ListItemIcon>
                      <ListItemText primary={`Venta ${s.numero_venta}`} secondary={`Total: RD$ ${s.total} | ${s.estado}`} />
                    </MenuItem>
                  ))}
                  <Divider />
                </>
              )}

              {searchResults.repairs?.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold', color: 'error.main' }}>
                    REPARACIONES
                  </Typography>
                  {searchResults.repairs.map((r) => (
                    <MenuItem key={r._id} onClick={() => handleResultClick(`/repairs`)}>
                      <ListItemIcon sx={{ minWidth: 36 }}><BuildIcon fontSize="small" color="error" /></ListItemIcon>
                      <ListItemText primary={`${r.brand} ${r.device}`} secondary={`Cliente: ${r.customer_name} | ${r.status}`} />
                    </MenuItem>
                  ))}
                </>
              )}

              {!isSearching && navigationResults.length === 0 && searchResults.products?.length === 0 && searchResults.customers?.length === 0 && searchResults.sales?.length === 0 && searchResults.repairs?.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">No se encontraron resultados para "{searchQuery}"</Typography>
                </Box>
              )}
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {user && (
            <>
              <IconButton
                color="inherit"
                onClick={() => startTransition(() => setOpenNotificaciones(true))}
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
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    border: '1px solid',
                    borderColor: 'gray.300',
                    bgcolor: 'white',
                    '& .MuiMenuItem-root': {
                      py: 1.5,
                      px: 2,
                      borderRadius: 1,
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: '#f3f4f6'
                      }
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'text.secondary',
                      minWidth: 36,
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
                <MenuItem onClick={() => startTransition(() => setOpenSoporte(true))}>
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
            sm: '100%'
          },
          ml: {
            xs: 0,
            sm: 0
          },
          mt: {
            xs: '64px',
            md: '64px'
          },
          overflow: 'auto',
          maxWidth: '100%',
          bgcolor: 'background.default',
          transition: 'background-color 0.3s ease'
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