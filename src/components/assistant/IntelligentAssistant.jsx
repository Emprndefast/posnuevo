import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useRole } from '../../context/RoleContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LoyaltyIcon from '@mui/icons-material/Loyalty';

const AdminAssistant = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Asistente Administrador
    </Typography>
    <List>
      <ListItem>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText 
          primary="KPIs Principales" 
          secondary="Ventas, ganancias y productos más vendidos" 
        />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText 
          primary="Configuración del Sistema" 
          secondary="Gestión de usuarios y configuración general" 
        />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <AssessmentIcon />
        </ListItemIcon>
        <ListItemText 
          primary="Reportes Avanzados" 
          secondary="Análisis detallado de ventas y estadísticas" 
        />
      </ListItem>
    </List>
  </Box>
);

const StaffAssistant = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Asistente de Personal
    </Typography>
    <List>
      <ListItem>
        <ListItemIcon>
          <ShoppingCartIcon />
        </ListItemIcon>
        <ListItemText 
          primary="Nueva Venta" 
          secondary="Acceso rápido al registro de ventas" 
        />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <InventoryIcon />
        </ListItemIcon>
        <ListItemText 
          primary="Inventario" 
          secondary="Consulta de stock disponible" 
        />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <AssessmentIcon />
        </ListItemIcon>
        <ListItemText 
          primary="Reportes Diarios" 
          secondary="Ventas y estadísticas del día" 
        />
      </ListItem>
    </List>
  </Box>
);

const UserAssistant = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Asistente de Cliente
    </Typography>
    <List>
      <ListItem>
        <ListItemIcon>
          <ShoppingCartIcon />
        </ListItemIcon>
        <ListItemText 
          primary="Mis Compras" 
          secondary="Historial de compras realizadas" 
        />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <LoyaltyIcon />
        </ListItemIcon>
        <ListItemText 
          primary="Mis Puntos" 
          secondary="Programa de fidelidad y recompensas" 
        />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText 
          primary="Soporte" 
          secondary="Asistencia y atención al cliente" 
        />
      </ListItem>
    </List>
  </Box>
);

const IntelligentAssistant = () => {
  const { role } = useRole();

  const getAssistantComponent = () => {
    switch (role) {
      case 'admin':
        return <AdminAssistant />;
      case 'staff':
        return <StaffAssistant />;
      case 'user':
        return <UserAssistant />;
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      {getAssistantComponent()}
    </Paper>
  );
};

export default IntelligentAssistant; 