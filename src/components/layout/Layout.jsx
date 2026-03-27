import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
  Input,
  Paper,
  Popper,
  ClickAwayListener,
  List,
  ListItemText,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  ShoppingCart as SalesIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
  SupportAgent as SupportAgentIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContextMongo';
import { Navigation } from './Navigation';
import { NotificacionesModal } from '../notifications/NotificacionesModal';
import { SoporteTecnicoModal } from '../support/SoporteTecnicoModal';
import { ProductDetailModal } from '../products/ProductDetailModal';
import { useBusiness } from '../../context/BusinessContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import axios from 'axios';
import CanvaFlyerGenerator from '../tools/CanvaFlyerGenerator';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { businessData } = useBusiness();
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Lógica de Notificaciones en Tiempo Real
  useEffect(() => {
    if (!user) return;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const q = query(
      collection(db, 'notificaciones'),
      where('uid', '==', (user.uid || user.id)),
      where('fecha', '>=', hoy.toISOString().slice(0, 10)),
      where('leida', '==', false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotificacionesNoLeidas(snap.size);
    });
    return () => unsub();
  }, [user]);
  const [openNotificaciones, setOpenNotificaciones] = useState(false);
  const [openSoporte, setOpenSoporte] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], customers: [], sales: [], repairs: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [navigationResults, setNavigationResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerWidth = 280;

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults({ products: [], customers: [], sales: [], repairs: [] });
      setNavigationResults([]);
      return;
    }

    setIsSearching(true);
    
    // Quick search in navigation
    const navItems = [
      { title: 'Ir al Dashboard 🏠', path: '/dashboard', type: 'Sección' },
      { title: 'Ver Productos 📦', path: '/products', type: 'Sección' },
      { title: 'Nueva Venta 🛒', path: '/sales', type: 'Acción' },
      { title: 'Lista de Clientes 👥', path: '/customers', type: 'Sección' },
      { title: 'Reportes y Análisis 📊', path: '/analytics', type: 'Sección' }
    ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
    
    setNavigationResults(navItems);

    try {
      const response = await axios.get(`${API_URL}/search?q=${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error en búsqueda global:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (path) => {
    setSearchAnchorEl(null);
    setSearchQuery('');
    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 2,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(16px)',
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '72px', md: '80px' }, px: { xs: 2, md: 4 } }}>
          {isMobile && (
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                color: 'primary.main',
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                borderRadius: '12px',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Buscador Versión Pro */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', position: 'relative', maxWidth: 650 }}>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                bgcolor: alpha(theme.palette.action.hover, 0.05),
                borderRadius: '50px',
                px: 2.5,
                py: 1.2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.3s ease',
                '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.1) },
                '&:focus-within': {
                  bgcolor: 'background.paper',
                  borderColor: 'primary.main',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`
                }
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', mr: 1.5, fontSize: 22 }} />
              <Input
                placeholder="Busca productos, clientes o lo que necesites hoy... 🔎"
                disableUnderline
                value={searchQuery}
                onChange={(e) => {
                  handleSearch(e.target.value);
                  setSearchAnchorEl(e.currentTarget.parentElement);
                }}
                onFocus={(e) => {
                  if (searchQuery.length >= 2) setSearchAnchorEl(e.currentTarget.parentElement);
                }}
                sx={{
                  width: '100%',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              />
              <Box sx={{
                px: 1,
                py: 0.3,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                display: { xs: 'none', lg: 'block' }
              }}>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800 }}>Ctrl+K</Typography>
              </Box>
            </Box>

            <Popper
              open={Boolean(searchAnchorEl) && searchQuery.length >= 2}
              anchorEl={searchAnchorEl}
              placement="bottom-start"
              style={{ zIndex: 1400, width: searchAnchorEl?.offsetWidth || 600 }}
            >
              <ClickAwayListener onClickAway={() => setSearchAnchorEl(null)}>
                <Paper
                  elevation={0}
                  sx={{
                    mt: 1.5,
                    borderRadius: 3,
                    boxShadow: '0 15px 45px rgba(0,0,0,0.12)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    bgcolor: alpha(theme.palette.background.paper, 0.98),
                    backdropFilter: 'blur(12px)',
                    overflow: 'hidden'
                  }}
                >
                  <List sx={{ py: 0, maxHeight: 450, overflowY: 'auto' }}>
                    {isSearching ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>
                    ) : (
                      <>
                        {navigationResults.length > 0 && (
                          <Box sx={{ p: 1 }}>
                            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.65rem' }}>📍 ACCESOS RÁPIDOS</Typography>
                            {navigationResults.map((item, idx) => (
                              <MenuItem key={idx} onClick={() => handleResultClick(item.path)} sx={{ borderRadius: 2, mb: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}><DashboardIcon fontSize="small" /></ListItemIcon>
                                <ListItemText primary={item.title} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.88rem' }} />
                              </MenuItem>
                            ))}
                          </Box>
                        )}
                        {searchResults.products?.length > 0 && (
                          <Box sx={{ p: 1 }}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 800, color: 'success.main', textTransform: 'uppercase', fontSize: '0.65rem' }}>📦 PRODUCTOS</Typography>
                            {searchResults.products.map((p) => (
                              <MenuItem key={p._id} onClick={() => { setSearchAnchorEl(null); setSelectedProduct(p); }} sx={{ borderRadius: 2 }}>
                                <ListItemIcon sx={{ minWidth: 40 }}><InventoryIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary={p.nombre} secondary={`RD$ ${p.precio} | Stock: ${p.stock}`} />
                              </MenuItem>
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                  </List>
                </Paper>
              </ClickAwayListener>
            </Popper>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={{ xs: 0.5, md: 1.5 }} alignItems="center">
            {user && (
              <>
                <IconButton
                  onClick={() => startTransition(() => setOpenNotificaciones(true))}
                  sx={{
                    color: 'text.secondary',
                    bgcolor: alpha(theme.palette.action.hover, 0.05),
                    width: 44,
                    height: 44,
                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08), color: 'error.main', transform: 'translateY(-2px)' },
                    transition: 'all 0.25s'
                  }}
                >
                  <Badge badgeContent={notificacionesNoLeidas} color="error" overlap="circular">
                    <NotificationsIcon sx={{ fontSize: 22 }} />
                  </Badge>
                </IconButton>
                <NotificacionesModal open={openNotificaciones} onClose={() => setOpenNotificaciones(false)} />

                <Box
                  onClick={handleMenuOpen}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    py: 0.8,
                    px: 0.8,
                    borderRadius: '40px',
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <Avatar
                    src={user.photoURL}
                    sx={{
                      width: 40,
                      height: 40,
                      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    {user.displayName?.[0] || user.email?.[0]}
                  </Avatar>
                  <Box sx={{ display: { xs: 'none', lg: 'block' }, pr: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
                      {user.displayName || user.email?.split('@')[0]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 800, fontSize: '0.62rem', letterSpacing: 0.5 }}>
                      EN LÍNEA 🟢
                    </Typography>
                  </Box>
                </Box>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 2,
                      width: 240,
                      borderRadius: 4,
                      boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                      p: 1,
                      '& .MuiMenuItem-root': {
                        py: 1.5,
                        px: 2,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main' }
                      }
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={handleProfile}><ListItemIcon><AccountCircleIcon /></ListItemIcon> Mi Cuenta 👤</MenuItem>
                  <MenuItem onClick={() => startTransition(() => navigate('/settings'))}><ListItemIcon><SettingsIcon /></ListItemIcon> Ajustes ⚙️</MenuItem>
                  <MenuItem onClick={() => startTransition(() => setOpenSoporte(true))}><ListItemIcon><SupportAgentIcon /></ListItemIcon> Soporte Amigo 🎧</MenuItem>
                  <Divider sx={{ my: 1, opacity: 0.5 }} />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) } }}>
                    <ListItemIcon><LogoutIcon color="error" /></ListItemIcon> Salir 👋
                  </MenuItem>
                </Menu>
              </>
            )}
          </Stack>
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
          p: { xs: 2, sm: 3, md: 4, lg: 5 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '80px', md: '90px' },
          bgcolor: 'background.default',
          transition: 'all 0.3s ease'
        }}
      >
        <Routes>
          <Route path="/canva-flyer" element={<CanvaFlyerGenerator />} />
        </Routes>
        {children}
      </Box>

      <SoporteTecnicoModal open={openSoporte} onClose={() => setOpenSoporte(false)} />
      <ProductDetailModal
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </Box>
  );
};

export default Layout;