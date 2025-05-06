import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Fade,
  InputAdornment,
  Avatar,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
  Stack,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Notes as NotesIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  ReceiptLong as ReceiptIcon,
  Inventory as InventoryIcon,
  Group as GroupIcon,
  Assignment as ReportIcon,
  LocalShipping as ShippingIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, subDays, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import StatCard from '../StatCard';
import { formatCurrency } from '../../utils/formatters';
import { saveAs } from 'file-saver';
import { PDFDocument, rgb } from 'pdf-lib';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import DailySummaryConfigCard from '../settings/DailySummaryConfigCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

export const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    salesTrend: 0,
    topProducts: [],
    topCustomers: [],
    salesByCategory: [],
    salesByTime: []
  });
  const [exporting, setExporting] = useState(false);
  const [exportMenu, setExportMenu] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedExport, setSelectedExport] = useState(null);

  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Opciones de exportación
  const exportOptions = [
    { 
      id: 'sales', 
      label: 'Reporte de Ventas', 
      icon: <ReceiptIcon />,
      description: 'Ventas detalladas, métodos de pago, productos vendidos'
    },
    { 
      id: 'inventory', 
      label: 'Estado de Inventario', 
      icon: <InventoryIcon />,
      description: 'Stock actual, productos agotados, valor del inventario'
    },
    { 
      id: 'customers', 
      label: 'Análisis de Clientes', 
      icon: <GroupIcon />,
      description: 'Clientes frecuentes, historial de compras, segmentación'
    },
    { 
      id: 'categories', 
      label: 'Rendimiento por Categoría', 
      icon: <CategoryIcon />,
      description: 'Ventas por categoría, tendencias, márgenes'
    },
    { 
      id: 'trends', 
      label: 'Tendencias y Proyecciones', 
      icon: <TimelineIcon />,
      description: 'Análisis de tendencias, proyecciones de ventas'
    },
    { 
      id: 'financial', 
      label: 'Reporte Financiero', 
      icon: <MoneyIcon />,
      description: 'Ingresos, gastos, flujo de caja'
    },
    { 
      id: 'complete', 
      label: 'Reporte Completo', 
      icon: <ReportIcon />,
      description: 'Todos los datos consolidados del POS'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    } else {
        setLoading(false);
    }
  }, [user, timeRange]);

  const calculateDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'day':
        return { startDate: startOfDay(now), endDate: now };
      case 'week':
        return { 
          startDate: startOfWeek(now, { weekStartsOn: 1 }), 
          endDate: now 
        };
      case 'month':
        return { startDate: startOfMonth(now), endDate: now };
      case 'year':
        return { startDate: startOfYear(now), endDate: now };
      default:
        return { 
          startDate: startOfWeek(now, { weekStartsOn: 1 }), 
          endDate: now 
        };
    }
  };

  const fetchAnalytics = async () => {
    if (!user?.uid) {
      setError('Usuario no autenticado');
      setSnackbar({
        open: true,
        message: 'Por favor, inicie sesión para ver los análisis',
        severity: 'warning'
      });
      setLoading(false);
      return;
    }
    
    try {
      setRefreshing(true);
      const { startDate, endDate } = calculateDateRange();
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      // Verificar si existen las colecciones necesarias
      const salesRef = collection(db, 'sales');
      const productsRef = collection(db, 'products');
      const customersRef = collection(db, 'customers');

      // Consulta base de ventas
      let salesQuery = query(
        salesRef,
        where('userId', '==', user.uid),
        where('date', '>=', startTimestamp),
        where('date', '<=', endTimestamp),
        orderBy('date', 'desc')
      );
      
      const salesSnapshot = await getDocs(salesQuery);
      const sales = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() // Convertir Timestamp a Date
      }));

      // Calcular totales
      const totalSales = sales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
      const totalProducts = sales.reduce((sum, sale) => 
        sum + (Array.isArray(sale.items) ? sale.items.reduce((itemSum, item) => 
          itemSum + (Number(item.quantity) || 0), 0) : 0), 0);
      const totalCustomers = new Set(sales.map(sale => sale.customerId).filter(Boolean)).size;
      const averageOrderValue = sales.length > 0 ? totalSales / sales.length : 0;

      // Procesar productos más vendidos
      const productSales = {};
      for (const sale of sales) {
        if (!Array.isArray(sale.items)) continue;
        
        for (const item of sale.items) {
          const productId = item?.productId || 'unknown';
          const productName = item?.name || 'Producto Desconocido';
          const productPrice = Number(item?.price) || 0;
          const quantity = Number(item?.quantity) || 0;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              name: productName,
              sales: 0,
              quantity: 0
            };
          }
          productSales[productId].quantity += quantity;
          productSales[productId].sales += productPrice * quantity;
        }
      }

      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({
          id,
          name: data.name,
          quantity: data.quantity,
          sales: Number(data.sales) || 0
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      // Procesar clientes principales
      const topCustomersData = {};
      for (const sale of sales) {
        if (!sale?.customerId || !sale?.customerName) continue;
        
        if (!topCustomersData[sale.customerId]) {
          topCustomersData[sale.customerId] = {
            name: sale.customerName,
            purchases: 0,
            total: 0
          };
        }
        topCustomersData[sale.customerId].purchases++;
        topCustomersData[sale.customerId].total += Number(sale.total) || 0;
      }

      const topCustomers = Object.entries(topCustomersData)
        .map(([id, data]) => ({
          id,
          name: data.name,
          purchases: data.purchases,
          total: Number(data.total) || 0
        }))
        .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
      // Procesar ventas por categoría
      const salesByCategory = {};
      for (const sale of sales) {
        if (!Array.isArray(sale.items)) continue;
        
        for (const item of sale.items) {
          if (!item?.category) continue;
          
          if (!salesByCategory[item.category]) {
            salesByCategory[item.category] = 0;
          }
          salesByCategory[item.category] += (Number(item.quantity) || 0) * (Number(item.price) || 0);
        }
      }

      const categorySales = Object.entries(salesByCategory)
        .map(([category, sales]) => ({
          category,
          sales: Number(sales) || 0
        }))
        .sort((a, b) => b.sales - a.sales);

      // Procesar ventas por día
      const salesByTime = {};
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      
      for (const sale of sales) {
        if (!sale.date) continue;
        
        const saleDate = sale.date instanceof Date ? sale.date : new Date();
        const day = days[saleDate.getDay()];
        if (!salesByTime[day]) {
          salesByTime[day] = 0;
        }
        salesByTime[day] += Number(sale.total) || 0;
      }

      const timelineSales = Object.entries(salesByTime)
        .map(([time, sales]) => ({
          time,
          sales: Number(sales) || 0
        }))
        .sort((a, b) => days.indexOf(a.time) - days.indexOf(b.time));

      // Calcular tendencia
      let salesTrend = 0;
      try {
        const previousPeriodStart = subDays(startDate, startDate.getDate());
        const previousSalesQuery = query(
          salesRef,
          where('businessId', '==', user.uid),
          where('date', '>=', Timestamp.fromDate(previousPeriodStart)),
          where('date', '<', startTimestamp)
        );
        const previousSalesSnapshot = await getDocs(previousSalesQuery);
        const previousTotal = previousSalesSnapshot.docs.reduce((sum, doc) => 
          sum + (Number(doc.data().total) || 0), 0);
        
        salesTrend = previousTotal > 0 
          ? ((totalSales - previousTotal) / previousTotal) * 100 
          : 0;
      } catch (error) {
        console.error('Error al calcular tendencia:', error);
      }

      setStats({
        totalSales,
        totalProducts,
        totalCustomers,
        averageOrderValue,
        salesTrend,
        topProducts,
        topCustomers,
        salesByCategory: categorySales,
        salesByTime: timelineSales
      });

      setError(null);
      setSnackbar({
        open: true,
        message: 'Datos actualizados correctamente',
        severity: 'success'
      });

    } catch (err) {
      console.error('Error al cargar los análisis:', err);
      setError('Error al cargar los análisis: ' + err.message);
      setSnackbar({
        open: true,
        message: 'Error al cargar los análisis. Por favor, verifica tu conexión e intenta nuevamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExportData = async (option) => {
    try {
      setExportLoading(true);
      setSelectedExport(option.id);

      // Recopilar datos según la opción seleccionada
      const data = await fetchExportData(option.id);
      
      // Generar el PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4

      // Título y encabezado
      page.drawText(option.label, {
        x: 50,
        y: 800,
        size: 20,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, {
        x: 50,
        y: 770,
        size: 12,
        color: rgb(0.4, 0.4, 0.4),
      });

      // Contenido específico según el tipo de reporte
      let yPosition = 720;
      
      switch (option.id) {
        case 'sales':
          await generateSalesReport(pdfDoc, page, data, yPosition);
          break;
        case 'inventory':
          await generateInventoryReport(pdfDoc, page, data, yPosition);
          break;
        case 'customers':
          await generateCustomersReport(pdfDoc, page, data, yPosition);
          break;
        case 'categories':
          await generateCategoriesReport(pdfDoc, page, data, yPosition);
          break;
        case 'trends':
          await generateTrendsReport(pdfDoc, page, data, yPosition);
          break;
        case 'financial':
          await generateFinancialReport(pdfDoc, page, data, yPosition);
          break;
        case 'complete':
          await generateCompleteReport(pdfDoc, page, data, yPosition);
          break;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `reporte-${option.id}-${format(new Date(), 'dd-MM-yyyy')}.pdf`);

      setSnackbar({
        open: true,
        message: 'Reporte generado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generando reporte:', error);
      setSnackbar({
        open: true,
        message: 'Error al generar el reporte: ' + error.message,
        severity: 'error'
      });
    } finally {
      setExportLoading(false);
      setSelectedExport(null);
      setExportMenu(null);
    }
  };

  const fetchExportData = async (type) => {
    const salesRef = collection(db, 'sales');
    const productsRef = collection(db, 'products');
    const customersRef = collection(db, 'customers');
    const { startDate, endDate } = calculateDateRange();

    switch (type) {
      case 'sales':
        const salesQuery = query(
          salesRef,
          where('userId', '==', user.uid),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          orderBy('date', 'desc')
        );
        const salesDocs = await getDocs(salesQuery);
        return salesDocs.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: convertFirestoreTimestamp(data.date)
          };
        });

      case 'inventory':
        const inventoryQuery = query(
          productsRef,
          where('userId', '==', user.uid)
        );
        const inventoryDocs = await getDocs(inventoryQuery);
        return inventoryDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

      case 'customers':
        const customersQuery = query(
          customersRef,
          where('userId', '==', user.uid)
        );
        const customerDocs = await getDocs(customersQuery);
        return customerDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

      // ... más casos para otros tipos de reportes

      case 'complete':
        // Obtener todos los datos
        const [sales, inventory, customers] = await Promise.all([
          getDocs(query(salesRef, where('userId', '==', user.uid))),
          getDocs(query(productsRef, where('userId', '==', user.uid))),
          getDocs(query(customersRef, where('userId', '==', user.uid)))
        ]);

        return {
          sales: sales.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: convertFirestoreTimestamp(data.date)
            };
          }),
          inventory: inventory.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })),
          customers: customers.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              lastPurchase: convertFirestoreTimestamp(data.lastPurchase)
            };
          })
        };

      default:
        return [];
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        gap: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}
        >
          Panel de Análisis
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          width: { xs: '100%', sm: 'auto' },
          justifyContent: { xs: 'space-between', sm: 'flex-end' }
        }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Período"
            >
              <MenuItem value="day">Hoy</MenuItem>
              <MenuItem value="week">Esta semana</MenuItem>
              <MenuItem value="month">Este mes</MenuItem>
              <MenuItem value="year">Este año</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAnalytics}
            disabled={refreshing}
            sx={{ 
              whiteSpace: 'nowrap',
              minWidth: { xs: 'auto', sm: 'auto' }
            }}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={(e) => setExportMenu(e.currentTarget)}
            disabled={exportLoading}
            sx={{ 
              whiteSpace: 'nowrap',
              minWidth: { xs: 'auto', sm: 'auto' }
            }}
          >
            Exportar
          </Button>
        </Box>
      </Box>

      {/* Menú de exportación */}
      <Menu
        anchorEl={exportMenu}
        open={Boolean(exportMenu)}
        onClose={() => setExportMenu(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 320,
            maxHeight: '80vh',
            '& .MuiMenuItem-root': {
              py: 1,
              px: 2,
            },
          },
        }}
      >
        {exportOptions.map((option) => (
          <MenuItem
            key={option.id}
            onClick={() => handleExportData(option)}
            disabled={exportLoading && selectedExport === option.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': {
                borderBottom: 'none',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {option.icon}
              </ListItemIcon>
              <ListItemText 
                primary={option.label}
                primaryTypographyProps={{
                  fontWeight: 600,
                }}
              />
              {exportLoading && selectedExport === option.id && (
                <CircularProgress size={20} sx={{ ml: 1 }} />
              )}
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ pl: 4.5 }}
            >
              {option.description}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Tarjetas de estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-4px)',
              transition: 'transform 0.3s ease-in-out'
            }
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2
              }}>
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.8, mb: 1 }}>
                    Ventas Totales
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(stats.totalSales)}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 1,
                    gap: 1
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      En el período
        </Typography>
                    <Chip
                      size="small"
                      icon={stats.salesTrend >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={`${stats.salesTrend >= 0 ? '+' : ''}${stats.salesTrend}%`}
                      color={stats.salesTrend >= 0 ? 'success' : 'error'}
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    />
                  </Box>
        </Box>
                <MoneyIcon sx={{ 
                  fontSize: 40,
                  opacity: 0.2,
                  position: 'absolute',
                  right: 20,
                  top: 20
                }} />
        </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.8)} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-4px)',
              transition: 'transform 0.3s ease-in-out'
            }
          }}>
                <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2
              }}>
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.8, mb: 1 }}>
                    Productos Vendidos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalProducts}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 1,
                    gap: 1
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      En total
                    </Typography>
                    <Chip
                      size="small"
                      label="45% más que ayer"
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    />
                  </Box>
                </Box>
                <CartIcon sx={{ 
                  fontSize: 40,
                  opacity: 0.2,
                  position: 'absolute',
                  right: 20,
                  top: 20
                }} />
              </Box>
                </CardContent>
              </Card>
            </Grid>
            
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${alpha(theme.palette.info.main, 0.8)} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-4px)',
              transition: 'transform 0.3s ease-in-out'
            }
          }}>
                <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2
              }}>
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.8, mb: 1 }}>
                    Clientes Activos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalCustomers}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 1,
                    gap: 1
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      En el período
                    </Typography>
                    <Chip
                      size="small"
                      label="+5 nuevos"
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 1,
                    gap: 1
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Tasa de retención: 85%
                    </Typography>
                  </Box>
                </Box>
                <PersonIcon sx={{ 
                  fontSize: 40,
                  opacity: 0.2,
                  position: 'absolute',
                  right: 20,
                  top: 20
                }} />
              </Box>
                </CardContent>
              </Card>
            </Grid>
            
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${alpha(theme.palette.warning.main, 0.8)} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-4px)',
              transition: 'transform 0.3s ease-in-out'
            }
          }}>
                <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2
              }}>
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.8, mb: 1 }}>
                    Valor Promedio
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(stats.averageOrderValue)}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 1,
                    gap: 1
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Por orden
                    </Typography>
                    <Chip
                      size="small"
                      label="+12% vs mes anterior"
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 1,
                    gap: 1
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Ticket promedio: 3.2 productos
                    </Typography>
                  </Box>
                </Box>
                <BarChartIcon sx={{ 
                  fontSize: 40,
                  opacity: 0.2,
                  position: 'absolute',
                  right: 20,
                  top: 20
                }} />
              </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
      {/* Gráficos y tablas */}
          <Grid container spacing={3}>
        {/* Productos más vendidos */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Productos más Vendidos
                </Typography>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Ventas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                bgcolor: theme.palette.primary.main,
                                fontSize: '0.75rem'
                              }}
                            >
                              {product.name[0]}
                            </Avatar>
                            <Typography variant="body2">
                              {product.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(product.sales)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
            </Grid>
            
        {/* Clientes principales */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Clientes Principales
                </Typography>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell align="right">Compras</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.topCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                bgcolor: theme.palette.secondary.main,
                                fontSize: '0.75rem'
                              }}
                            >
                              {customer.name[0]}
                            </Avatar>
                            <Typography variant="body2">
                              {customer.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {customer.purchases}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(customer.total)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Ventas por categoría */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ventas por Categoría
                </Typography>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Categoría</TableCell>
                      <TableCell align="right">Ventas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.salesByCategory.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon sx={{ 
                              color: theme.palette.primary.main,
                              fontSize: 20
                            }} />
                            <Typography variant="body2">
                              {item.category}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(item.sales)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
            </Grid>
            
        {/* Ventas por tiempo */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ventas por Día
                </Typography>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Box sx={{ height: 300 }}>
                <Line
                  data={{
                    labels: stats.salesByTime.map(item => item.time),
                    datasets: [{
                      label: 'Ventas',
                      data: stats.salesByTime.map(item => item.sales),
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      tension: 0.4,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: value => formatCurrency(value)
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
            </Grid>
          </Grid>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <DailySummaryConfigCard user={user} />
        </Grid>
      </Grid>
    </Box>
  );
};

// Funciones auxiliares para generar reportes específicos
const generateSalesReport = async (pdfDoc, page, data, startY) => {
  let y = startY;
  
  // Resumen de ventas
  page.drawText('Resumen de Ventas', {
    x: 50,
    y,
    size: 16,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  const totalSales = data.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
  const totalItems = data.reduce((sum, sale) => 
    sum + (Array.isArray(sale.items) ? sale.items.length : 0), 0);

  const stats = [
    { label: 'Total de Ventas', value: formatCurrency(totalSales) },
    { label: 'Total de Productos Vendidos', value: totalItems },
    { label: 'Promedio por Venta', value: formatCurrency(totalSales / data.length) },
    { label: 'Total de Transacciones', value: data.length }
  ];

  stats.forEach(stat => {
    page.drawText(`${stat.label}: ${stat.value}`, {
      x: 50,
      y,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  });

  // Detalles de ventas
  y -= 20;
  page.drawText('Detalle de Ventas', {
    x: 50,
    y,
    size: 14,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  data.forEach((sale, index) => {
    if (y < 50) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 800;
    }

    const saleDetails = [
      `${index + 1}. Venta #${sale.id}`,
      `   Fecha: ${formatSafeDate(sale.date)}`,
      `   Total: ${formatCurrency(sale.total)}`,
      `   Cliente: ${sale.customerName || 'Cliente General'}`,
      `   Método de Pago: ${sale.paymentMethod || 'No especificado'}`
    ];

    saleDetails.forEach(detail => {
      page.drawText(detail, {
        x: 50,
        y,
        size: 10,
        color: rgb(0, 0, 0),
      });
      y -= 15;
    });
    y -= 10;
  });
};

const generateInventoryReport = async (pdfDoc, page, data, startY) => {
  let y = startY;

  // Resumen de inventario
  page.drawText('Estado del Inventario', {
    x: 50,
    y,
    size: 16,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  const totalValue = data.reduce((sum, item) => sum + (Number(item.price) * Number(item.stock) || 0), 0);
  const lowStock = data.filter(item => Number(item.stock) <= Number(item.minStock));
  const outOfStock = data.filter(item => Number(item.stock) === 0);

  const stats = [
    { label: 'Valor Total del Inventario', value: formatCurrency(totalValue) },
    { label: 'Total de Productos', value: data.length },
    { label: 'Productos con Stock Bajo', value: lowStock.length },
    { label: 'Productos Agotados', value: outOfStock.length }
  ];

  stats.forEach(stat => {
    page.drawText(`${stat.label}: ${stat.value}`, {
      x: 50,
      y,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  });

  // Lista de productos
  y -= 20;
  ['Productos con Stock Bajo', 'Inventario Completo'].forEach(section => {
    if (y < 50) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 800;
    }

    page.drawText(section, {
      x: 50,
      y,
      size: 14,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    const items = section === 'Productos con Stock Bajo' ? lowStock : data;
    items.forEach((item, index) => {
      if (y < 50) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 800;
      }

      const details = [
        `${index + 1}. ${item.name}`,
        `   Stock Actual: ${item.stock} | Stock Mínimo: ${item.minStock}`,
        `   Precio: ${formatCurrency(item.price)} | Valor Total: ${formatCurrency(item.price * item.stock)}`,
        `   Categoría: ${item.category || 'Sin categoría'}`
      ];

      details.forEach(detail => {
        page.drawText(detail, {
          x: 50,
          y,
          size: 10,
          color: rgb(0, 0, 0),
        });
        y -= 15;
      });
      y -= 5;
    });
    y -= 20;
  });
};

const generateCustomersReport = async (pdfDoc, page, data, startY) => {
  let y = startY;

  // Resumen de clientes
  page.drawText('Análisis de Clientes', {
    x: 50,
    y,
    size: 16,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  const totalPurchases = data.reduce((sum, customer) => sum + (Number(customer.totalPurchases) || 0), 0);
  const totalSpent = data.reduce((sum, customer) => sum + (Number(customer.totalSpent) || 0), 0);
  const activeCustomers = data.filter(customer => customer.lastPurchase && new Date(customer.lastPurchase) > subDays(new Date(), 30));

  const stats = [
    { label: 'Total de Clientes', value: data.length },
    { label: 'Clientes Activos (30 días)', value: activeCustomers.length },
    { label: 'Total de Compras', value: totalPurchases },
    { label: 'Valor Total de Compras', value: formatCurrency(totalSpent) },
    { label: 'Promedio por Cliente', value: formatCurrency(totalSpent / data.length) }
  ];

  stats.forEach(stat => {
    page.drawText(`${stat.label}: ${stat.value}`, {
      x: 50,
      y,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  });

  // Lista de mejores clientes
  y -= 20;
  page.drawText('Mejores Clientes', {
    x: 50,
    y,
    size: 14,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  const topCustomers = [...data]
    .sort((a, b) => (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0))
    .slice(0, 20);

  topCustomers.forEach((customer, index) => {
    if (y < 50) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 800;
    }

    const details = [
      `${index + 1}. ${customer.name}`,
      `   Email: ${customer.email || 'No disponible'}`,
      `   Teléfono: ${customer.phone || 'No disponible'}`,
      `   Total Gastado: ${formatCurrency(customer.totalSpent || 0)}`,
      `   Compras Realizadas: ${customer.totalPurchases || 0}`,
      `   Última Compra: ${formatSafeDate(customer.lastPurchase, 'dd/MM/yyyy')}`
    ];

    details.forEach(detail => {
      page.drawText(detail, {
        x: 50,
        y,
        size: 10,
        color: rgb(0, 0, 0),
      });
      y -= 15;
    });
    y -= 10;
  });
};

const generateCategoriesReport = async (pdfDoc, page, data, startY) => {
  let y = startY;

  // Resumen por categorías
  page.drawText('Análisis por Categoría', {
    x: 50,
    y,
    size: 16,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  // Agrupar ventas por categoría
  const categoryStats = {};
  data.forEach(sale => {
    if (!Array.isArray(sale.items)) return;
    
    sale.items.forEach(item => {
      const category = item.category || 'Sin categoría';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          sales: 0,
          items: 0,
          revenue: 0
        };
      }
      categoryStats[category].sales++;
      categoryStats[category].items += Number(item.quantity) || 0;
      categoryStats[category].revenue += (Number(item.price) * Number(item.quantity)) || 0;
    });
  });

  const totalRevenue = Object.values(categoryStats).reduce((sum, cat) => sum + cat.revenue, 0);

  // Mostrar estadísticas por categoría
  Object.entries(categoryStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .forEach(([category, stats]) => {
      if (y < 50) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 800;
      }

      page.drawText(category, {
        x: 50,
        y,
        size: 14,
        color: rgb(0, 0, 0),
      });
      y -= 20;

      const details = [
        `Ventas Totales: ${formatCurrency(stats.revenue)}`,
        `Porcentaje del Total: ${((stats.revenue / totalRevenue) * 100).toFixed(2)}%`,
        `Productos Vendidos: ${stats.items}`,
        `Número de Transacciones: ${stats.sales}`
      ];

      details.forEach(detail => {
        page.drawText(`   ${detail}`, {
          x: 50,
          y,
          size: 10,
          color: rgb(0, 0, 0),
        });
        y -= 15;
      });
      y -= 15;
    });
};

const generateTrendsReport = async (pdfDoc, page, data, startY) => {
  let y = startY;

  page.drawText('Análisis de Tendencias', {
    x: 50,
    y,
    size: 16,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  // Agrupar ventas por día
  const dailySales = {};
  data.forEach(sale => {
    if (!sale.date) return;
    const date = formatSafeDate(sale.date, 'yyyy-MM-dd');
    if (!dailySales[date]) {
      dailySales[date] = {
        total: 0,
        transactions: 0,
        items: 0
      };
    }
    dailySales[date].total += Number(sale.total) || 0;
    dailySales[date].transactions++;
    dailySales[date].items += (Array.isArray(sale.items) ? sale.items.length : 0);
  });

  // Calcular tendencias
  const dates = Object.keys(dailySales).sort();
  const trends = {
    sales: calculateTrend(dates.map(date => dailySales[date].total)),
    transactions: calculateTrend(dates.map(date => dailySales[date].transactions)),
    items: calculateTrend(dates.map(date => dailySales[date].items))
  };

  // Mostrar tendencias
  const trendLabels = [
    { key: 'sales', label: 'Tendencia de Ventas' },
    { key: 'transactions', label: 'Tendencia de Transacciones' },
    { key: 'items', label: 'Tendencia de Productos' }
  ];

  trendLabels.forEach(({ key, label }) => {
    page.drawText(`${label}: ${trends[key] >= 0 ? '+' : ''}${trends[key].toFixed(2)}%`, {
      x: 50,
      y,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  });

  // Mostrar ventas diarias
  y -= 20;
  page.drawText('Ventas Diarias', {
    x: 50,
    y,
    size: 14,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  dates.forEach(date => {
    if (y < 50) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 800;
    }

    const stats = dailySales[date];
    const details = [
      `Fecha: ${formatSafeDate(parseISO(date), 'dd/MM/yyyy')}`,
      `   Ventas: ${formatCurrency(stats.total)}`,
      `   Transacciones: ${stats.transactions}`,
      `   Productos Vendidos: ${stats.items}`,
      `   Promedio por Transacción: ${formatCurrency(stats.total / stats.transactions)}`
    ];

    details.forEach(detail => {
      page.drawText(detail, {
        x: 50,
        y,
        size: 10,
        color: rgb(0, 0, 0),
      });
      y -= 15;
    });
    y -= 10;
  });
};

const generateFinancialReport = async (pdfDoc, page, data, startY) => {
  let y = startY;

  page.drawText('Reporte Financiero', {
    x: 50,
    y,
    size: 16,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  // Calcular métricas financieras
  const totalSales = data.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
  const totalCost = data.reduce((sum, sale) => {
    if (!Array.isArray(sale.items)) return sum;
    return sum + sale.items.reduce((itemSum, item) => 
      itemSum + ((Number(item.cost) || 0) * (Number(item.quantity) || 0)), 0);
  }, 0);

  const grossProfit = totalSales - totalCost;
  const grossMargin = (grossProfit / totalSales) * 100;

  const metrics = [
    { label: 'Ingresos Totales', value: formatCurrency(totalSales) },
    { label: 'Costo de Ventas', value: formatCurrency(totalCost) },
    { label: 'Beneficio Bruto', value: formatCurrency(grossProfit) },
    { label: 'Margen Bruto', value: `${grossMargin.toFixed(2)}%` },
    { label: 'Promedio Diario', value: formatCurrency(totalSales / Object.keys(data).length) }
  ];

  metrics.forEach(metric => {
    page.drawText(`${metric.label}: ${metric.value}`, {
      x: 50,
      y,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  });

  // Análisis por método de pago
  y -= 20;
  page.drawText('Análisis por Método de Pago', {
    x: 50,
    y,
    size: 14,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  const paymentMethods = {};
  data.forEach(sale => {
    const method = sale.paymentMethod || 'No especificado';
    if (!paymentMethods[method]) {
      paymentMethods[method] = {
        total: 0,
        count: 0
      };
    }
    paymentMethods[method].total += Number(sale.total) || 0;
    paymentMethods[method].count++;
  });

  Object.entries(paymentMethods).forEach(([method, stats]) => {
    if (y < 50) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 800;
    }

    const details = [
      `${method}:`,
      `   Total: ${formatCurrency(stats.total)}`,
      `   Transacciones: ${stats.count}`,
      `   Promedio: ${formatCurrency(stats.total / stats.count)}`,
      `   % del Total: ${((stats.total / totalSales) * 100).toFixed(2)}%`
    ];

    details.forEach(detail => {
      page.drawText(detail, {
        x: 50,
        y,
        size: 10,
        color: rgb(0, 0, 0),
      });
      y -= 15;
    });
    y -= 10;
  });
};

const generateCompleteReport = async (pdfDoc, page, data, startY) => {
  let y = startY;

  // Generar resumen general
  page.drawText('Reporte Completo del Sistema', {
    x: 50,
    y,
    size: 16,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  const { sales, inventory, customers } = data;

  // Resumen de ventas
  const totalSales = sales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
  const totalProducts = inventory.length;
  const totalCustomers = customers.length;

  const summaryMetrics = [
    { label: 'Ventas Totales', value: formatCurrency(totalSales) },
    { label: 'Total de Productos', value: totalProducts },
    { label: 'Total de Clientes', value: totalCustomers },
    { label: 'Promedio de Venta', value: formatCurrency(totalSales / sales.length) }
  ];

  summaryMetrics.forEach(metric => {
    page.drawText(`${metric.label}: ${metric.value}`, {
      x: 50,
      y,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  });

  // Generar secciones específicas
  const sections = [
    { title: 'Análisis de Ventas', generator: generateSalesReport, data: sales },
    { title: 'Estado del Inventario', generator: generateInventoryReport, data: inventory },
    { title: 'Análisis de Clientes', generator: generateCustomersReport, data: customers },
    { title: 'Análisis por Categoría', generator: generateCategoriesReport, data: sales },
    { title: 'Tendencias', generator: generateTrendsReport, data: sales },
    { title: 'Análisis Financiero', generator: generateFinancialReport, data: sales }
  ];

  for (const section of sections) {
    // Nueva página para cada sección
    const newPage = pdfDoc.addPage([595.28, 841.89]);
    await section.generator(pdfDoc, newPage, section.data, 800);
  }
};

// Función auxiliar para calcular tendencias
const calculateTrend = (values) => {
  if (values.length < 2) return 0;
  const first = values[0];
  const last = values[values.length - 1];
  return first === 0 ? 100 : ((last - first) / first) * 100;
};

// Función auxiliar para validar y formatear fechas
const formatSafeDate = (date, formatStr = 'dd/MM/yyyy HH:mm') => {
  try {
    if (!date) return 'No disponible';
    
    // Si es un Timestamp de Firestore
    if (date?.toDate instanceof Function) {
      date = date.toDate();
    }
    
    // Si es string, intentar parsearlo
    if (typeof date === 'string') {
      date = parseISO(date);
    }

    // Validar que sea una fecha válida
    if (!isValid(date)) {
      return 'Fecha inválida';
    }

    return format(date, formatStr, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Error en fecha';
  }
};

// Función auxiliar para convertir Timestamp a Date
const convertFirestoreTimestamp = (timestamp) => {
  try {
    if (!timestamp) return null;
    if (timestamp?.toDate instanceof Function) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      const parsed = parseISO(timestamp);
      return isValid(parsed) ? parsed : null;
    }
    return null;
  } catch (error) {
    console.error('Error convirtiendo timestamp:', error);
    return null;
  }
};

export default AnalyticsDashboard; 