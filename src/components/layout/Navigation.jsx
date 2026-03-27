import React, { startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as SalesIcon,
  People as CustomersIcon,
  Analytics as AnalyticsIcon,
  CardMembership as SubscriptionIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Receipt as InvoiceIcon,
  LocalShipping as SupplierIcon,
  LocalOffer as PromotionIcon,
  BuildCircle as RepairsIcon
} from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Link } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';

const menuGroups = [
  {
    group: 'Inicio',
    items: [
      { text: 'Resumen Diario', icon: <DashboardIcon />, path: '/dashboard' },
    ],
  },
  {
    group: 'Tu Negocio',
    items: [
      { text: 'Mis Productos', icon: <InventoryIcon />, path: '/products' },
      { text: 'Ventas y Caja', icon: <SalesIcon />, path: '/sales' },
      { text: 'Reparaciones', icon: <RepairsIcon />, path: '/reparaciones' },
    ],
  },
  {
    group: 'Relaciones',
    items: [
      { text: 'Mis Clientes', icon: <CustomersIcon />, path: '/customers' },
      { text: 'Análisis Pro', icon: <AnalyticsIcon />, path: '/analytics' },
    ],
  },
  {
    group: 'Operaciones',
    items: [
      { text: 'Facturación', icon: <InvoiceIcon />, path: '/billing' },
      { text: 'Proveedores', icon: <SupplierIcon />, path: '/suppliers' },
      { text: 'Promociones', icon: <PromotionIcon />, path: '/promotions' },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { text: 'Suscripción', icon: <SubscriptionIcon />, path: '/subscriptions' },
      { text: 'Ajustes', icon: <SettingsIcon />, path: '/settings' },
    ],
  },
];

export const Navigation = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { businessData } = useBusiness();

  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      startTransition(() => {
        navigate(path);
      });
    }
    if (isMobile && onClose) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: alpha(theme.palette.background.paper, 0.95),
      backdropFilter: 'blur(10px)'
    }}>
      {/* Brand Section */}
      <Box
        sx={{
          p: 3,
          pt: 4,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Box
          component="img"
          src={businessData?.logo || "/Posent-logo.png"}
          alt="POSENT Logo"
          sx={{
            height: 50,
            width: 'auto',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
            mb: 1
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.2rem',
            letterSpacing: -0.5
          }}
        >
          POSENT PRO
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: '0.6rem' }}>
          Sistema de Control
        </Typography>
      </Box>

      <Box sx={{ overflowY: 'auto', flex: 1, px: 2, '&::-webkit-scrollbar': { width: 4 } }}>
        {menuGroups.map((group, idx) => (
          <Box key={group.group} sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                px: 2,
                mb: 1,
                display: 'block',
                fontWeight: 800,
                color: 'text.secondary',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: 1
              }}
            >
              {group.group}
            </Typography>
            <List sx={{ p: 0 }}>
              {group.items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        borderRadius: '16px',
                        py: 1.2,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                        color: active ? 'primary.main' : 'text.secondary',
                        position: 'relative',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          color: 'primary.main',
                          '& .MuiListItemIcon-root': { color: 'primary.main', transform: 'scale(1.1)' }
                        },
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main'
                        }
                      }}
                    >
                      {active && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            width: 4,
                            height: '60%',
                            bgcolor: 'primary.main',
                            borderRadius: '0 4px 4px 0'
                          }}
                        />
                      )}
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: active ? 'primary.main' : 'inherit',
                          transition: 'all 0.2s'
                        }}
                      >
                        {React.cloneElement(item.icon, { fontSize: 'small' })}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.88rem',
                          fontWeight: active ? 700 : 500,
                          letterSpacing: -0.2
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer Support Section */}
      <Box sx={{ p: 2, pb: 4 }}>
        <Link to="/manual" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '20px',
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '12px',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <HelpOutlineIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8rem' }}>
                Guía Amiga
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                ¿Necesitas ayuda?
              </Typography>
            </Box>
          </Box>
        </Link>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={onClose}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          ...(isMobile && { maxWidth: '85vw' }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}; 