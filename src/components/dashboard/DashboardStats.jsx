import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  LocalRepairIcon
} from '@mui/icons-material';
import api from '../config/api';

/**
 * Card de estadística mejorada
 */
const StatCard = ({ title, value, icon: Icon, color = '#1976d2', trend = null, loading = false }) => {
  return (
    <Card sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)`,
      border: `2px solid ${color}30`,
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3,
        borderColor: `${color}60`
      }
    }}>
      <CardContent sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={100} height={32} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, mt: 1 }}>
                {value}
              </Typography>
            )}
          </Box>
          <Icon sx={{ fontSize: 40, color: `${color}60` }} />
        </Box>

        {trend && !loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend > 0 ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: '#f44336' }} />
            )}
            <Typography variant="caption" sx={{ color: trend > 0 ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
              {Math.abs(trend)}% vs mes anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Dashboard mejorado de estadísticas
 */
export const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    salesCount: 0,
    customerCount: 0,
    lowStockProducts: 0,
    repairsInProgress: 0,
    totalRevenue: 0
  });
  const [trends, setTrends] = useState({
    sales: null,
    revenue: null,
    customers: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [salesRes, customersRes, inventoryRes, repairsRes] = await Promise.all([
        api.get('/api/sales/stats'),
        api.get('/api/customers/count'),
        api.get('/api/products/low-stock'),
        api.get('/api/repairs/in-progress')
      ]);

      const salesData = salesRes.data?.data || {};
      const customersData = customersRes.data?.data || {};
      const inventoryData = inventoryRes.data?.data || {};
      const repairsData = repairsRes.data?.data || {};

      setStats({
        totalSales: salesData.count || 0,
        salesCount: salesData.count || 0,
        customerCount: customersData.count || 0,
        lowStockProducts: inventoryData.count || 0,
        repairsInProgress: repairsData.count || 0,
        totalRevenue: salesData.total || 0
      });

      setTrends({
        sales: salesData.trend || null,
        revenue: salesData.revenueTrend || null,
        customers: customersData.trend || null
      });

      setError('');
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Ventas Hoy"
            value={stats.salesCount}
            icon={ShoppingCartIcon}
            color="#2196f3"
            trend={trends.sales}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Ingresos"
            value={`RD$${stats.totalRevenue.toFixed(2)}`}
            icon={TrendingUpIcon}
            color="#4caf50"
            trend={trends.revenue}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Clientes"
            value={stats.customerCount}
            icon={PeopleIcon}
            color="#ff9800"
            trend={trends.customers}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Stock Bajo"
            value={stats.lowStockProducts}
            icon={InventoryIcon}
            color="#f44336"
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Reparaciones"
            value={stats.repairsInProgress}
            icon={LocalRepairIcon}
            color="#9c27b0"
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Ticket Promedio"
            value={`RD$${stats.salesCount > 0 ? (stats.totalRevenue / stats.salesCount).toFixed(2) : '0.00'}`}
            icon={ShoppingCartIcon}
            color="#00bcd4"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          Última actualización: {new Date().toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardStats;
