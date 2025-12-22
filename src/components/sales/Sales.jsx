import React, { useState, useEffect, useMemo, startTransition } from 'react';
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
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Stack,
  Fade,
  Avatar,
  Badge,
  InputAdornment,
  Skeleton,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  LocalPrintshop as PrintIcon,
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  Notifications,
  Person,
  CalendarToday,
  Menu,
  Store,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  CameraAlt as CameraAltIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContextMongo';
import api from '../../api/api';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import StatCard from '../StatCard';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import SalesList from './SalesList';
import BarcodeScanner from '../products/BarcodeScanner';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

const MotionPaper = motion(Paper);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalAmount: 0,
    averageTicket: 0,
    uniqueCustomers: 0
  });
  const { user } = useAuth();
  const [selectedSale, setSelectedSale] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();
  const [isListOpen, setIsListOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Ventas',
      data: [],
      borderColor: '#7209f5',
      backgroundColor: 'rgba(114, 9, 245, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
      case 'yesterday':
        return {
          start: startOfDay(subDays(now, 1)),
          end: endOfDay(subDays(now, 1))
        };
      case 'last7days':
        return {
          start: startOfDay(subDays(now, 7)),
          end: endOfDay(now)
        };
      case 'last30days':
        return {
          start: startOfDay(subDays(now, 30)),
          end: endOfDay(now)
        };
      default:
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
    }
  };

  const fetchSales = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { start, end } = getDateRange();

      // Usar la API de MongoDB backend
      const response = await api.get('/sales', {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      });

      const salesData = response.data.data || response.data || [];

      console.log('📊 Sales data received:', salesData.length, 'sales');
      console.log('📊 First sale sample:', salesData[0]);

      // Normalizar los datos de MongoDB para que funcionen con el componente
      const normalizedSales = salesData.map((sale, index) => {
        try {
          // Extraer el nombre del cliente de diferentes fuentes posibles
          let customerName = 'Cliente General';
          if (sale.cliente_nombre) {
            customerName = sale.cliente_nombre;
          } else if (sale.cliente_id && typeof sale.cliente_id === 'object' && sale.cliente_id.nombre) {
            // Si cliente_id está poblado con los datos del cliente
            customerName = sale.cliente_id.nombre;
          }

          // Parsear la fecha con manejo de errores
          let saleDate;
          try {
            saleDate = new Date(sale.fecha || sale.createdAt || sale.date);
            if (isNaN(saleDate.getTime())) {
              console.warn(`⚠️ Invalid date for sale ${index}:`, sale.fecha);
              saleDate = new Date(); // Fallback a fecha actual
            }
          } catch (dateError) {
            console.error(`❌ Error parsing date for sale ${index}:`, dateError);
            saleDate = new Date(); // Fallback a fecha actual
          }

          return {
            ...sale,
            id: sale._id || sale.id,
            date: saleDate,
            customerName,
            customerId: (sale.cliente_id && typeof sale.cliente_id === 'object') ? sale.cliente_id._id : sale.cliente_id,
            customerPhone: sale.cliente_telefono || (sale.cliente_id && typeof sale.cliente_id === 'object' ? sale.cliente_id.telefono : null),
            total: sale.total || 0,
            status: sale.estado || sale.status || 'completed',
            items: sale.items || []
          };
        } catch (error) {
          console.error(`❌ Error normalizing sale ${index}:`, error, sale);
          // Retornar un objeto de venta básico en caso de error
          return {
            id: sale._id || sale.id || `error-${index}`,
            date: new Date(),
            customerName: 'Error al cargar',
            customerId: null,
            customerPhone: null,
            total: 0,
            status: 'error',
            items: []
          };
        }
      });

      console.log('✅ Normalized sales:', normalizedSales.length);
      setSales(normalizedSales);

      // Calcular estadísticas
      const totalAmount = normalizedSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const uniqueCustomers = new Set(normalizedSales.map(sale => sale.customerId).filter(Boolean)).size;

      setStats({
        totalSales: normalizedSales.length,
        totalAmount,
        averageTicket: normalizedSales.length > 0 ? totalAmount / normalizedSales.length : 0,
        uniqueCustomers
      });

    } catch (err) {
      console.error('Error loading sales:', err);
      setError('Error al cargar las ventas: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await fetchSales();
      } finally {
        setIsInitialLoad(false);
        setLoading(false);
      }
    };

    if (isInitialLoad) {
      loadInitialData();
    }
  }, [isInitialLoad]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'completado':
        return 'success';
      case 'pending':
      case 'pendiente':
        return 'warning';
      case 'cancelled':
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch =
        sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        sale.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [sales, searchTerm, statusFilter]);

  // Función para manejar la impresión con diseño profesional
  const handlePrint = (sale) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprobante de Venta #${sale.id?.slice(-6)}</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f5f5f5;
              padding: 20px;
              color: #333;
            }
            
            .ticket {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #7209f5 0%, #9d4edd 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
              position: relative;
            }
            
            .header::after {
              content: '';
              position: absolute;
              bottom: -10px;
              left: 0;
              right: 0;
              height: 20px;
              background: white;
              border-radius: 50% 50% 0 0 / 100% 100% 0 0;
            }
            
            .company-name {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            
            .ticket-title {
              font-size: 14px;
              opacity: 0.9;
              font-weight: 300;
            }
            
            .content {
              padding: 30px 20px 20px;
            }
            
            .section {
              margin-bottom: 25px;
            }
            
            .section-title {
              font-size: 12px;
              color: #7209f5;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 2px solid #f0f0f0;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px dashed #e0e0e0;
            }
            
            .info-row:last-child {
              border-bottom: none;
            }
            
            .info-label {
              font-size: 13px;
              color: #666;
              font-weight: 500;
            }
            
            .info-value {
              font-size: 13px;
              color: #333;
              font-weight: 600;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            
            .items-table th {
              background: #f8f8f8;
              padding: 10px 8px;
              text-align: left;
              font-size: 11px;
              color: #666;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .items-table td {
              padding: 12px 8px;
              border-bottom: 1px solid #f0f0f0;
              font-size: 13px;
            }
            
            .items-table tr:last-child td {
              border-bottom: none;
            }
            
            .item-name {
              color: #333;
              font-weight: 500;
            }
            
            .item-qty {
              color: #666;
              text-align: center;
            }
            
            .item-price {
              color: #333;
              text-align: right;
              font-weight: 600;
            }
            
            .total-section {
              background: linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%);
              padding: 20px;
              margin: 20px -20px -20px;
              border-top: 2px solid #7209f5;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 0;
            }
            
            .total-label {
              font-size: 18px;
              color: #333;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .total-amount {
              font-size: 28px;
              color: #7209f5;
              font-weight: 700;
            }
            
            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .status-completed {
              background: #d4edda;
              color: #155724;
            }
            
            .status-pending {
              background: #fff3cd;
              color: #856404;
            }
            
            .status-cancelled {
              background: #f8d7da;
              color: #721c24;
            }
            
            .footer {
              text-align: center;
              padding: 20px;
              background: #f8f8f8;
              margin: 0 -20px -20px;
            }
            
            .footer-text {
              font-size: 14px;
              color: #7209f5;
              font-weight: 600;
              margin-bottom: 5px;
            }
            
            .footer-subtext {
              font-size: 11px;
              color: #999;
            }
            
            .divider {
              height: 2px;
              background: linear-gradient(90deg, transparent, #7209f5, transparent);
              margin: 20px 0;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .ticket {
                box-shadow: none;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div class="company-name">POSENT PRO</div>
              <div class="ticket-title">Comprobante de Venta</div>
            </div>
            
            <div class="content">
              <!-- Información de la venta -->
              <div class="section">
                <div class="section-title">Información de la Venta</div>
                <div class="info-row">
                  <span class="info-label">ID de Venta:</span>
                  <span class="info-value">#${sale.id?.slice(-8).toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Fecha y Hora:</span>
                  <span class="info-value">${format(sale.date, 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Estado:</span>
                  <span class="status-badge status-${sale.status === 'completed' ? 'completed' : sale.status === 'pending' ? 'pending' : 'cancelled'}">
                    ${sale.status === 'completed' ? 'Completada' : sale.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                  </span>
                </div>
              </div>
              
              <!-- Información del cliente -->
              <div class="section">
                <div class="section-title">Cliente</div>
                <div class="info-row">
                  <span class="info-label">Nombre:</span>
                  <span class="info-value">${sale.customerName || 'Cliente General'}</span>
                </div>
                ${sale.customerPhone ? `
                <div class="info-row">
                  <span class="info-label">Teléfono:</span>
                  <span class="info-value">${sale.customerPhone}</span>
                </div>
                ` : ''}
              </div>
              
              <div class="divider"></div>
              
              <!-- Productos -->
              <div class="section">
                <div class="section-title">Productos</div>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th style="text-align: center;">Cant.</th>
                      <th style="text-align: right;">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${sale.items?.map(item => `
                      <tr>
                        <td class="item-name">${item.nombre || item.name}</td>
                        <td class="item-qty">${item.cantidad || item.quantity}</td>
                        <td class="item-price">${formatCurrency((item.precio_unitario || item.price) * (item.cantidad || item.quantity))}</td>
                      </tr>
                    `).join('') || '<tr><td colspan="3" style="text-align: center; color: #999;">No hay productos</td></tr>'}
                  </tbody>
                </table>
              </div>
              
              <!-- Total -->
              <div class="total-section">
                <div class="total-row">
                  <span class="total-label">Total</span>
                  <span class="total-amount">${formatCurrency(sale.total)}</span>
                </div>
              </div>
              
              <!-- Footer -->
              <div class="footer">
                <div class="footer-text">¡Gracias por su compra!</div>
                <div class="footer-subtext">Powered by POSENT PRO</div>
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Componente para el estado de carga de las tarjetas
  const StatCardSkeleton = () => (
    <Card sx={{ height: '100%', p: 2 }}>
      <Skeleton variant="rectangular" width={40} height={40} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" />
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Skeleton variant="text" width="30%" height={40} />
        <Skeleton variant="text" width="20%" />
      </Box>
    </Card>
  );

  // Componente para el estado de carga de la tabla
  const TableRowSkeleton = () => (
    <TableRow>
      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
        <Skeleton variant="text" width={80} />
      </TableCell>
      <TableCell>
        <Box>
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={40} />
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: { xs: 120, sm: 200 }
        }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </Box>
        </Box>
      </TableCell>
      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
        <Skeleton variant="text" width={80} />
      </TableCell>
      <TableCell>
        <Skeleton variant="rectangular" width={90} height={28} sx={{ borderRadius: 1 }} />
      </TableCell>
      <TableCell align="center">
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </TableCell>
    </TableRow>
  );

  // Manejar el código detectado por el escáner
  const handleCodeDetected = (code) => {
    setScannerOpen(false);
    setSearchTerm(code);
    // Opcional: podrías mostrar un mensaje o buscar la venta/cliente automáticamente
  };

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
            Gestión de Ventas
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
            Administra y monitorea tus ventas en tiempo real
          </Typography>
        </Box>

        {/* Botones de acción */}
        <Box sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          maxWidth: '600px',
          mx: 'auto'
        }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => startTransition(() => navigate('/quick-sale'))}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              height: 48,
              borderRadius: 2
            }}
          >
            Nueva Venta
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<RefreshIcon />}
            onClick={() => fetchSales()}
            sx={{
              height: 48,
              borderRadius: 2
            }}
          >
            Actualizar
          </Button>
        </Box>

        {/* Tarjetas de estadísticas mejoradas */}
        <Grid
          container
          spacing={2}
          sx={{
            mb: 4,
            justifyContent: 'center',
            maxWidth: '100%',
            mx: 'auto'
          }}
        >
          <Grid item xs={6} sm={6} md={3}>
            <Card
              component={motion.div}
              whileHover={{ y: -5 }}
              sx={{
                p: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: theme => theme.palette.primary.main,
                color: 'white',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    opacity: 0.7,
                    fontSize: { xs: '0.625rem', sm: '0.75rem' },
                    display: 'block',
                    mb: 1
                  }}
                >
                  Total Ventas
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    mb: 1
                  }}
                >
                  {loading ? <Skeleton width={60} height={40} /> : stats.totalSales}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  +15% vs mes anterior
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: -20,
                  transform: 'translateY(-50%)',
                  opacity: 0.1
                }}
              >
                <ReceiptIcon sx={{ fontSize: { xs: 60, sm: 80 } }} />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card
              component={motion.div}
              whileHover={{ y: -5 }}
              sx={{
                p: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: theme => theme.palette.success.main,
                color: 'white',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    opacity: 0.7,
                    fontSize: { xs: '0.625rem', sm: '0.75rem' },
                    display: 'block',
                    mb: 1
                  }}
                >
                  Ingresos
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    mb: 1
                  }}
                >
                  {loading ? <Skeleton width={120} height={40} /> : formatCurrency(stats.totalAmount)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  +8% vs mes anterior
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: -20,
                  transform: 'translateY(-50%)',
                  opacity: 0.1
                }}
              >
                <MoneyIcon sx={{ fontSize: { xs: 60, sm: 80 } }} />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card
              component={motion.div}
              whileHover={{ y: -5 }}
              sx={{
                p: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: theme => theme.palette.info.main,
                color: 'white',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    opacity: 0.7,
                    fontSize: { xs: '0.625rem', sm: '0.75rem' },
                    display: 'block',
                    mb: 1
                  }}
                >
                  Ticket Promedio
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    mb: 1
                  }}
                >
                  {loading ? <Skeleton width={100} height={40} /> : formatCurrency(stats.averageTicket)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  -3% vs mes anterior
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: -20,
                  transform: 'translateY(-50%)',
                  opacity: 0.1
                }}
              >
                <TrendingUpIcon sx={{ fontSize: { xs: 60, sm: 80 } }} />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card
              component={motion.div}
              whileHover={{ y: -5 }}
              sx={{
                p: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: theme => theme.palette.warning.main,
                color: 'white',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    opacity: 0.7,
                    fontSize: { xs: '0.625rem', sm: '0.75rem' },
                    display: 'block',
                    mb: 1
                  }}
                >
                  Clientes Atendidos
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    mb: 1
                  }}
                >
                  {loading ? <Skeleton width={60} height={40} /> : stats.uniqueCustomers}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  +12% vs mes anterior
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: -20,
                  transform: 'translateY(-50%)',
                  opacity: 0.1
                }}
              >
                <PeopleIcon sx={{ fontSize: { xs: 60, sm: 80 } }} />
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros y botón para escanear */}
        <Box sx={{
          mb: 3,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            flex: 1
          }}>
            <TextField
              placeholder="Buscar por cliente o ID"
              size="small"
              disabled={loading}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flexGrow: 1,
                maxWidth: 300,
                backgroundColor: theme => theme.palette.background.paper,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
            />
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              size="small"
              disabled={loading}
              sx={{
                minWidth: 120,
                backgroundColor: theme => theme.palette.background.paper,
                borderRadius: 1.5
              }}
            >
              <MenuItem value="today">Hoy</MenuItem>
              <MenuItem value="yesterday">Ayer</MenuItem>
              <MenuItem value="last7days">Últimos 7 días</MenuItem>
              <MenuItem value="last30days">Últimos 30 días</MenuItem>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              disabled={loading}
              sx={{
                minWidth: 150,
                backgroundColor: theme => theme.palette.background.paper,
                borderRadius: 1.5
              }}
            >
              <MenuItem value="all">Todos los estados</MenuItem>
              <MenuItem value="completed">Completado</MenuItem>
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="cancelled">Cancelado</MenuItem>
            </Select>
            {/* Botón de escanear */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<CameraAltIcon />}
                endIcon={<QrCodeIcon />}
                onClick={() => setScannerOpen(true)}
                sx={{
                  minWidth: 120,
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: 'secondary.main',
                  color: 'white',
                  boxShadow: 2,
                  mb: 0.5
                }}
              >
                Escanear
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0, fontSize: '0.75rem' }}>
                Cámara o lector
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={() => setIsListOpen(true)}
            startIcon={<ViewIcon />}
            sx={{
              height: 40,
              bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              '&:hover': {
                bgcolor: theme => alpha(theme.palette.primary.main, 0.2)
              }
            }}
          >
            Ver Lista Completa
          </Button>
        </Box>

        {/* Resumen de últimas ventas */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Últimas Ventas
          </Typography>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              maxHeight: 400,
              overflow: 'auto'
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton width={100} /></TableCell>
                      <TableCell><Skeleton width={150} /></TableCell>
                      <TableCell align="right"><Skeleton width={80} /></TableCell>
                      <TableCell><Skeleton width={90} /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredSales.slice(0, 5).map((sale) => (
                    <TableRow key={sale.id} hover>
                      <TableCell>{format(sale.date, 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{sale.customerName || 'Cliente no registrado'}</TableCell>
                      <TableCell align="right">{formatCurrency(sale.total)}</TableCell>
                      <TableCell>
                        <Chip
                          label={sale.status}
                          size="small"
                          color={getStatusColor(sale.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Modal de lista completa */}
      <SalesList
        open={isListOpen}
        onClose={() => setIsListOpen(false)}
        sales={filteredSales}
        loading={loading}
        handlePrint={handlePrint}
        onViewDetails={(sale) => {
          setSelectedSale(sale);
          setDetailsOpen(true);
        }}
        getStatusColor={getStatusColor}
      />

      {/* Modal de detalles existente */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 2, sm: 4 },
            width: '100%',
            maxWidth: { xs: 'calc(100% - 32px)', sm: 600 }
          }
        }}
      >
        {selectedSale && (
          <>
            <DialogTitle sx={{
              borderBottom: 1,
              borderColor: 'divider',
              p: { xs: 2, sm: 3 }
            }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                Detalles de la Venta
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {selectedSale.id}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), p: 2, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {selectedSale.customerName?.charAt(0) || <Person />}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {selectedSale.customerName || 'Cliente no registrado'}
                        </Typography>
                        {selectedSale.customerPhone && (
                          <Typography variant="body2" color="text.secondary">
                            {selectedSale.customerPhone}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Fecha y Hora
                  </Typography>
                  <Typography variant="body1">
                    {format(selectedSale.date, 'dd/MM/yyyy HH:mm', { locale: es })}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Estado
                  </Typography>
                  <Chip
                    label={selectedSale.status}
                    color={getStatusColor(selectedSale.status)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Productos
                  </Typography>
                  <List sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider'
                  }}>
                    {selectedSale.items?.map((item, index) => (
                      <ListItem
                        key={index}
                        divider={index < selectedSale.items.length - 1}
                        sx={{ py: 1 }}
                      >
                        <ListItemText
                          primary={item.name}
                          secondary={`Cantidad: ${item.quantity}`}
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="subtitle2" color="text.primary">
                            {formatCurrency(item.price * item.quantity)}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                    p: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    borderRadius: 2
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Total
                    </Typography>
                    <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                      {formatCurrency(selectedSale.total)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{
              p: { xs: 2, sm: 3 },
              borderTop: 1,
              borderColor: 'divider'
            }}>
              <Button
                onClick={() => handlePrint(selectedSale)}
                startIcon={<PrintIcon />}
                variant="outlined"
                fullWidth={isMobile}
                sx={{ mr: { xs: 0, sm: 1 } }}
              >
                Imprimir
              </Button>
              <Button
                onClick={() => setDetailsOpen(false)}
                variant="contained"
                fullWidth={isMobile}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleCodeDetected}
      />

      {error && (
        <Alert
          severity="error"
          sx={{
            mt: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default Sales;