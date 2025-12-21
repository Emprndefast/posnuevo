/**
 * Componente de tarjetas de estadísticas mejorado
 * Muestra métricas en tiempo real con iconos y colores
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  Build as BuildIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = '#1976d2',
  trend = null,
  unit = '',
  backgroundColor = '#f5f5f5',
}) => {
  const isTrendingUp = trend && trend > 0;
  const isTrendingDown = trend && trend < 0;

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${backgroundColor} 0%, white 100%)`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {value}
              </Typography>
              {unit && (
                <Typography color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                  {unit}
                </Typography>
              )}
            </Box>
            {trend !== null && (
              <Chip
                size="small"
                icon={
                  isTrendingUp ? (
                    <TrendingUpIcon />
                  ) : isTrendingDown ? (
                    <TrendingUpIcon sx={{ transform: 'rotate(180deg)' }} />
                  ) : null
                }
                label={`${Math.abs(trend)}%`}
                color={isTrendingUp ? 'success' : isTrendingDown ? 'error' : 'default'}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '12px',
              backgroundColor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.2,
            }}
          >
            <Icon sx={{ fontSize: 32, color }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const StatisticsGrid = ({ stats = {} }) => {
  const defaultStats = {
    ventas: { value: 0, icon: ShoppingCartIcon, color: '#2196f3', trend: 0 },
    reparaciones: { value: 0, icon: BuildIcon, color: '#ff9800', trend: 0 },
    clientes: { value: 0, icon: PeopleIcon, color: '#4caf50', trend: 0 },
    ingresos: { value: 0, icon: AttachMoneyIcon, color: '#9c27b0', trend: 0, unit: 'RD$' },
  };

  const mergedStats = { ...defaultStats, ...stats };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Ventas Hoy"
          value={mergedStats.ventas.value}
          icon={mergedStats.ventas.icon}
          color={mergedStats.ventas.color}
          trend={mergedStats.ventas.trend}
          backgroundColor="#e3f2fd"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Reparaciones"
          value={mergedStats.reparaciones.value}
          icon={mergedStats.reparaciones.icon}
          color={mergedStats.reparaciones.color}
          trend={mergedStats.reparaciones.trend}
          backgroundColor="#fff3e0"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Nuevos Clientes"
          value={mergedStats.clientes.value}
          icon={mergedStats.clientes.icon}
          color={mergedStats.clientes.color}
          trend={mergedStats.clientes.trend}
          backgroundColor="#e8f5e9"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Ingresos"
          value={mergedStats.ingresos.value.toLocaleString('es-DO')}
          icon={mergedStats.ingresos.icon}
          color={mergedStats.ingresos.color}
          trend={mergedStats.ingresos.trend}
          unit={mergedStats.ingresos.unit}
          backgroundColor="#f3e5f5"
        />
      </Grid>
    </Grid>
  );
};

export default StatisticsGrid;
