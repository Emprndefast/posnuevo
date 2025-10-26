import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Inventory,
  People,
  Speed,
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContextMongo';

const MetricCard = ({ title, value, icon, trend, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {trend > 0 ? (
            <TrendingUp sx={{ color: 'success.main' }} />
          ) : (
            <TrendingDown sx={{ color: 'error.main' }} />
          )}
          <Typography
            variant="body2"
            sx={{
              ml: 1,
              color: trend > 0 ? 'success.main' : 'error.main',
            }}
          >
            {Math.abs(trend)}% vs mes anterior
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const FinancialAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    revenue: 0,
    revenueTrend: 0,
    averageTicket: 0,
    ticketTrend: 0,
    inventoryValue: 0,
    inventoryTrend: 0,
    customerSatisfaction: 0,
    satisfactionTrend: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Obtener ventas del mes actual
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const salesQuery = query(
          collection(db, 'sales'),
          where('userId', '==', user.uid),
          where('date', '>=', firstDayOfMonth),
          where('date', '<=', lastDayOfMonth)
        );

        const salesSnapshot = await getDocs(salesQuery);
        let totalRevenue = 0;
        let totalTickets = 0;

        salesSnapshot.forEach((doc) => {
          const sale = doc.data();
          totalRevenue += sale.total;
          totalTickets += 1;
        });

        // Calcular métricas
        const averageTicket = totalTickets > 0 ? totalRevenue / totalTickets : 0;

        // Obtener valor del inventario
        const inventoryQuery = query(
          collection(db, 'inventory'),
          where('userId', '==', user.uid)
        );
        const inventorySnapshot = await getDocs(inventoryQuery);
        let inventoryValue = 0;

        inventorySnapshot.forEach((doc) => {
          const item = doc.data();
          inventoryValue += item.price * item.quantity;
        });

        setMetrics({
          revenue: totalRevenue.toFixed(2),
          revenueTrend: 5.2, // Esto debería calcularse con datos históricos
          averageTicket: averageTicket.toFixed(2),
          ticketTrend: -2.1, // Esto debería calcularse con datos históricos
          inventoryValue: inventoryValue.toFixed(2),
          inventoryTrend: 3.4, // Esto debería calcularse con datos históricos
          customerSatisfaction: 4.5,
          satisfactionTrend: 0.8, // Esto debería calcularse con datos históricos
        });

        setLoading(false);
      } catch (err) {
        setError('Error al cargar las métricas financieras');
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user.uid]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Análisis Financiero
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Ingresos Mensuales"
            value={`$${metrics.revenue}`}
            icon={<AttachMoney sx={{ color: 'primary.main' }} />}
            trend={metrics.revenueTrend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Ticket Promedio"
            value={`$${metrics.averageTicket}`}
            icon={<Speed sx={{ color: 'secondary.main' }} />}
            trend={metrics.ticketTrend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Valor del Inventario"
            value={`$${metrics.inventoryValue}`}
            icon={<Inventory sx={{ color: 'info.main' }} />}
            trend={metrics.inventoryTrend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Satisfacción del Cliente"
            value={metrics.customerSatisfaction}
            icon={<People sx={{ color: 'success.main' }} />}
            trend={metrics.satisfactionTrend}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialAnalytics; 