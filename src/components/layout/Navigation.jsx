import React from 'react';
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
  Typography
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
  LocalOffer as PromotionIcon
} from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Link } from 'react-router-dom';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Productos', icon: <InventoryIcon />, path: '/products' },
  { text: 'Ventas', icon: <SalesIcon />, path: '/sales' },
  { text: 'Clientes', icon: <CustomersIcon />, path: '/customers' },
  { text: 'Análisis', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Suscripciones', icon: <SubscriptionIcon />, path: '/subscriptions' },
  { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' }
];

const commerceItems = [
  { text: 'Pasarelas de Pago', icon: <PaymentIcon />, path: '/payment-gateways' },
  { text: 'Facturación Electrónica', icon: <InvoiceIcon />, path: '/e-invoicing' },
  { text: 'Proveedores', icon: <SupplierIcon />, path: '/suppliers' },
  { text: 'Promociones', icon: <PromotionIcon />, path: '/promotions' }
];

export const Navigation = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={onClose}
      sx={{
        width: isMobile ? '100%' : 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isMobile ? '100%' : 240,
          boxSizing: 'border-box',
          ...(isMobile && {
            maxWidth: '80%',
            margin: '0 auto',
          }),
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '20',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '30',
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" color="primary">
            Comercio
          </Typography>
        </Box>
        <List>
          {commerceItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '20',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '30',
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <List>
          <ListItem 
            button 
            component={Link} 
            to="/manual"
            sx={{
              mb: 1,
              '&:hover': {
                backgroundColor: 'primary.light',
              }
            }}
          >
            <ListItemIcon>
              <HelpOutlineIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Manual de Usuario" 
              secondary="Ayuda y guía del sistema"
            />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}; 