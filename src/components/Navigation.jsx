import React from 'react';
import { Link } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  PointOfSale as SalesIcon,
  People as ClientsIcon,
  Assessment as AnalysisIcon,
  Subscriptions as SubscriptionsIcon,
  Settings as SettingsIcon,
  Book as ManualIcon,
  Payment as PaymentIcon,
  Receipt as InvoiceIcon,
  LocalShipping as SupplierIcon,
  LocalOffer as PromotionIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';

const Navigation = () => {
  const mainItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Productos', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Ventas', icon: <SalesIcon />, path: '/sales' },
    { text: 'Clientes', icon: <ClientsIcon />, path: '/clients' },
    { text: 'Análisis', icon: <AnalysisIcon />, path: '/reports' },
    { text: 'Suscripciones', icon: <SubscriptionsIcon />, path: '/subscriptions' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/configuration' },
    { text: 'Manual de Usuario', icon: <ManualIcon />, path: '/manual' }
  ];

  const commerceItems = [
    { text: 'Pasarelas de Pago', icon: <PaymentIcon />, path: '/payment-gateways' },
    { text: 'Facturación Electrónica', icon: <InvoiceIcon />, path: '/e-invoicing' },
    { text: 'Proveedores', icon: <SupplierIcon />, path: '/suppliers' },
    { text: 'Promociones', icon: <PromotionIcon />, path: '/promotions' }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#f5f5f5'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" noWrap component="div">
          POS-NT
        </Typography>
      </Box>
      <Divider />
      <List>
        {mainItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem>
          <ListItemIcon><HelpIcon /></ListItemIcon>
          <ListItemText
            primary="Ayuda y guía del sistema"
            primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }}
          />
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" color="primary">
          Comercio
        </Typography>
      </Box>
      <List>
        {commerceItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Navigation; 