import React, { useState } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { useNotifications } from './useNotifications';
import NotificationSwitches from './NotificationSwitches';

// Componente de ejemplo para mostrar cómo usar las notificaciones
const NotificationExample = ({ user }) => {
  // Estado de ejemplo para las notificaciones
  const [settings, setSettings] = useState({
    notifications: {
      enabled: true,
      email: true,
      desktop: true
    }
  });

  // Usar el hook de notificaciones
  const { 
    notifySale, 
    notifyNewProduct, 
    notifyStockAlert, 
    sendDailyReminder 
  } = useNotifications(settings, user);

  // Función para simular una venta
  const handleSimulateSale = async () => {
    const saleData = {
      userId: user?.id || 'user123',
      saleData: {
        id: 'sale123',
        total: 150.50,
        items: 3,
        date: new Date().toISOString()
      }
    };
    
    try {
      await notifySale(saleData);
      alert('Notificación de venta enviada');
    } catch (error) {
      console.error('Error al enviar notificación de venta:', error);
      alert('Error al enviar notificación de venta');
    }
  };

  // Función para simular un nuevo producto
  const handleSimulateNewProduct = async () => {
    const productData = {
      userId: user?.id || 'user123',
      productData: {
        id: 'prod123',
        name: 'Nuevo Producto de Ejemplo',
        price: 29.99,
        category: 'Electrónicos'
      }
    };
    
    try {
      await notifyNewProduct(productData);
      alert('Notificación de nuevo producto enviada');
    } catch (error) {
      console.error('Error al enviar notificación de nuevo producto:', error);
      alert('Error al enviar notificación de nuevo producto');
    }
  };

  // Función para simular una alerta de stock
  const handleSimulateStockAlert = async () => {
    const stockData = {
      userId: user?.id || 'user123',
      stockData: {
        productId: 'prod123',
        productName: 'Producto de Ejemplo',
        currentStock: 5,
        minStock: 10
      }
    };
    
    try {
      await notifyStockAlert(stockData);
      alert('Notificación de alerta de stock enviada');
    } catch (error) {
      console.error('Error al enviar notificación de alerta de stock:', error);
      alert('Error al enviar notificación de alerta de stock');
    }
  };

  // Función para simular un recordatorio diario
  const handleSimulateDailyReminder = async () => {
    const userData = {
      userId: user?.id || 'user123',
      plan: 'free'
    };
    
    try {
      await sendDailyReminder(userData);
      alert('Recordatorio diario enviado');
    } catch (error) {
      console.error('Error al enviar recordatorio diario:', error);
      alert('Error al enviar recordatorio diario');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Sistema de Notificaciones
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Configuración de Notificaciones
        </Typography>
        <NotificationSwitches user={user} />
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Simulación de Notificaciones
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSimulateSale}
          >
            Simular Venta
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleSimulateNewProduct}
          >
            Simular Nuevo Producto
          </Button>
          
          <Button 
            variant="contained" 
            color="warning" 
            onClick={handleSimulateStockAlert}
          >
            Simular Alerta de Stock
          </Button>
          
          <Button 
            variant="contained" 
            color="info" 
            onClick={handleSimulateDailyReminder}
          >
            Simular Recordatorio Diario
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotificationExample; 