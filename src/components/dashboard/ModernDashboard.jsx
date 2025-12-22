import React, { useState, useEffect, useMemo, startTransition } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Chip,
  LinearProgress,
  useTheme,
  Paper,
  Divider,
  Tooltip,
  Fade,
  CircularProgress,
  Alert,
  Snackbar,
  ListItemIcon,
  ListItemText,
  Popover,
  alpha,
} from '@mui/material';
import {
  MoreVert,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  Inventory,
  Speed,
  Notifications,
  Refresh,
  FilterList,
  CalendarToday,
  LocalOffer,
  Category,
  BarChart,
  PieChart,
  Timeline,
  Settings,
  Person,
  ExitToApp,
  Dashboard as DashboardIcon,
  Receipt,
  Build,
  Assessment,
  Add,
  Inventory as InventoryIcon,
  PersonAdd,
  PointOfSale,
  Warning,
  CalendarMonth,
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
// API imports for MongoDB backend
import api from '../../api/api';
import { useAuth } from '../../context/AuthContextMongo';
import { usePermissions } from '../../context/PermissionsContext';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

// Datos iniciales para los gráficos
const initialSalesData = {
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  datasets: [
    {
      label: 'Ventas',
      data: [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#7209f5', // Whabot Purple
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(114, 9, 245, 0.1)',
    },
  ],
};

const initialCategoryData = {
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: [
        '#7209f5', // Whabot Purple
        '#8b5cf6', // Whabot Violet
        '#a78bfa', // Light Purple
        '#c4b5fd', // Lighter Purple
        '#e9d5ff', // Lightest Purple
      ],
    },
  ],
};

