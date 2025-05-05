import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  People,
  Build,
  Add as AddIcon,
  ArrowUpward,
  ArrowDownward,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { commonStyles } from '../styles/commonStyles';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// Función auxiliar para formatear la fecha en español
const formatDate = (date) => {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date().toLocaleDateString('es-ES', options);
};

// Componente StatCard mejorado
const StatCard = React.memo(({ title, value, icon: Icon, color, trend, loading }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={1}
      sx={{
        ...commonStyles.card,
        height: '100%',
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      <CardContent sx={commonStyles.statCard}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Icon
            sx={{
              fontSize: '2.5rem',
              color: `${color}.main`,
              mr: 1
            }}
          />
        </Box>
        <Typography variant="h4" component="div" color={`${color}.main`}>
          {loading ? '...' : value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {title}
        </Typography>
        {trend && !loading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 1,
            }}
          >
            {trend > 0 ? (
              <ArrowUpward sx={{ color: 'success.main', fontSize: '1rem' }} />
            ) : (
              <ArrowDownward sx={{ color: 'error.main', fontSize: '1rem' }} />
            )}
            <Typography
              variant="caption"
              color={trend > 0 ? 'success.main' : 'error.main'}
            >
              {Math.abs(trend)}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Paper>
  );
});

StatCard.displayName = 'StatCard';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    ventas: 0,
    inventario: 0,
    clientes: 0,
    reparaciones: 0,
    trends: {
      ventas: 0,
      inventario: 0,
      clientes: 0,
      reparaciones: 0
    }
  });

  const loadStats = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);

      // Cargar ventas del mes actual
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const salesQuery = query(
        collection(db, 'sales'),
        where('userId', '==', user.uid),
        where('date', '>=', Timestamp.fromDate(firstDay)),
        where('date', '<=', Timestamp.fromDate(lastDay))
      );
      
      const productsQuery = query(
        collection(db, 'products'),
        where('userId', '==', user.uid)
      );
      
      const customersQuery = query(
        collection(db, 'customers'),
        where('userId', '==', user.uid)
      );
      
      const repairsQuery = query(
        collection(db, 'repairs'),
        where('userId', '==', user.uid),
        where('status', '==', 'pending')
      );

      const [salesSnapshot, productsSnapshot, customersSnapshot, repairsSnapshot] = 
        await Promise.all([
          getDocs(salesQuery),
          getDocs(productsQuery),
          getDocs(customersQuery),
          getDocs(repairsQuery)
        ]);

      const totalSales = salesSnapshot.docs.reduce((sum, doc) => {
        const data = doc.data();
        return sum + (data.total || 0);
      }, 0);

      const totalProducts = productsSnapshot.docs.reduce((sum, doc) => {
        const data = doc.data();
        return sum + (data.stock || 0);
      }, 0);

      setStats({
        ventas: totalSales,
        inventario: totalProducts,
        clientes: customersSnapshot.size,
        reparaciones: repairsSnapshot.size,
        trends: {
          ventas: 15, // TODO: Calcular tendencia real
          inventario: -5,
          clientes: 8,
          reparaciones: 12
        }
      });
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError('Error al cargar las estadísticas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  const handleRefresh = () => {
    loadStats();
  };

  return (
    <Box sx={commonStyles.pageContainer}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Panel de Control
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {formatDate(new Date())}
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Ventas Totales"
            value={`$${stats.ventas.toLocaleString()}`}
            icon={TrendingUp}
            color="primary"
            trend={stats.trends.ventas}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Productos en Stock"
            value={stats.inventario}
            icon={Inventory}
            color="success"
            trend={stats.trends.inventario}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Clientes Activos"
            value={stats.clientes}
            icon={People}
            color="info"
            trend={stats.trends.clientes}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Reparaciones Pendientes"
            value={stats.reparaciones}
            icon={Build}
            color="warning"
            trend={stats.trends.reparaciones}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ ...commonStyles.card, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Acciones Rápidas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} lg={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Inventory />}
                  sx={commonStyles.button}
                >
                  Gestionar Inventario
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<People />}
                  sx={commonStyles.button}
                >
                  Ver Clientes
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Build />}
                  sx={commonStyles.button}
                >
                  Reparaciones
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  sx={commonStyles.button}
                >
                  Nueva Venta
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
