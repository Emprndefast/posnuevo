import React, { useState, useEffect, startTransition } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Avatar,
  Divider,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  Inventory,
  Speed,
  Refresh,
  Add,
  Inventory as InventoryIcon,
  PersonAdd,
  Receipt,
  Settings,
  Analytics,
  LocalOffer,
  Store,
  FiberManualRecord,
  Whatshot,
  EmojiEvents,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextMongo';
import { usePermissions } from '../../context/PermissionsContext';
import { useProductos } from '../../context/ProductosContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../../api/api';
import ProCard from '../common/ui/ProCard';
import ProButton from '../common/ui/ProButton';
import QuickExpenseModal from '../expenses/QuickExpenseModal';
import CashRegisterWidget from '../cash-register/CashRegisterWidget';

const DashboardPro = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRole } = usePermissions();
  const { productos, loadProductos } = useProductos();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    dailySales: 0,
    monthlyRevenue: 0,
    averageTicket: 0,
    customersServed: 0,
    inventoryValue: 0,
    salesGrowth: 0,
    topProducts: [],
    recentSales: [],
    cajaActual: 0,
    stockBajo: 0,
    metaDia: 50000,
    promedioHora: 0,
    topClientes: [],
    ultimasVentas: [],
  });
  const [hasData, setHasData] = useState(false);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);

  // Filtros dinámicos para las cards
  const [productFilter, setProductFilter] = useState('precio'); // 'precio', 'stock', 'valor'
  const [productOrder, setProductOrder] = useState('desc'); // 'asc' ascendente, 'desc' descendente
  const [performancePeriod, setPerformancePeriod] = useState('mes'); // 'dia', 'semana', 'mes', 'anio'
  const [connectionFilter, setConnectionFilter] = useState('todos'); // 'todos', 'activos', 'inactivos'
  const [apiFilter, setApiFilter] = useState('todos'); // 'todos', 'activos', 'sincronizando'

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Cargar productos primero
      await loadProductos();

      // Obtener estadísticas de ventas
      let salesData = null;
      let productsData = null;
      let customersData = null;

      try {
        const response = await api.get('/sales/stats?periodo=dia');
        salesData = response.data;
      } catch (error) {
        console.log('No hay datos de ventas disponibles');
      }

      try {
        const response = await api.get('/products/stats');
        productsData = response.data;
      } catch (error) {
        console.log('No hay datos de productos disponibles');
      }

      try {
        const response = await api.get('/customers/stats');
        customersData = response.data;
      } catch (error) {
        console.log('No hay datos de clientes disponibles');
      }

      // Calcular métricas reales desde productos
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calcular valor del inventario desde productos
      let totalInventoryValue = 0;
      let totalInStock = 0;
      const productsList = productos || [];

      console.log('📦 Total productos en contexto:', productsList.length);

      productsList.forEach(product => {
        const price = parseFloat(product.precio) || 0;
        const stock = parseInt(product.stock) || 0;
        // Si el stock es 0, usar 1 para calcular el valor del inventario
        const effectiveStock = stock > 0 ? stock : 1;
        totalInventoryValue += price * effectiveStock;
        totalInStock += effectiveStock;
        console.log(`  - ${product.nombre || product.name}: Stock=${stock}, Precio=${price}, Valor=${price * effectiveStock}`);
      });

      // Función para obtener productos top según el filtro
      const getTopProducts = (filter) => {
        let sorted = [];

        switch (filter) {
          case 'precio':
            sorted = productsList
              .filter(p => {
                const precio = parseFloat(p.precio) || 0;
                return precio > 0;
              })
              .sort((a, b) => {
                const precioA = parseFloat(a.precio) || 0;
                const precioB = parseFloat(b.precio) || 0;
                return precioB - precioA;
              });
            break;
          case 'stock':
            sorted = productsList
              .filter(p => {
                const stock = parseInt(p.stock) || 0;
                return stock > 0;
              })
              .sort((a, b) => {
                const stockA = parseInt(a.stock) || 0;
                const stockB = parseInt(b.stock) || 0;
                return stockB - stockA;
              });
            break;
          case 'valor':
            sorted = productsList
              .filter(p => {
                const precio = parseFloat(p.precio) || 0;
                const stock = parseInt(p.stock) || 0;
                return precio > 0 && stock > 0;
              })
              .sort((a, b) => {
                const valorA = (parseFloat(a.precio) || 0) * (parseInt(a.stock) || 0);
                const valorB = (parseFloat(b.precio) || 0) * (parseInt(b.stock) || 0);
                return valorB - valorA;
              });
            break;
          default:
            sorted = productsList.filter(p => {
              const precio = parseFloat(p.precio) || 0;
              return precio > 0;
            }).sort((a, b) => {
              const precioA = parseFloat(a.precio) || 0;
              const precioB = parseFloat(b.precio) || 0;
              return precioB - precioA;
            });
        }

        return sorted.slice(0, 2).map(p => {
          const stock = parseInt(p.stock) || 0;
          const precio = parseFloat(p.precio) || 0;
          const valor = precio * stock;

          let valueToShow = precio;
          let label = 'Stock';

          if (filter === 'stock') {
            valueToShow = stock;
            label = 'Stock';
          } else if (filter === 'valor') {
            valueToShow = valor;
            label = 'Valor';
          }

          return {
            name: p.nombre || p.name || 'Sin nombre',
            sales: stock,
            value: valueToShow,
            label: label
          };
        });
      };

      const topProducts = getTopProducts(productFilter);

      console.log('🏆 Top productos:', topProducts);

      // Calcular ventas del día desde estadísticas
      let dailySales = 0;
      if (salesData?.success && salesData?.data?.resumen?.monto_total) {
        dailySales = salesData.data.resumen.monto_total;
      }

      // Calcular ticket promedio
      let averageTicket = 0;
      if (salesData?.success && salesData?.data?.resumen?.promedio_venta) {
        averageTicket = salesData.data.resumen.promedio_venta;
      }

      // Calcular métricas adicionales PRO
      const cajaActual = dailySales; // En un POS real, esto vendría de la API de caja
      const stockBajo = productsList.filter(p => (parseInt(p.stock) || 0) < 10).length;
      const metaDia = 50000;
      const promedioHora = dailySales / 8; // Asumiendo 8 horas de operación

      // Top clientes (simulado, debería venir del backend)
      const topClientes = [];

      // Últimas ventas (limitar a 5)
      const ultimasVentas = salesData?.data?.recentSales || [];

      const newData = {
        dailySales: dailySales,
        monthlyRevenue: totalInventoryValue > 0 ? totalInventoryValue : 0,
        averageTicket: averageTicket > 0 ? parseFloat(averageTicket.toFixed(2)) : 0,
        customersServed: customersData?.data?.todayCount || customersData?.data?.total_clientes || 0,
        inventoryValue: productsData?.data?.total_value || totalInventoryValue,
        salesGrowth: 0, // No calculado todavía
        topProducts: topProducts.length > 0 ? topProducts : [],
        recentSales: [],
        cajaActual: cajaActual,
        stockBajo: stockBajo,
        metaDia: metaDia,
        promedioHora: promedioHora,
        topClientes: topClientes,
        ultimasVentas: ultimasVentas.slice(0, 5),
      };

      setDashboardData(newData);

      // Verificar si hay datos reales
      console.log('Dashboard data:', newData);
      console.log('Productos disponibles:', productos.length);

      const hasRealData = (
        productos.length > 0 ||  // Si hay productos, mostrar datos
        newData.dailySales > 0 ||
        newData.monthlyRevenue > 0 ||
        newData.inventoryValue > 0
      );
      setHasData(hasRealData);

      console.log('Has data:', hasRealData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setHasData(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Recalcular datos cuando los productos cambien
  useEffect(() => {
    if (productos.length > 0) {
      console.log('🔄 Productos cambiaron, recalculando datos del dashboard');
      fetchDashboardData();
    }
  }, [productos.length]);

  const handleNavigate = (path) => {
    startTransition(() => {
      navigate(path);
    });
  };

  // Mostrar mensaje si no hay datos pero mantener diseño
  const NoDataMessage = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 16,
        bgcolor: 'white',
        color: 'text.primary',
        py: 1.5,
        px: 2.5,
        borderRadius: 2,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderLeft: '4px solid',
        borderColor: 'warning.main',
        minWidth: 280,
        maxWidth: 400,
        animation: 'slideIn 0.3s ease-out',
        '@keyframes slideIn': {
          '0%': {
            opacity: 0,
            transform: 'translateX(400px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateX(0)',
          },
        },
      }}
    >
      <Box
        sx={{
          bgcolor: 'warning.light',
          borderRadius: '50%',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Box sx={{ fontSize: 18 }}>ℹ️</Box>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', fontSize: '0.75rem' }}>
          No hay datos disponibles
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
          Agrega productos para ver métricas
        </Typography>
      </Box>
    </Box>
  );

  // Stat Card Component con gradientes y efectos
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
    subtitle,
    gradient
  }) => {
    const gradientColors = gradient || [
      theme.palette[color].main,
      alpha(theme.palette[color].main, 0.7)
    ];

    return (
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 20px 40px ${alpha(gradientColors[0], 0.4)}`,
            '& .stat-icon': {
              transform: 'scale(1.2) rotate(5deg)',
            },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`,
            borderRadius: '50%',
          },
        }}
      >
        <CardContent sx={{ p: 2.5, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.8,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.7rem',
                  mb: 0.5,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  lineHeight: 1.2,
                }}
              >
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.75rem', mt: 0.5, display: 'block' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box
              className="stat-icon"
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Icon sx={{ fontSize: 28 }} />
            </Box>
          </Box>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
              {trend > 0 ? (
                <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />
              )}
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                {Math.abs(trend)}% vs mes anterior
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Action Button Component mejorado
  const ActionButton = ({ icon: Icon, label, color, onClick, variant = 'contained' }) => (
    <Button
      variant={variant}
      onClick={onClick}
      startIcon={<Icon sx={{ fontSize: 20 }} />}
      sx={{
        height: 48,
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        ...(variant === 'contained' && {
          background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
          boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.3)}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 20px ${alpha(theme.palette[color].main, 0.4)}`,
          },
        }),
        ...(variant === 'outlined' && {
          borderWidth: 2,
          borderColor: theme.palette[color].main,
          color: theme.palette[color].main,
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: alpha(theme.palette[color].main, 0.08),
            transform: 'translateY(-2px)',
            borderWidth: 2,
          },
        }),
      }}
      fullWidth
    >
      {label}
    </Button>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        position: 'relative',
      }}
    >
      {/* Mensaje de no datos */}
      {!hasData && <NoDataMessage />}

      <Box sx={{ p: { xs: 1, md: 2 } }}>
        {/* Header y Acciones Rápidas Combinados */}
        <ProCard
          elevation={2}
          sx={{ mb: 3, p: 2.5 }}
        >
          {/* Header dentro del Card */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    fontSize: { xs: '1.3rem', md: '1.5rem' },
                  }}
                >
                  Dashboard
                </Typography>
                <Tooltip title="Actualizar Dashboard">
                  <IconButton
                    onClick={fetchDashboardData}
                    disabled={loading}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'rotate(180deg)',
                      },
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                }}
              >
                {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
              <Chip
                label={user?.nombre || user?.displayName || 'Usuario'}
                size="small"
                sx={{
                  bgcolor: 'grey.100',
                  color: 'text.primary',
                  fontWeight: 600,
                }}
              />
              <Chip
                label={userRole?.toUpperCase() || 'USER'}
                size="small"
                color="primary"
                sx={{
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>

          {/* Separador */}
          <Divider sx={{ mb: 2 }} />

          {/* Título Acciones Rápidas */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1.1rem' }}>
            Acciones Rápidas
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={6} sm={4} md={2}>
              <ProButton
                startIcon={<Add />}
                color="success"
                onClick={() => handleNavigate('/quick-sale')}
                fullWidth
                variant="gradient"
              >
                Nueva Venta
              </ProButton>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <ProButton
                startIcon={<InventoryIcon />}
                color="primary"
                onClick={() => handleNavigate('/products')}
                fullWidth
              >
                Agregar Producto
              </ProButton>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <ProButton
                startIcon={<Analytics />}
                color="info"
                onClick={() => handleNavigate('/analytics')}
                fullWidth
              >
                Ver Reportes
              </ProButton>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <ProButton
                startIcon={<PersonAdd />}
                color="warning"
                onClick={() => handleNavigate('/customers')}
                fullWidth
              >
                Registrar Cliente
              </ProButton>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <ProButton
                startIcon={<Receipt />}
                color="primary"
                variant="outlined"
                onClick={() => handleNavigate('/sales')}
                fullWidth
              >
                Ver Ventas
              </ProButton>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <ProButton
                startIcon={<Settings />}
                color="secondary"
                onClick={() => handleNavigate('/repairs')}
                fullWidth
                variant="soft"
              >
                Venta Reparaciones
              </ProButton>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <ProButton
                startIcon={<AttachMoney />}
                color="error"
                onClick={() => setOpenExpenseModal(true)}
                fullWidth
                variant="outlined"
              >
                Gastos Rápidos
              </ProButton>
            </Grid>
          </Grid>
        </ProCard>

        {/* Contenedor de Métricas Principales */}
        <ProCard
          elevation={2}
          sx={{ mb: 3, p: 2.5 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Ventas del Día"
                value={`$${dashboardData.dailySales.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`}
                icon={AttachMoney}
                color="success"
                trend={dashboardData.salesGrowth}
                subtitle="Ingresos de hoy"
                gradient={['#10b981', '#059669']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Ticket Promedio"
                value={`$${dashboardData.averageTicket.toFixed(2)}`}
                icon={Receipt}
                color="info"
                trend={5.2}
                subtitle="Por transacción"
                gradient={['#3b82f6', '#2563eb']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Clientes Atendidos"
                value={dashboardData.customersServed}
                icon={People}
                color="warning"
                trend={8.3}
                subtitle="Hoy"
                gradient={['#f59e0b', '#d97706']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Valor Inventario"
                value={`$${dashboardData.inventoryValue.toLocaleString()}`}
                icon={Inventory}
                color="error"
                trend={-2.1}
                subtitle="Stock actual"
                gradient={['#ef4444', '#dc2626']}
              />
            </Grid>
          </Grid>
        </ProCard>

        {/* Contenedor principal: Impulsos + Multimedia en fila */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Columna 1: Impulso y Metas (75%) */}
          <Grid item xs={12} md={9}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: 1,
                p: 1.5,
                background: 'white',
                border: '1px solid #e5e7eb',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 16 }}>📊</Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}>
                  Impulso y Metas
                </Typography>
              </Box>

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <CashRegisterWidget />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#10b981',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'inline-flex', p: 1, borderRadius: 1.5, bgcolor: '#ecfdf5', mb: 0.75 }}>
                      <ShoppingCart sx={{ fontSize: 22, color: '#10b981' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25, fontSize: '1.1rem' }}>
                      ${dashboardData.cajaActual.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      Caja Actual
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#f59e0b',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.12)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'inline-flex', p: 1, borderRadius: 1.5, bgcolor: '#fffbeb', mb: 0.75 }}>
                      <InventoryIcon sx={{ fontSize: 22, color: '#f59e0b' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25, fontSize: '1.1rem' }}>
                      {dashboardData.stockBajo}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      Stock Bajo
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.12)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'inline-flex', p: 1, borderRadius: 1.5, bgcolor: '#eff6ff', mb: 0.75 }}>
                      <Analytics sx={{ fontSize: 22, color: '#3b82f6' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25, fontSize: '1.1rem' }}>
                      ${dashboardData.metaDia.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block' }}>
                      Meta del Día
                    </Typography>
                    <Chip
                      label={`${((dashboardData.dailySales / dashboardData.metaDia) * 100 || 0).toFixed(1)}%`}
                      size="small"
                      sx={{ mt: 0.25, height: 18, fontSize: '0.6rem', bgcolor: '#dbeafe', color: '#1e40af' }} />
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#8b5cf6',
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.12)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'inline-flex', p: 1, borderRadius: 1.5, bgcolor: '#f5f3ff', mb: 0.75 }}>
                      <Speed sx={{ fontSize: 22, color: '#8b5cf6' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25, fontSize: '1.1rem' }}>
                      ${dashboardData.promedioHora.toFixed(0)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      Promedio/Hora
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Barra de progreso de meta */}
              <Box sx={{
                mt: 1.5,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: '#f9fafb',
                border: '1px solid #e5e7eb'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
                    Progreso del Día
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.75rem' }}>
                    ${dashboardData.dailySales.toLocaleString()} / ${dashboardData.metaDia.toLocaleString()}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((dashboardData.dailySales / dashboardData.metaDia) * 100 || 0), 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#e5e7eb',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                      borderRadius: 3,
                      transition: 'width 0.6s ease',
                    },
                  }}
                />
              </Box>
            </Card>
          </Grid>

          {/* Columna 2: Multimedia (25%) */}
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 2,
                boxShadow: 1,
                py: 1.5,
                pl: '145px',
                pr: '151px',
                background: 'white',
                border: '2px dashed #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontSize: '1rem', mb: 1 }}>
                  📸 Contenido Multimedia
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block' }}>
                  Imagen o Video Promocional
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Métricas Secundarias */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {/* Card 1: Productos Top */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                boxShadow: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmojiEvents sx={{ fontSize: 24, color: '#f59e0b', mr: 1.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Productos Top
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip
                          label="Precio"
                          size="small"
                          clickable
                          onClick={() => setProductFilter('precio')}
                          color={productFilter === 'precio' ? 'primary' : 'default'}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                          icon={productFilter === 'precio' && <Box sx={{ fontSize: '0.7rem', ml: 0.5 }}>{productOrder === 'desc' ? '↓' : '↑'}</Box>}
                          onDelete={productFilter === 'precio' ? () => setProductOrder(productOrder === 'asc' ? 'desc' : 'asc') : undefined}
                          deleteIcon={productFilter === 'precio' ? <Box sx={{ cursor: 'pointer', fontSize: '0.7rem', ml: 0.5 }} onClick={(e) => { e.stopPropagation(); setProductOrder(productOrder === 'asc' ? 'desc' : 'asc'); }}>{productOrder === 'desc' ? '↓' : '↑'}</Box> : undefined}
                        />
                        <Chip
                          label="Stock"
                          size="small"
                          clickable
                          onClick={() => setProductFilter('stock')}
                          color={productFilter === 'stock' ? 'primary' : 'default'}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                          icon={productFilter === 'stock' && <Box sx={{ fontSize: '0.7rem', ml: 0.5 }}>{productOrder === 'desc' ? '↓' : '↑'}</Box>}
                          onDelete={productFilter === 'stock' ? () => setProductOrder(productOrder === 'asc' ? 'desc' : 'asc') : undefined}
                          deleteIcon={productFilter === 'stock' ? <Box sx={{ cursor: 'pointer', fontSize: '0.7rem', ml: 0.5 }} onClick={(e) => { e.stopPropagation(); setProductOrder(productOrder === 'asc' ? 'desc' : 'asc'); }}>{productOrder === 'desc' ? '↓' : '↑'}</Box> : undefined}
                        />
                        <Chip
                          label="Valor"
                          size="small"
                          clickable
                          onClick={() => setProductFilter('valor')}
                          color={productFilter === 'valor' ? 'primary' : 'default'}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                          icon={productFilter === 'valor' && <Box sx={{ fontSize: '0.7rem', ml: 0.5 }}>{productOrder === 'desc' ? '↓' : '↑'}</Box>}
                          onDelete={productFilter === 'valor' ? () => setProductOrder(productOrder === 'asc' ? 'desc' : 'asc') : undefined}
                          deleteIcon={productFilter === 'valor' ? <Box sx={{ cursor: 'pointer', fontSize: '0.7rem', ml: 0.5 }} onClick={(e) => { e.stopPropagation(); setProductOrder(productOrder === 'asc' ? 'desc' : 'asc'); }}>{productOrder === 'desc' ? '↓' : '↑'}</Box> : undefined}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Stack spacing={1.5}>
                  {(() => {
                    // Calcular productos top según el filtro actual (sin recargar)
                    const productsList = productos || [];
                    const getFilteredProducts = () => {
                      let sorted = [];
                      const order = productOrder === 'asc' ? -1 : 1; // -1 para ascendente (menor a mayor), 1 para descendente (mayor a menor)

                      switch (productFilter) {
                        case 'precio':
                          sorted = productsList
                            .filter(p => {
                              const precio = parseFloat(p.precio) || 0;
                              return precio > 0;
                            })
                            .sort((a, b) => {
                              const precioA = parseFloat(a.precio) || 0;
                              const precioB = parseFloat(b.precio) || 0;
                              return (precioB - precioA) * order;
                            });
                          break;
                        case 'stock':
                          // Mostrar todos los productos ordenados por stock
                          sorted = productsList
                            .filter(p => {
                              const precio = parseFloat(p.precio) || 0;
                              return precio > 0; // Al menos que tengan precio
                            })
                            .sort((a, b) => {
                              const stockA = parseInt(a.stock) || 0;
                              const stockB = parseInt(b.stock) || 0;
                              return (stockB - stockA) * order;
                            });
                          break;
                        case 'valor':
                          // Calcular valor (precio * stock), usar 1 si stock es 0
                          sorted = productsList
                            .filter(p => {
                              const precio = parseFloat(p.precio) || 0;
                              return precio > 0;
                            })
                            .sort((a, b) => {
                              const valorA = (parseFloat(a.precio) || 0) * Math.max(parseInt(a.stock) || 0, 1);
                              const valorB = (parseFloat(b.precio) || 0) * Math.max(parseInt(b.stock) || 0, 1);
                              return (valorB - valorA) * order;
                            });
                          break;
                      }

                      return sorted.slice(0, 2).map(p => {
                        const stock = parseInt(p.stock) || 0;
                        const precio = parseFloat(p.precio) || 0;
                        // Para valor, si stock es 0, calcular como precio * 1
                        const valor = precio * Math.max(stock, 1);

                        let valueToShow = precio;
                        let label = 'Precio';

                        if (productFilter === 'stock') {
                          valueToShow = stock;
                          label = 'Stock';
                        } else if (productFilter === 'valor') {
                          valueToShow = valor;
                          label = 'Valor';
                        }

                        return {
                          name: p.nombre || p.name || 'Sin nombre',
                          sales: stock,
                          value: valueToShow,
                          label: label,
                          precio: precio // Guardar el precio para mostrar en detalles
                        };
                      });
                    };

                    const filteredProducts = getFilteredProducts();

                    return filteredProducts.length > 0 ? filteredProducts.map((product, index) => (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            {product.name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem' }}>
                            {productFilter === 'stock'
                              ? `${product.value.toLocaleString('es-DO')} unidades`
                              : productFilter === 'valor'
                                ? `$${product.value.toLocaleString('es-DO')}`
                                : `$${product.value.toLocaleString('es-DO')}`
                            }
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((product.value / (productFilter === 'stock' ? 1000 : productFilter === 'valor' ? 50000 : 20000)) * 100, 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                          {productFilter === 'precio' && `Stock: ${product.sales}`}
                          {productFilter === 'stock' && `Precio: $${(product.precio || 0).toLocaleString('es-DO')}`}
                          {productFilter === 'valor' && `Precio: $${(product.precio || 0).toLocaleString('es-DO')} × Stock: ${product.sales}`}
                        </Typography>
                      </Box>
                    )) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                        No hay productos top
                      </Typography>
                    );
                  })()}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Rendimiento */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                boxShadow: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Whatshot sx={{ fontSize: 24, color: '#ef4444', mr: 1.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Rendimiento
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        <Chip
                          label="Día"
                          size="small"
                          clickable
                          onClick={() => setPerformancePeriod('dia')}
                          color={performancePeriod === 'dia' ? 'primary' : 'default'}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                        <Chip
                          label="Mes"
                          size="small"
                          clickable
                          onClick={() => setPerformancePeriod('mes')}
                          color={performancePeriod === 'mes' ? 'primary' : 'default'}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                        <Chip
                          label="Año"
                          size="small"
                          clickable
                          onClick={() => setPerformancePeriod('anio')}
                          color={performancePeriod === 'anio' ? 'primary' : 'default'}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>
                      ${dashboardData.monthlyRevenue.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      Ventas mensuales
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block', mt: 0.5 }}>
                      Objetivo: $500,000
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      Crecimiento
                    </Typography>
                    <Chip
                      label={`+${dashboardData.salesGrowth}%`}
                      size="small"
                      color="success"
                      icon={<TrendingUp sx={{ fontSize: 14 }} />}
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Estado de Conexiones */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                boxShadow: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Speed sx={{ fontSize: 24, color: '#3b82f6', mr: 1.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Conexiones
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        <Chip
                          label="Todos"
                          size="small"
                          clickable
                          onClick={() => setConnectionFilter('todos')}
                          color={connectionFilter === 'todos' ? 'primary' : 'default'}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                        <Chip
                          label="Activos"
                          size="small"
                          clickable
                          onClick={() => setConnectionFilter('activos')}
                          color={connectionFilter === 'activos' ? 'primary' : 'default'}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      API MongoDB
                    </Typography>
                    <Chip
                      label="Activa"
                      size="small"
                      color="success"
                      icon={<FiberManualRecord sx={{ fontSize: 8 }} />}
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      WhatsApp API
                    </Typography>
                    <Chip
                      label="Activa"
                      size="small"
                      color="success"
                      icon={<FiberManualRecord sx={{ fontSize: 8 }} />}
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      Whabot Pro
                    </Typography>
                    <Chip
                      label="Conectado"
                      size="small"
                      color="success"
                      icon={<FiberManualRecord sx={{ fontSize: 8 }} />}
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block' }}>
                    Última verificación: hace 2 min
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 4: Estado de APIs */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                boxShadow: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Store sx={{ fontSize: 24, color: '#8b5cf6', mr: 1.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        APIs Externas
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        <Chip
                          label="Activas"
                          size="small"
                          clickable
                          onClick={() => setApiFilter('activas')}
                          color={apiFilter === 'activas' ? 'primary' : 'default'}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                        <Chip
                          label="Todas"
                          size="small"
                          clickable
                          onClick={() => setApiFilter('todos')}
                          color={apiFilter === 'todos' ? 'primary' : 'default'}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Stack spacing={1.5}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        Tiendas conectadas
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem' }}>
                        2
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={66}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'primary.main',
                        },
                      }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        Sincronizaciones
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', fontSize: '0.75rem' }}>
                        Hoy: 12
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block' }}>
                      Última: hace 5 min
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                      Productos sincronizados
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      156
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <QuickExpenseModal
        open={openExpenseModal}
        onClose={() => setOpenExpenseModal(false)}
        onSuccess={() => {
          // Opcional: recargar datos del dashboard si los gastos afectan el flujo de caja mostrado
          // fetchDashboardData(); 
          // Por ahora solo cerramos
        }}
      />
    </Box>
  );
};

export default DashboardPro;

