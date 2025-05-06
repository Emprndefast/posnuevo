import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as SalesIcon,
  Inventory as ProductsIcon,
  People as CustomersIcon,
  Settings as SettingsIcon,
  Receipt as InvoicesIcon,
  Build as RepairsIcon,
  Assessment as AnalyticsIcon,
  AccountCircle as ProfileIcon,
  BusinessCenter as CrmIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Ventas', icon: <SalesIcon />, path: '/sales' },
  { text: 'Productos', icon: <ProductsIcon />, path: '/products' },
  { text: 'Clientes', icon: <CustomersIcon />, path: '/customers' },
  { text: 'CRM', icon: <CrmIcon />, path: '/crm/customers' },
  { text: 'Facturación', icon: <InvoicesIcon />, path: '/billing' },
  { text: 'Reparaciones', icon: <RepairsIcon />, path: '/reparaciones' },
  { text: 'Analíticas', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Perfil', icon: <ProfileIcon />, path: '/perfil' }
];

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
          mt: '64px'
        }
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark
                }
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 