// Componente de tarjeta de métrica mejorado con animaciones y diseño moderno
const MetricCard = ({ title, value, icon, trend, color, subtitle }) => {
  const theme = useTheme();
  const colorValue = theme.palette[color]?.main || color;

  return (
    <Fade in={true} timeout={800}>
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 12px 24px ${alpha(colorValue, 0.2)}`,
          },
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          background: `linear-gradient(135deg, ${alpha(colorValue, 0.1)} 0%, ${alpha(colorValue, 0.05)} 100%)`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
                sx={{
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.75rem',
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h4"
                component="div"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${colorValue}, ${alpha(colorValue, 0.8)})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                {value}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    fontSize: '0.875rem',
                    opacity: 0.8,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                backgroundColor: alpha(colorValue, 0.1),
                borderRadius: '50%',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  backgroundColor: alpha(colorValue, 0.2),
                },
              }}
            >
              {React.cloneElement(icon, {
                sx: {
                  fontSize: 28,
                  color: colorValue,
                }
              })}
            </Box>
          </Box>
          {trend !== undefined && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 2,
                backgroundColor: trend > 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                borderRadius: 2,
                p: 1,
                width: 'fit-content',
              }}
            >
              {trend > 0 ? (
                <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 20 }} />
              ) : (
                <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 20 }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  ml: 1,
                  color: trend > 0 ? theme.palette.success.main : theme.palette.error.main,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {Math.abs(trend).toFixed(1)}% vs mes anterior
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

// Componente de gráfico mejorado con diseño moderno
const ChartCard = ({ title, icon, children, loading }) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 3,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      },
      border: '1px solid rgba(0,0,0,0.05)',
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 3,
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        pb: 2,
      }}>
        {React.cloneElement(icon, {
          sx: {
            fontSize: 25,
            color: 'primary.main',
            mr: 1,
          }
        })}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '1.1rem',
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 200,
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderRadius: 2,
        }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Box sx={{
          height: 300,
          position: 'relative',
          '& canvas': {
            maxHeight: '100% !important',
          }
        }}>
          {children}
        </Box>
      )}
    </CardContent>
  </Card>
);

// Componente de lista de productos/ventas mejorado
const ListCard = ({ title, icon, items, renderItem, emptyMessage, loading }) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.3s',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress size={40} />
        </Box>
      ) : items && items.length > 0 ? (
        <Box>
          {items.map((item, index) => (
            <Fade in={true} timeout={500 + index * 100} key={item.id || index}>
              <Box>
                {renderItem(item)}
                {index < items.length - 1 && <Divider sx={{ my: 1.5 }} />}
              </Box>
            </Fade>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          {emptyMessage || 'No hay datos disponibles'}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const ModernDashboard = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { userRole, isAdmin, isOwner, hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [cashCloseDialog, setCashCloseDialog] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    dailySales: 0,
    monthlyRevenue: 0,
    salesTrend: 0,
    topProducts: [],
    inventoryValue: 0,
    customerCount: 0,
    customersTrend: 0,
    recentSales: [],
    salesData: initialSalesData,
    categoryData: initialCategoryData
  });

  // Memoizar opciones de gráficos para evitar recálculos innecesarios
  const chartOptions = useMemo(() => ({
    lineChart: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#ddd',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function (context) {
              return `$${context.parsed.y.toFixed(2)}`;
            }
          }
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            callback: function (value) {
              return '$' + value.toFixed(0);
            }
          }
        },
        x: {
          grid: {
            display: false,
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
        },
        line: {
          tension: 0.4,
        }
      }
    },
    doughnutChart: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#ddd',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function (context) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${percentage}%`;
            }
          }
        },
      },
      cutout: '60%',
    }
  }), []);

  // Función para cargar datos del dashboard
  const fetchDashboardData = async () => {
    // Obtener el ID del usuario (puede ser uid de Firebase o _id/id de MongoDB)
    const userId = user?.uid || user?._id || user?.id;

    if (!userId) {
      console.warn('Usuario no autenticado o sin ID:', user);
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener ventas del día
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const salesQuery = query(
        collection(db, 'sales'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(today)),
        orderBy('date', 'desc')
      );

      const salesSnapshot = await getDocs(salesQuery);
      let dailySales = 0;
      let recentSales = [];

      salesSnapshot.forEach((doc) => {
        const sale = doc.data();
        dailySales += sale.total || 0;
        recentSales.push({
          id: doc.id,
          ...sale,
          date: sale.date?.toDate() || new Date()
        });
      });

      // Obtener ventas del mes para calcular tendencias
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlySalesQuery = query(
        collection(db, 'sales'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(firstDayOfMonth)),
        orderBy('date', 'desc')
      );

      const monthlySalesSnapshot = await getDocs(monthlySalesQuery);
      let monthlyRevenue = 0;
      monthlySalesSnapshot.forEach((doc) => {
        const sale = doc.data();
        monthlyRevenue += sale.total || 0;
      });

      // Calcular tendencia de ventas
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthSalesQuery = query(
        collection(db, 'sales'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(firstDayOfLastMonth)),
        where('date', '<', Timestamp.fromDate(firstDayOfMonth)),
        orderBy('date', 'desc')
      );

      const lastMonthSalesSnapshot = await getDocs(lastMonthSalesQuery);
      let lastMonthRevenue = 0;
      lastMonthSalesSnapshot.forEach((doc) => {
        const sale = doc.data();
        lastMonthRevenue += sale.total || 0;
      });

      const salesTrend = lastMonthRevenue > 0
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      // Obtener productos más vendidos
      const productsQuery = query(
        collection(db, 'products'),
        where('userId', '==', userId),
        orderBy('salesCount', 'desc'),
        limit(5)
      );

      const productsSnapshot = await getDocs(productsQuery);
      const topProducts = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Obtener valor del inventario
      const inventoryQuery = query(
        collection(db, 'products'),
        where('userId', '==', userId)
      );

      const inventorySnapshot = await getDocs(inventoryQuery);
      let inventoryValue = 0;
      inventorySnapshot.forEach((doc) => {
        const product = doc.data();
        inventoryValue += (product.price || 0) * (product.stock || 0);
      });

      // Obtener número de clientes
      const customersQuery = query(
        collection(db, 'customers'),
        where('userId', '==', userId)
      );

      const customersSnapshot = await getDocs(customersQuery);
      const customerCount = customersSnapshot.size;

      // Calcular tendencia de clientes
      const firstDayOfLastMonthCustomers = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthCustomersQuery = query(
        collection(db, 'customers'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(firstDayOfLastMonthCustomers)),
        where('createdAt', '<', Timestamp.fromDate(firstDayOfMonth))
      );

      const lastMonthCustomersSnapshot = await getDocs(lastMonthCustomersQuery);
      const lastMonthCustomerCount = lastMonthCustomersSnapshot.size;

      const customersTrend = lastMonthCustomerCount > 0
        ? ((customerCount - lastMonthCustomerCount) / lastMonthCustomerCount) * 100
        : 0;

      // Actualizar estado con todos los datos
      setDashboardData({
        dailySales,
        monthlyRevenue,
        salesTrend,
        topProducts,
        inventoryValue,
        customerCount,
        customersTrend,
        recentSales,
        salesData: {
          ...initialSalesData,
          datasets: [{
            ...initialSalesData.datasets[0],
            data: recentSales.map(sale => sale.total || 0)
          }]
        },
        categoryData: {
          ...initialCategoryData,
          labels: topProducts.map(product => product.name),
          datasets: [{
            ...initialCategoryData.datasets[0],
            data: topProducts.map(product => product.salesCount || 0)
          }]
        }
      });

    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('Error al cargar los datos. Por favor, verifique su conexión a internet e intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
      setSnackbar({
        open: true,
        message: 'Datos actualizados correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      setSnackbar({
        open: true,
        message: 'Error al actualizar los datos',
        severity: 'error'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleNavigate = (path) => {
    console.log('Navegando a:', path);
    startTransition(() => {
      navigate(path);
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setSnackbar({
        open: true,
        message: 'Error al cerrar sesión',
        severity: 'error'
      });
    }
  };

  const handleCashClose = () => {
    setCashCloseDialog(true);
    setSnackbar({
      open: true,
      message: 'Función de cierre de caja en desarrollo',
      severity: 'info'
    });
  };

  // Menú de notificaciones
  const notificationsMenu = (
    <Menu
      anchorEl={notificationsAnchorEl}
      open={Boolean(notificationsAnchorEl)}
      onClose={handleNotificationsClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 320,
          maxHeight: 400,
          overflowY: 'auto',
          borderRadius: 2,
          boxShadow: 3
        }
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem sx={{ justifyContent: 'center', color: 'text.secondary' }}>
        No hay notificaciones nuevas
      </MenuItem>
    </Menu>
  );

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh'
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Cargando dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      maxWidth: '100%',
      margin: '0 auto',
      padding: { xs: 2, sm: 3 },
      background: theme => theme.palette.background.default,
      minHeight: '100vh'
    }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          backgroundColor: theme => theme.palette.background.paper,
          mb: 3
        }}
      >
        {/* Header */}
        <Box sx={{
          mb: 4,
          textAlign: 'center'
        }}>
          <Typography
            variant="h4"
            sx={{
              mb: 1,
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'primary.main'
            }}
          >
            Dashboard
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Visión general del negocio en tiempo real
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Chip
              label={`Rol: ${userRole?.toLowerCase() === 'admin' ? 'ADMINISTRADOR' :
                  userRole?.toLowerCase() === 'owner' ? 'PROPIETARIO' :
                    userRole?.toLowerCase() === 'manager' ? 'GERENTE' :
                      userRole?.toLowerCase() === 'staff' ? 'EMPLEADO' :
                        userRole?.toUpperCase() || 'No asignado'
                }`}
              color={isAdmin() || isOwner() ? 'primary' : 'default'}
              sx={{ fontWeight: 500, mb: 1, px: 2, py: 0.5 }}
              icon={<Person />}
            />
          </Box>
        </Box>

        {/* Botones rápidos */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          flexWrap: { md: 'wrap' },
          gap: { xs: 2, md: 3 },
          mb: 4,
          justifyContent: 'center',
          alignItems: 'stretch',
          mx: 'auto',
          maxWidth: { xs: '100%', sm: '500px', md: '100%' }
        }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleNavigate('/quick-sale')}
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              '&:hover': { bgcolor: 'success.dark' },
              height: { xs: 56, md: 48 },
              borderRadius: 2,
              px: 3,
              flex: { md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 16px)' },
              maxWidth: { md: 'calc(33.333% - 16px)', lg: 'calc(25% - 16px)' },
              minWidth: { xs: '100%', md: '200px' },
              fontSize: { xs: '1rem', md: '0.875rem' }
            }}
          >
            Nueva Venta
          </Button>

          <Button
            variant="contained"
            startIcon={<InventoryIcon />}
            onClick={() => handleNavigate('/products')}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              height: { xs: 56, md: 48 },
              borderRadius: 2,
              px: 3,
              flex: { md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 16px)' },
              maxWidth: { md: 'calc(33.333% - 16px)', lg: 'calc(25% - 16px)' },
              minWidth: { xs: '100%', md: '200px' },
              fontSize: { xs: '1rem', md: '0.875rem' }
            }}
          >
            Agregar Producto
          </Button>

          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={() => handleNavigate('/reports/export')}
            sx={{
              bgcolor: 'info.main',
              color: 'white',
              '&:hover': { bgcolor: 'info.dark' },
              height: { xs: 56, md: 48 },
              borderRadius: 2,
              px: 3,
              flex: { md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 16px)' },
              maxWidth: { md: 'calc(33.333% - 16px)', lg: 'calc(25% - 16px)' },
              minWidth: { xs: '100%', md: '200px' },
              fontSize: { xs: '1rem', md: '0.875rem' }
            }}
          >
            Ver Reportes
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              height: { xs: 56, md: 48 },
              borderRadius: 2,
              px: 3,
              flex: { md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 16px)' },
              maxWidth: { md: 'calc(33.333% - 16px)', lg: 'calc(25% - 16px)' },
              minWidth: { xs: '100%', md: '200px' },
              fontSize: { xs: '1rem', md: '0.875rem' }
            }}
          >
            Actualizar Datos
          </Button>

          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => handleNavigate('/customers')}
            sx={{
              bgcolor: 'warning.main',
              color: 'white',
              '&:hover': { bgcolor: 'warning.dark' },
              height: { xs: 56, md: 48 },
              borderRadius: 2,
              px: 3,
              flex: { md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 16px)' },
              maxWidth: { md: 'calc(33.333% - 16px)', lg: 'calc(25% - 16px)' },
              minWidth: { xs: '100%', md: '200px' },
              fontSize: { xs: '1rem', md: '0.875rem' }
            }}
          >
            Registrar Cliente
          </Button>

          <Button
            variant="outlined"
            startIcon={<Receipt />}
            onClick={() => handleNavigate('/sales')}
            sx={{
              height: { xs: 56, md: 48 },
              borderRadius: 2,
              px: 3,
              flex: { md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 16px)' },
              maxWidth: { md: 'calc(33.333% - 16px)', lg: 'calc(25% - 16px)' },
              minWidth: { xs: '100%', md: '200px' },
              fontSize: { xs: '1rem', md: '0.875rem' }
            }}
          >
            Ver Últimas Ventas
          </Button>

          <Button
            variant="contained"
            startIcon={<Build />}
            onClick={() => handleNavigate('/repairs')}
            sx={{
              bgcolor: '#9c27b0',
              color: 'white',
              '&:hover': { bgcolor: '#7b1fa2' },
              height: { xs: 56, md: 48 },
              borderRadius: 2,
              px: 3,
              flex: { md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 16px)' },
              maxWidth: { md: 'calc(33.333% - 16px)', lg: 'calc(25% - 16px)' },
              minWidth: { xs: '100%', md: '200px' },
              fontSize: { xs: '1rem', md: '0.875rem' }
            }}
          >
            Venta de Reparaciones
          </Button>

          <Button
            variant="contained"
            startIcon={<Settings />}
            onClick={() => handleNavigate('/settings')}
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': { bgcolor: 'error.dark' },
              height: { xs: 56, md: 48 },
              borderRadius: 2,
              px: 3,
              flex: { md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 16px)' },
              maxWidth: { md: 'calc(33.333% - 16px)', lg: 'calc(25% - 16px)' },
              minWidth: { xs: '100%', md: '200px' },
              fontSize: { xs: '1rem', md: '0.875rem' }
            }}
          >
            Configuración
          </Button>
        </Box>

        {/* Menú de notificaciones */}
        {notificationsMenu}

        {/* Tarjetas de métricas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Ventas del día */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              sx={{
                p: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: theme => theme.palette.primary.main,
                color: 'white',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  Ventas del día
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ${dashboardData.dailySales.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {dashboardData.salesTrend > 0 ? '+' : ''}{dashboardData.salesTrend.toFixed(1)}% vs día anterior
                </Typography>
              </Box>
              <Box sx={{ position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)', opacity: 0.1 }}>
                <AttachMoney sx={{ fontSize: { xs: 60, sm: 80 } }} />
              </Box>
            </Card>
          </Grid>

          {/* Ticket promedio */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              sx={{
                p: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: theme => theme.palette.success.main,
                color: 'white',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  Ticket promedio
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ${(dashboardData.dailySales / (dashboardData.recentSales.length || 1)).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {dashboardData.recentSales.length} ventas hoy
                </Typography>
              </Box>
              <Box sx={{ position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)', opacity: 0.1 }}>
                <Receipt sx={{ fontSize: { xs: 60, sm: 80 } }} />
              </Box>
            </Card>
          </Grid>

          {/* Clientes atendidos */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              sx={{
                p: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: theme => theme.palette.info.main,
                color: 'white',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  Clientes atendidos
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {dashboardData.customerCount}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {dashboardData.customersTrend > 0 ? '+' : ''}{dashboardData.customersTrend.toFixed(1)}% vs día anterior
                </Typography>
              </Box>
              <Box sx={{ position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)', opacity: 0.1 }}>
                <People sx={{ fontSize: { xs: 60, sm: 80 } }} />
              </Box>
            </Card>
          </Grid>

          {/* Valor del inventario */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              sx={{
                p: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: theme => theme.palette.warning.main,
                color: 'white',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  Valor del inventario
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ${dashboardData.inventoryValue.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {dashboardData.topProducts.length} productos en stock
                </Typography>
              </Box>
              <Box sx={{ position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)', opacity: 0.1 }}>
                <Inventory sx={{ fontSize: { xs: 60, sm: 80 } }} />
              </Box>
            </Card>
          </Grid>

          {/* Productos con stock bajo */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              sx={{
                p: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: theme => theme.palette.error.main,
                color: 'white',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  Productos con stock bajo
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {dashboardData.lowStockProducts?.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Productos por debajo del mínimo
                </Typography>
              </Box>
              <Box sx={{ position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)', opacity: 0.1 }}>
                <Warning sx={{ fontSize: { xs: 60, sm: 80 } }} />
              </Box>
            </Card>
          </Grid>

          {/* Ventas del mes */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              sx={{
                p: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: theme => theme.palette.primary.main,
                color: 'white',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  Ventas del mes
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ${dashboardData.monthlyRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {format(new Date(), 'MMMM yyyy', { locale: es })}
                </Typography>
              </Box>
              <Box sx={{ position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)', opacity: 0.1 }}>
                <CalendarMonth sx={{ fontSize: { xs: 60, sm: 80 } }} />
              </Box>
            </Card>
          </Grid>

          {/* Top productos vendidos */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              height: '100%',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  gap: 1
                }}>
                  <LocalOffer color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Top Productos Vendidos
                  </Typography>
                </Box>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : dashboardData.topProducts.length > 0 ? (
                  dashboardData.topProducts.slice(0, 3).map((product, index) => (
                    <Box
                      key={product.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1,
                        '&:not(:last-child)': {
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }
                      }}
                    >
                      <Typography variant="body2">
                        {product.name}
                      </Typography>
                      <Chip
                        label={`${product.salesCount || 0} unidades`}
                        size="small"
                        color="primary"
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No hay productos vendidos
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Última venta */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              height: '100%',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  gap: 1
                }}>
                  <ShoppingCart color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Última Venta
                  </Typography>
                </Box>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : dashboardData.recentSales.length > 0 ? (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {format(dashboardData.recentSales[0].date, 'HH:mm')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Cliente: {dashboardData.recentSales[0].customerName || 'Cliente general'}
                    </Typography>
                    <Chip
                      label={`$${dashboardData.recentSales[0].total?.toLocaleString()}`}
                      color="success"
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No hay ventas recientes
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModernDashboard; 