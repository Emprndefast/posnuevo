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
  Collapse
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
  BuildCircle as RepairsIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Link } from 'react-router-dom';

// Grouped menu items similar to Whabot
const menuGroups = [
  {
    group: 'Inicio',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    ],
  },
  {
    group: 'Ventas y Productos',
    items: [
      { text: 'Productos', icon: <InventoryIcon />, path: '/products' },
      { text: 'Ventas', icon: <SalesIcon />, path: '/sales' },
      { text: 'Reparaciones', icon: <RepairsIcon />, path: '/repairs' },
    ],
  },
  {
    group: 'Clientes y Análisis',
    items: [
      { text: 'Clientes', icon: <CustomersIcon />, path: '/customers' },
      { text: 'Análisis', icon: <AnalyticsIcon />, path: '/analytics' },
    ],
  },
  {
    group: 'Comercio',
    items: [
      { text: 'Pasarelas de Pago', icon: <PaymentIcon />, path: '/payment-gateways' },
      { text: 'Facturación', icon: <InvoiceIcon />, path: '/billing' },
      { text: 'Proveedores', icon: <SupplierIcon />, path: '/suppliers' },
      { text: 'Promociones', icon: <PromotionIcon />, path: '/promotions' },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { text: 'Suscripciones', icon: <SubscriptionIcon />, path: '/subscriptions' },
      { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
      { text: 'Ayuda', icon: <HelpOutlineIcon />, path: '/help' },
    ],
  },
];

export const Navigation = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedGroups, setExpandedGroups] = React.useState({});

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

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

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
          bgcolor: 'white',
          borderRight: '1px solid #e5e7eb',
          ...(isMobile && {
            maxWidth: '85vw',
          }),
        },
      }}
    >
      {/* Logo/Brand Section */}
      <Box 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/Posent-logo.png"
            alt="POSENT Logo"
            sx={{
              height: 45,
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '1.25rem'
            }}
          >
            POSENT PRO
          </Typography>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {menuGroups.map((group, groupIndex) => (
          <Box key={group.group}>
            <Box
              onClick={() => toggleGroup(group.group)}
              sx={{
                px: 2,
                py: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': {
                  bgcolor: 'gray.50'
                }
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.65rem'
                }}
              >
                {group.group}
              </Typography>
            </Box>
            
            <List sx={{ py: 0 }}>
              {group.items.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      mx: 1,
                      borderRadius: '12px',
                      minHeight: 48,
                      '&.Mui-selected': {
                        backgroundColor: 'purple.50',
                        color: 'purple.600',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: 'purple.100',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'purple.600',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'gray.50',
                      },
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: location.pathname === item.path ? 'primary.main' : 'gray.600',
                        minWidth: 40
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: location.pathname === item.path ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            
            {groupIndex < menuGroups.length - 1 && (
              <Divider sx={{ my: 1 }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Footer Section */}
      <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
        <Link to="/manual" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: 'gray.50',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'gray.100',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }
            }}
          >
            <HelpOutlineIcon sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                Manual de Usuario
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Ayuda y guía
              </Typography>
            </Box>
          </Box>
        </Link>
      </Box>
    </Drawer>
  );
}; 