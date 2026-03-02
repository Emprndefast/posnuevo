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
  Divider,
  Stack,
  useMediaQuery,
  Collapse,
  Badge,
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
  Info as InfoIcon,
  ExpandMore,
  ExpandLess,
  Dashboard as DashboardIcon,
  NotificationsActive,
  TrendingFlat,
  KeyboardArrowRight,
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
import { CloudUpload, DeleteForever, PlayCircle } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';

// ─── Stat Card Component ─────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, trend, subtitle, gradient, theme }) => {
  const g = gradient || ['#667eea', '#764ba2'];
  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${g[0]} 0%, ${g[1]} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'default',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 16px 40px ${alpha(g[0], 0.45)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -40, right: -40,
          width: 160, height: 160,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -30, left: -30,
          width: 100, height: 100,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.5rem' }, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.75, fontSize: '0.7rem', mt: 0.3, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', flexShrink: 0, ml: 1 }}>
            <Icon sx={{ fontSize: 24 }} />
          </Box>
        </Box>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            {trend > 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : trend < 0 ? <TrendingDown sx={{ fontSize: 14 }} /> : <TrendingFlat sx={{ fontSize: 14 }} />}
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', opacity: 0.9 }}>
              {Math.abs(trend)}% vs mes anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Quick Action Button ──────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label, color, onClick, variant = 'filled', theme }) => {
  const isFilled = variant === 'filled';
  return (
    <Button
      onClick={onClick}
      fullWidth
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: { xs: 'center', sm: 'flex-start' },
        gap: { xs: 0.5, sm: 1 },
        p: { xs: '10px 8px', sm: '10px 14px' },
        borderRadius: 2.5,
        textTransform: 'none',
        fontWeight: 700,
        fontSize: { xs: '0.7rem', sm: '0.82rem' },
        lineHeight: 1.2,
        minHeight: { xs: 60, sm: 48 },
        color: isFilled ? 'white' : color,
        background: isFilled ? `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)` : 'transparent',
        border: isFilled ? 'none' : `2px solid ${color}`,
        boxShadow: isFilled ? `0 4px 14px ${alpha(color, 0.35)}` : 'none',
        transition: 'all 0.22s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isFilled ? `0 8px 20px ${alpha(color, 0.45)}` : `0 4px 14px ${alpha(color, 0.25)}`,
          background: isFilled ? `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.9)} 100%)` : alpha(color, 0.08),
        },
      }}
    >
      <Icon sx={{ fontSize: { xs: 20, sm: 18 }, flexShrink: 0 }} />
      <span style={{ textAlign: 'center' }}>{label}</span>
    </Button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardPro = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { userRole } = usePermissions();
  const { productos, loadProductos } = useProductos();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    dailySales: 0, monthlyRevenue: 0, averageTicket: 0,
    customersServed: 0, inventoryValue: 0, salesGrowth: 0,
    topProducts: [], recentSales: [], cajaActual: 0,
    stockBajo: 0, metaDia: 50000, promedioHora: 0,
    topClientes: [], ultimasVentas: [],
  });
  const [hasData, setHasData] = useState(false);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [promoMedia, setPromoMedia] = useState({ url: '', type: 'image' });
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [actionsExpanded, setActionsExpanded] = useState(!isMobile);

  // Filters
  const [productFilter, setProductFilter] = useState('ventas');
  const [productOrder, setProductOrder] = useState('desc');
  const [performancePeriod, setPerformancePeriod] = useState('mes');
  const [connectionFilter, setConnectionFilter] = useState('todos');
  const [apiFilter, setApiFilter] = useState('todos');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await loadProductos();
      let salesData = null, productsData = null, customersData = null;

      try { const r = await api.get('/sales/stats?periodo=dia'); salesData = r.data; } catch { }
      try { const r = await api.get('/products/stats'); productsData = r.data; } catch { }
      try { const r = await api.get('/customers/stats'); customersData = r.data; } catch { }

      try {
        const r = await api.get('/settings/business');
        if (r.data.success && r.data.data) {
          setPromoMedia({ url: r.data.data.promoMediaUrl || '', type: r.data.data.promoMediaType || 'image' });
        }
      } catch { }

      const productsList = productos || [];
      let totalInventoryValue = 0;
      productsList.forEach(p => {
        const price = parseFloat(p.precio) || 0;
        const stock = parseInt(p.stock) || 0;
        totalInventoryValue += price * (stock > 0 ? stock : 1);
      });

      const dailySales = salesData?.success ? (salesData?.data?.resumen?.monto_total || 0) : 0;
      const averageTicket = salesData?.success ? (salesData?.data?.resumen?.promedio_venta || 0) : 0;
      const stockBajo = productsList.filter(p => (parseInt(p.stock) || 0) < 10).length;
      const metaDia = 50000;

      const newData = {
        dailySales, monthlyRevenue: totalInventoryValue, averageTicket: parseFloat(averageTicket.toFixed(2)),
        customersServed: customersData?.data?.todayCount || customersData?.data?.total_clientes || 0,
        inventoryValue: productsData?.data?.total_value || totalInventoryValue,
        salesGrowth: 0, topProducts: salesData?.data?.top_productos || [],
        recentSales: [], cajaActual: dailySales, stockBajo, metaDia,
        promedioHora: dailySales / 8, topClientes: [],
        ultimasVentas: (salesData?.data?.recentSales || []).slice(0, 5),
      };

      setDashboardData(newData);
      setHasData(productos.length > 0 || newData.dailySales > 0 || newData.inventoryValue > 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setHasData(false);
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);
  useEffect(() => { if (productos.length > 0) fetchDashboardData(); }, [productos.length]);

  const handleMediaUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { enqueueSnackbar('Archivo demasiado grande (máximo 50MB)', { variant: 'error' }); return; }
    setUploadingMedia(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      enqueueSnackbar('Subiendo contenido...', { variant: 'info' });
      const response = await api.post('/upload/file', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.success) {
        const url = response.data.data.url;
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const currentSettingsRes = await api.get('/settings/business');
        const currentSettings = currentSettingsRes.data.data || {};
        await api.post('/settings/business', { ...currentSettings, promoMediaUrl: url, promoMediaType: type });
        setPromoMedia({ url, type });
        enqueueSnackbar('Contenido actualizado ✨', { variant: 'success' });
      }
    } catch { enqueueSnackbar('Error al subir el archivo.', { variant: 'error' }); }
    finally { setUploadingMedia(false); }
  };

  const handleRemoveMedia = async () => {
    if (!window.confirm('¿Deseas eliminar el contenido multimedia?')) return;
    try {
      const r = await api.get('/settings/business');
      await api.post('/settings/business', { ...(r.data.data || {}), promoMediaUrl: '', promoMediaType: 'image' });
      setPromoMedia({ url: '', type: 'image' });
      enqueueSnackbar('Contenido eliminado', { variant: 'info' });
    } catch { enqueueSnackbar('Error al eliminar', { variant: 'error' }); }
  };

  const handleNavigate = (path) => startTransition(() => navigate(path));

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: 2 }}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Cargando dashboard...</Typography>
      </Box>
    );
  }

  const progressPct = Math.min(((dashboardData.dailySales / dashboardData.metaDia) * 100 || 0), 100);

  // ─── Quick Actions config ────────────────────────────────────────────────────
  const quickActions = [
    { icon: Add, label: 'Nueva Venta', color: '#10b981', path: '/quick-sale', variant: 'filled' },
    { icon: InventoryIcon, label: 'Agregar Producto', color: '#3b82f6', path: '/products', variant: 'filled' },
    { icon: Analytics, label: 'Ver Reportes', color: '#8b5cf6', path: '/analytics', variant: 'filled' },
    { icon: PersonAdd, label: 'Nuevo Cliente', color: '#f59e0b', path: '/customers', variant: 'filled' },
    { icon: Receipt, label: 'Ver Ventas', color: theme.palette.primary.main, path: '/sales', variant: 'outlined' },
    { icon: Settings, label: 'Reparaciones', color: '#6b7280', path: '/reparaciones', variant: 'outlined' },
    { icon: AttachMoney, label: 'Gasto Rápido', color: '#ef4444', onClick: () => setOpenExpenseModal(true), variant: 'outlined' },
  ];

  // ─── Filtered Products ───────────────────────────────────────────────────────
  const getFilteredProducts = () => {
    const productsList = productos || [];
    const isDesc = productOrder === 'desc';
    let sorted = [];
    if (productFilter === 'ventas') {
      if (dashboardData.topProducts?.length > 0) {
        sorted = dashboardData.topProducts.map(tp => ({ _id: tp._id, nombre: tp.nombre, precio: tp.total_vendido / tp.cantidad_vendida || 0, stock: tp.cantidad_vendida, isSaleData: true }));
      } else {
        sorted = [...productsList].sort((a, b) => (parseInt(b.stock) || 0) - (parseInt(a.stock) || 0));
      }
    } else {
      sorted = [...productsList].sort((a, b) => {
        const key = productFilter === 'precio' ? 'precio' : productFilter === 'stock' ? 'stock' : null;
        if (productFilter === 'valor') {
          const va = (parseFloat(a.precio) || 0) * (parseInt(a.stock) || 0);
          const vb = (parseFloat(b.precio) || 0) * (parseInt(b.stock) || 0);
          return isDesc ? vb - va : va - vb;
        }
        const va = key === 'precio' ? parseFloat(a[key]) || 0 : parseInt(a[key]) || 0;
        const vb = key === 'precio' ? parseFloat(b[key]) || 0 : parseInt(b[key]) || 0;
        return isDesc ? vb - va : va - vb;
      });
    }
    return sorted.slice(0, 4).map(p => {
      const stock = parseInt(p.stock) || 0, precio = parseFloat(p.precio) || 0;
      let valueToShow = precio, label = 'Precio';
      if (productFilter === 'stock' || (productFilter === 'ventas' && p.isSaleData)) { valueToShow = stock; label = productFilter === 'ventas' ? 'Vendidos' : 'Stock'; }
      else if (productFilter === 'valor') { valueToShow = precio * stock; label = 'Valor'; }
      return { id: p._id || p.id, name: p.nombre || p.name || 'Sin nombre', value: valueToShow, label, precio, stock: p.stock || 0 };
    });
  };

  const filteredProducts = getFilteredProducts();

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.mode === 'dark' ? '#0f1117' : '#f5f6fa', position: 'relative' }}>

      {/* ── No-data toast ── */}
      {!hasData && (
        <Box sx={{
          position: 'fixed', top: { xs: 12, md: 80 }, right: { xs: 12, md: 16 },
          bgcolor: 'background.paper', py: 1.5, px: 2.5, borderRadius: 2.5,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 1400,
          borderLeft: '4px solid', borderColor: 'warning.main',
          display: 'flex', alignItems: 'center', gap: 1.5, maxWidth: 340,
          animation: 'slideIn 0.3s ease-out',
          '@keyframes slideIn': { from: { opacity: 0, transform: 'translateX(100%)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        }}>
          <NotificationsActive sx={{ color: 'warning.main', fontSize: 20 }} />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.75rem' }}>Sin datos aún</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>Agrega productos para ver métricas</Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, maxWidth: 1600, mx: 'auto' }}>

        {/* ════════════════════════════════════════
            SECCIÓN 1 — HEADER
        ════════════════════════════════════════ */}
        <Box sx={{
          display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5, mb: 2.5,
          p: { xs: 1.5, md: 2 },
          bgcolor: 'background.paper',
          borderRadius: 3, boxShadow: 1,
          border: `1px solid ${theme.palette.divider}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: { xs: 36, md: 44 }, height: { xs: 36, md: 44 }, borderRadius: 2.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <DashboardIcon sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', md: '1.4rem' }, lineHeight: 1 }}>
                  Dashboard
                </Typography>
                <Tooltip title="Actualizar datos">
                  <IconButton onClick={fetchDashboardData} size="small" sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 28, height: 28,
                    transition: 'all 0.3s', '&:hover': { bgcolor: 'primary.main', color: 'white', transform: 'rotate(180deg)' },
                  }}>
                    <Refresh sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={user?.nombre || user?.displayName || 'Usuario'}
              size="small"
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', fontWeight: 700, fontSize: '0.7rem' }}
            />
            <Chip
              label={userRole?.toUpperCase() || 'USER'}
              size="small"
              color="primary"
              sx={{ fontWeight: 800, fontSize: '0.68rem' }}
            />
          </Box>
        </Box>

        {/* ════════════════════════════════════════
            SECCIÓN 2 — ACCIONES RÁPIDAS
        ════════════════════════════════════════ */}
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, border: `1px solid ${theme.palette.divider}`, mb: 2.5, overflow: 'hidden' }}>
          {/* Header colapsable en móvil */}
          <Box
            onClick={() => isMobile && setActionsExpanded(p => !p)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              p: { xs: '10px 14px', md: '12px 20px' },
              cursor: isMobile ? 'pointer' : 'default',
              borderBottom: actionsExpanded ? `1px solid ${theme.palette.divider}` : 'none',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.5, transform: 'scale(1.3)' } } }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>Acciones Rápidas</Typography>
            </Box>
            {isMobile && (
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                {actionsExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </IconButton>
            )}
          </Box>
          <Collapse in={actionsExpanded || !isMobile}>
            <Box sx={{ p: { xs: 1.5, md: 2 } }}>
              <Grid container spacing={{ xs: 1, md: 1.5 }}>
                {quickActions.map((action, i) => (
                  <Grid item xs={6} sm={4} md={12 / 7} key={i}>
                    <QuickAction
                      icon={action.icon}
                      label={action.label}
                      color={action.color}
                      variant={action.variant}
                      theme={theme}
                      onClick={action.onClick || (() => handleNavigate(action.path))}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        </Box>

        {/* ════════════════════════════════════════
            SECCIÓN 3 — KPIs PRINCIPALES
        ════════════════════════════════════════ */}
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 2.5 }}>
          {[
            { title: 'Ventas del Día', value: `$${dashboardData.dailySales.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`, icon: AttachMoney, trend: dashboardData.salesGrowth, subtitle: 'Ingresos de hoy', gradient: ['#10b981', '#059669'] },
            { title: 'Ticket Promedio', value: `$${dashboardData.averageTicket.toFixed(2)}`, icon: Receipt, trend: 5.2, subtitle: 'Por transacción', gradient: ['#3b82f6', '#2563eb'] },
            { title: 'Clientes Atendidos', value: dashboardData.customersServed, icon: People, trend: 8.3, subtitle: 'Hoy', gradient: ['#f59e0b', '#d97706'] },
            { title: 'Valor Inventario', value: `$${dashboardData.inventoryValue.toLocaleString()}`, icon: Inventory, trend: -2.1, subtitle: 'Stock actual', gradient: ['#ef4444', '#dc2626'] },
          ].map((card, i) => (
            <Grid item xs={6} sm={6} md={3} key={i}>
              <StatCard {...card} theme={theme} />
            </Grid>
          ))}
        </Grid>

        {/* ════════════════════════════════════════
            SECCIÓN 4 — IMPULSO + MULTIMEDIA
        ════════════════════════════════════════ */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch' }}>

          {/* ── Impulso y Metas ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1, border: `1px solid ${theme.palette.divider}`, p: { xs: 1.5, md: 2 } }}>
              {/* Título */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: 2, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: 14 }}>📊</Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.9rem' }}>Impulso y Metas</Typography>
              </Box>

              {/* Métricas en grid */}
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <CashRegisterWidget />
                </Grid>
                {[
                  { icon: ShoppingCart, color: 'success', label: 'Caja Actual', value: `$${dashboardData.cajaActual.toLocaleString()}`, bg: alpha(theme.palette.success.main, 0.1) },
                  { icon: InventoryIcon, color: 'warning', label: 'Stock Bajo', value: dashboardData.stockBajo, bg: alpha(theme.palette.warning.main, 0.1) },
                  { icon: Analytics, color: 'info', label: 'Meta del Día', value: `$${dashboardData.metaDia.toLocaleString()}`, bg: alpha(theme.palette.info.main, 0.1), chip: `${progressPct.toFixed(1)}%` },
                  { icon: Speed, color: 'secondary', label: 'Promedio/Hora', value: `$${dashboardData.promedioHora.toFixed(0)}`, bg: alpha(theme.palette.secondary.main, 0.1) },
                ].map((m, i) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Box sx={{
                      textAlign: 'center', p: { xs: 1, md: 1.5 }, borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.2s', '&:hover': { borderColor: theme.palette[m.color].main, boxShadow: `0 2px 10px ${alpha(theme.palette[m.color].main, 0.15)}` }
                    }}>
                      <Box sx={{ display: 'inline-flex', p: 0.8, borderRadius: 1.5, bgcolor: m.bg, mb: 0.5 }}>
                        <m.icon sx={{ fontSize: 20, color: `${m.color}.main` }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>{m.value}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block' }}>{m.label}</Typography>
                      {m.chip && <Chip label={m.chip} size="small" sx={{ mt: 0.3, height: 16, fontSize: '0.58rem', bgcolor: alpha(theme.palette.info.main, 0.12), color: 'info.main' }} />}
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Progress bar */}
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem' }}>Progreso del Día</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem' }}>
                    ${dashboardData.dailySales.toLocaleString()} / ${dashboardData.metaDia.toLocaleString()}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressPct}
                  sx={{
                    height: 8, borderRadius: 4,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: 4, transition: 'width 0.8s ease' }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: progressPct >= 100 ? 'success.main' : 'text.secondary', fontWeight: 700, fontSize: '0.7rem' }}>
                    {progressPct.toFixed(1)}% completado
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* ── Card Multimedia compacta ── */}
          <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 200 }, minHeight: { xs: 200, md: 'auto' } }}>
            <Card sx={{
              width: '100%', height: { xs: 200, md: '100%' },
              minHeight: { md: 260 },
              borderRadius: 3, boxShadow: 1, overflow: 'hidden', position: 'relative',
              border: promoMedia.url ? 'none' : `1px solid ${theme.palette.divider}`,
              background: promoMedia.url ? '#111' : theme.palette.background.paper,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s', '&:hover': { boxShadow: 4 },
            }}>
              {promoMedia.url ? (
                <>
                  {/* Media */}
                  {promoMedia.type === 'video' ? (
                    <video src={promoMedia.url} autoPlay loop muted playsInline
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img src={promoMedia.url} alt="Promo"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}

                  {/* Badge LIVE */}
                  <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 5, bgcolor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', px: 1, py: 0.3, borderRadius: 1, border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Box sx={{ width: 6, height: 6, bgcolor: '#10b981', borderRadius: '50%', animation: 'livePulse 1.5s infinite', '@keyframes livePulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.4, transform: 'scale(1.4)' } } }} />
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 800, letterSpacing: 0.8, fontSize: '0.58rem' }}>PROMOCIÓN LIVE</Typography>
                  </Box>

                  {/* Admin Buttons */}
                  {(userRole === 'admin' || userRole === 'owner') && (
                    <Box sx={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 0.5, zIndex: 10 }}>
                      <Tooltip title="Cambiar"><IconButton size="small" component="label" sx={{ bgcolor: 'rgba(255,255,255,0.85)', width: 26, height: 26, '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' } }}>
                        <CloudUpload sx={{ fontSize: 13 }} color="primary" />
                        <input type="file" hidden accept="image/*,video/*" onChange={handleMediaUpload} />
                      </IconButton></Tooltip>
                      <Tooltip title="Eliminar"><IconButton size="small" onClick={handleRemoveMedia} sx={{ bgcolor: 'rgba(255,255,255,0.85)', width: 26, height: 26, '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' } }}>
                        <DeleteForever sx={{ fontSize: 13 }} color="error" />
                      </IconButton></Tooltip>
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    {uploadingMedia ? <CircularProgress size={22} /> : <PlayCircle sx={{ fontSize: 26, color: 'primary.main' }} />}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, fontSize: '0.8rem' }}>Promo / Anuncio</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', mb: 1.5, display: 'block' }}>Sube tu video o imagen</Typography>
                  {(userRole === 'admin' || userRole === 'owner') && (
                    <Button variant="contained" size="small" component="label"
                      startIcon={<CloudUpload sx={{ fontSize: 13 }} />}
                      sx={{ borderRadius: 2, px: 1.5, fontSize: '0.68rem', py: 0.5 }}>
                      Subir
                      <input type="file" hidden accept="image/*,video/*" onChange={handleMediaUpload} />
                    </Button>
                  )}
                </Box>
              )}
            </Card>
          </Box>
        </Box>

        {/* ════════════════════════════════════════
            SECCIÓN 5 — MÉTRICAS SECUNDARIAS (4 cards)
        ════════════════════════════════════════ */}
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 2.5 }}>

          {/* ── Card: TOP PRODUCTOS ── */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 } }}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <EmojiEvents sx={{ fontSize: 20, color: '#f59e0b' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', flex: 1 }}>TOP PRODUCTOS</Typography>
                </Box>

                {/* Filter chips */}
                <Box sx={{ display: 'flex', gap: 0.6, mb: 1.5, flexWrap: 'wrap' }}>
                  {[
                    { key: 'ventas', label: '🔥 Ventas', color: 'error' },
                    { key: 'precio', label: '$ Precio', color: 'primary' },
                    { key: 'stock', label: '📦 Stock', color: 'success' },
                    { key: 'valor', label: '💎 Valor', color: 'info' },
                  ].map(f => (
                    <Chip key={f.key} label={f.label} size="small" clickable
                      onClick={() => { setProductFilter(f.key); if (f.key !== 'ventas') setProductOrder('desc'); }}
                      color={productFilter === f.key ? f.color : 'default'}
                      variant={productFilter === f.key ? 'filled' : 'outlined'}
                      sx={{ fontSize: '0.6rem', height: 20, fontWeight: 700 }}
                    />
                  ))}
                </Box>

                {/* Products list */}
                <Stack spacing={1}>
                  {filteredProducts.length > 0 ? filteredProducts.map((p, i) => (
                    <Box key={i} sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${alpha(theme.palette.divider, 0.5)}`, transition: 'all 0.2s', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderColor: alpha(theme.palette.primary.main, 0.2), transform: 'translateX(3px)' } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem', flex: 1, mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</Typography>
                        <Chip
                          label={productFilter === 'stock' || productFilter === 'ventas' ? `${p.value} uds` : `$${p.value.toLocaleString('es-DO')}`}
                          size="small"
                          color={productFilter === 'ventas' ? 'error' : productFilter === 'stock' ? (p.value < 10 ? 'error' : 'success') : 'primary'}
                          sx={{ fontWeight: 800, height: 20, fontSize: '0.68rem', flexShrink: 0 }}
                        />
                      </Box>
                      <LinearProgress variant="determinate"
                        value={Math.min((p.value / (productFilter === 'stock' ? 100 : productFilter === 'ventas' ? 50 : productFilter === 'valor' ? 50000 : 20000)) * 100, 100)}
                        sx={{ height: 4, borderRadius: 4, bgcolor: alpha(theme.palette.divider, 0.1), '& .MuiLinearProgress-bar': { background: productFilter === 'ventas' ? `linear-gradient(90deg, #ef4444, #dc2626)` : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, borderRadius: 4 } }}
                      />
                    </Box>
                  )) : (
                    <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                      <InventoryIcon sx={{ fontSize: 28, mb: 1, opacity: 0.4 }} />
                      <Typography variant="caption" display="block">Sin productos</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* ── Card: RENDIMIENTO ── */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 } }}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Whatshot sx={{ fontSize: 20, color: '#ef4444' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', flex: 1 }}>Rendimiento</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.6, mb: 2 }}>
                  {['dia', 'mes', 'anio'].map(p => (
                    <Chip key={p} label={p === 'dia' ? 'Día' : p === 'mes' ? 'Mes' : 'Año'} size="small" clickable
                      onClick={() => setPerformancePeriod(p)}
                      color={performancePeriod === p ? 'primary' : 'default'}
                      sx={{ fontSize: '0.62rem', height: 20, fontWeight: 700 }}
                    />
                  ))}
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main', mb: 0.3, fontSize: '1.3rem' }}>
                    ${dashboardData.monthlyRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>Ventas del mes</Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>Crecimiento</Typography>
                  <Chip label={`+${dashboardData.salesGrowth}%`} size="small" color="success"
                    icon={<TrendingUp sx={{ fontSize: 12 }} />}
                    sx={{ fontSize: '0.65rem', height: 20, fontWeight: 800 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>Objetivo del mes</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem' }}>$500,000</Typography>
                </Box>
                <LinearProgress variant="determinate"
                  value={Math.min((dashboardData.monthlyRevenue / 500000) * 100, 100)}
                  sx={{ mt: 1.5, height: 6, borderRadius: 4, bgcolor: alpha(theme.palette.success.main, 0.1), '& .MuiLinearProgress-bar': { bgcolor: 'success.main', borderRadius: 4 } }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* ── Card: CONEXIONES ── */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 } }}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Speed sx={{ fontSize: 20, color: '#3b82f6' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', flex: 1 }}>Conexiones</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.6, mb: 2 }}>
                  {['todos', 'activos'].map(f => (
                    <Chip key={f} label={f === 'todos' ? 'Todos' : 'Activos'} size="small" clickable
                      onClick={() => setConnectionFilter(f)}
                      color={connectionFilter === f ? 'primary' : 'default'}
                      sx={{ fontSize: '0.62rem', height: 20, fontWeight: 700 }}
                    />
                  ))}
                </Box>
                <Stack spacing={1.2}>
                  {[
                    { name: 'API MongoDB', status: 'Activa', color: 'success' },
                    { name: 'WhatsApp API', status: 'Activa', color: 'success' },
                    { name: 'Whabot Pro', status: 'Conectado', color: 'success' },
                  ].map((conn, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <FiberManualRecord sx={{ fontSize: 8, color: `${conn.color}.main` }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.72rem' }}>{conn.name}</Typography>
                      </Box>
                      <Chip label={conn.status} size="small" color={conn.color} sx={{ fontSize: '0.6rem', height: 18, fontWeight: 700 }} />
                    </Box>
                  ))}
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.62rem', mt: 1.5, display: 'block' }}>
                  Última verificación: hace 2 min
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* ── Card: APIs EXTERNAS ── */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 } }}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Store sx={{ fontSize: 20, color: '#8b5cf6' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', flex: 1 }}>APIs Externas</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.6, mb: 2 }}>
                  {['activas', 'todos'].map(f => (
                    <Chip key={f} label={f === 'activas' ? 'Activas' : 'Todas'} size="small" clickable
                      onClick={() => setApiFilter(f)}
                      color={apiFilter === f ? 'primary' : 'default'}
                      sx={{ fontSize: '0.62rem', height: 20, fontWeight: 700 }}
                    />
                  ))}
                </Box>
                <Stack spacing={1.5}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Store sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Tiendas Conectadas</Typography>
                      </Box>
                      <Chip label="2 activas" size="small" color="success" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700 }} />
                    </Box>
                    <LinearProgress variant="determinate" value={100} sx={{ height: 4, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), '& .MuiLinearProgress-bar': { bgcolor: 'success.main' } }} />
                  </Box>
                  <Divider sx={{ opacity: 0.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 600 }}>Sincronizaciones hoy</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'info.main', fontSize: '0.72rem' }}>12</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 600 }}>Base de Datos</Typography>
                    <Chip label={`${productos.length} SKUs`} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Box>

      {/* ── Expense Modal ── */}
      <QuickExpenseModal
        open={openExpenseModal}
        onClose={() => setOpenExpenseModal(false)}
        onSuccess={() => { }}
      />
    </Box>
  );
};

export default DashboardPro;
