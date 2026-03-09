import React, { useState, useEffect, useCallback, startTransition } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  useTheme, alpha, IconButton, Tooltip, LinearProgress,
  CircularProgress, Divider, Stack, useMediaQuery, Collapse, Avatar,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, AttachMoney, ShoppingCart, People,
  Inventory, Speed, Refresh, Add, Inventory as InventoryIcon,
  PersonAdd, Receipt, Settings, Analytics, Store,
  FiberManualRecord, Whatshot, EmojiEvents, ExpandMore, ExpandLess,
  Dashboard as DashboardIcon, NotificationsActive, TrendingFlat,
} from '@mui/icons-material';
import { CloudUpload, DeleteForever, PlayCircle } from '@mui/icons-material';
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
import PromoCarousel from './PromoCarousel';
import { enqueueSnackbar } from 'notistack';

// ─── StatCard ──────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, trend, subtitle, gradient, theme }) => {
  const g = gradient || ['#667eea', '#764ba2'];
  return (
    <Card sx={{
      height: '100%',
      backgroundColor: 'background.paper',
      color: theme.palette.text.primary,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 4,
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        borderColor: alpha(g[0], 0.3),
      },
    }}>
      <CardContent sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.2, fontSize: '0.65rem', display: 'block', mb: 0.5 }}>{title}</Typography>
            <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.75rem' }, lineHeight: 1.1 }}>{value}</Typography>
            {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5, display: 'block', fontWeight: 500 }}>{subtitle}</Typography>}
          </Box>
          <Box sx={{
            width: 48, height: 48, borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(g[0], 0.1)} 0%, ${alpha(g[1], 0.1)} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: g[0], flexShrink: 0, ml: 1,
            border: `1px solid ${alpha(g[0], 0.1)}`
          }}>
            <Icon sx={{ fontSize: 26 }} />
          </Box>
        </Box>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', px: 1, py: 0.3, borderRadius: 1.5,
              bgcolor: trend >= 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
              color: trend >= 0 ? '#10b981' : '#ef4444'
            }}>
              {trend > 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : trend < 0 ? <TrendingDown sx={{ fontSize: 14 }} /> : <TrendingFlat sx={{ fontSize: 14 }} />}
              <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.75rem', ml: 0.5 }}>{Math.abs(trend)}%</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.75rem' }}>vs mes anterior</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ─── QuickAction ──────────────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label, color, onClick, variant = 'filled' }) => {
  const isFilled = variant === 'filled';
  return (
    <Button onClick={onClick} fullWidth sx={{
      display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' },
      gap: { xs: 0.5, sm: 1.5 }, p: { xs: '12px 8px', sm: '12px 20px' },
      borderRadius: '50px', textTransform: 'none', fontWeight: 800,
      fontSize: { xs: '0.65rem', sm: '0.85rem' }, lineHeight: 1.2,
      minHeight: { xs: 64, sm: 52 },
      color: isFilled ? 'white' : 'text.primary',
      background: isFilled ? `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.85)} 100%)` : 'transparent',
      border: isFilled ? 'none' : `1px solid ${alpha(color, 0.3)}`,
      boxShadow: isFilled ? `0 4px 12px ${alpha(color, 0.25)}` : 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-2px) scale(1.02)',
        boxShadow: isFilled ? `0 8px 25px ${alpha(color, 0.35)}` : `0 4px 12px ${alpha(color, 0.15)}`,
        background: isFilled ? `linear-gradient(135deg, ${color} 0.2, ${alpha(color, 0.95)} 100%)` : alpha(color, 0.05),
        borderColor: isFilled ? 'none' : color,
      },
    }}>
      <Box sx={{
        width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 }, borderRadius: '50%',
        bgcolor: isFilled ? 'rgba(255,255,255,0.2)' : alpha(color, 0.1),
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon sx={{ fontSize: { xs: 18, sm: 20 }, flexShrink: 0 }} />
      </Box>
      <span style={{ textAlign: 'center' }}>{label}</span>
    </Button>
  );
};

// ─── Main DashboardPro ────────────────────────────────────────────────────────
const DashboardPro = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const { userRole } = usePermissions();
  const { productos, loadProductos } = useProductos();

  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    dailySales: 0, monthlyRevenue: 0, averageTicket: 0, customersServed: 0,
    inventoryValue: 0, salesGrowth: 0, topProducts: [], cajaActual: 0,
    stockBajo: 0, metaDia: 50000, promedioHora: 0, ultimasVentas: [],
  });

  // ── Carrusel — lista de medios admin  ────────────────────────────────────────
  const [adminMediaList, setAdminMediaList] = useState([]); // [{ url, type, kind, title }]
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [actionsExpanded, setActionsExpanded] = useState(!isMobile);

  // Filtros
  const [productFilter, setProductFilter] = useState('ventas');
  const [productOrder, setProductOrder] = useState('desc');
  const [performancePeriod, setPerformancePeriod] = useState('mes');
  const [connectionFilter, setConnectionFilter] = useState('todos');
  const [apiFilter, setApiFilter] = useState('todos');

  // Métricas de rendimiento por período
  const [performanceData, setPerformanceData] = useState({ revenue: 0, growth: 0, target: 500000 });
  const [performanceLoading, setPerformanceLoading] = useState(false);

  // ─── fetch ────────────────────────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      await loadProductos();
      let salesData = null, productsData = null, customersData = null;
      try { const r = await api.get('/sales/stats?periodo=dia'); salesData = r.data; } catch { }
      try { const r = await api.get('/products/stats'); productsData = r.data; } catch { }
      try { const r = await api.get('/customers/stats'); customersData = r.data; } catch { }

      // ── Cargar lista de medios del admin ─────────────────────────────────────
      try {
        const r = await api.get('/settings/business');
        if (r.data.success && r.data.data) {
          const d = r.data.data;
          // Soportar formato antiguo (un solo medio) y nuevo (promoMediaList)
          if (Array.isArray(d.promoMediaList) && d.promoMediaList.length > 0) {
            setAdminMediaList(d.promoMediaList.map((m, i) => ({ ...m, _index: i })));
          } else if (d.promoMediaUrl) {
            setAdminMediaList([{ url: d.promoMediaUrl, type: d.promoMediaType || 'image', kind: 'promo', title: '', _index: 0 }]);
          }
        }
      } catch { }

      const productsList = productos || [];
      let totalInventoryValue = 0;
      productsList.forEach(p => { totalInventoryValue += (parseFloat(p.precio) || 0) * ((parseInt(p.stock) || 0) > 0 ? parseInt(p.stock) : 1); });

      const dailySales = salesData?.success ? (salesData?.data?.resumen?.monto_total || 0) : 0;
      const averageTicket = salesData?.success ? (salesData?.data?.resumen?.promedio_venta || 0) : 0;
      const stockBajo = productsList.filter(p => (parseInt(p.stock) || 0) < 10).length;

      const newData = {
        dailySales, averageTicket: parseFloat(averageTicket.toFixed(2)),
        monthlyRevenue: totalInventoryValue,
        customersServed: customersData?.data?.todayCount || customersData?.data?.total_clientes || 0,
        inventoryValue: productsData?.data?.total_value || totalInventoryValue,
        salesGrowth: 0, topProducts: salesData?.data?.top_productos || [],
        cajaActual: dailySales, stockBajo, metaDia: 50000,
        promedioHora: dailySales / 8,
        ultimasVentas: (salesData?.data?.recentSales || []).slice(0, 5),
      };
      setDashboardData(newData);
      setHasData(productsList.length > 0 || newData.dailySales > 0 || newData.inventoryValue > 0);
      setLoading(false);
    } catch (e) {
      console.error('Error dashboard:', e);
      setHasData(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, []);
  useEffect(() => { if (productos.length > 0) fetchDashboardData(); }, [productos.length]);

  // ─── Cargar métricas de rendimiento según período ─────────────────────────────
  const fetchPerformanceData = useCallback(async (periodo) => {
    setPerformanceLoading(true);
    try {
      const r = await api.get(`/sales/stats?periodo=${periodo}`);
      if (r.data?.success) {
        const prev = await api.get(`/sales/stats?periodo=${periodo === 'dia' ? 'dia' : periodo === 'mes' ? 'mes' : 'mes'}`);
        const revenue = r.data.data?.resumen?.monto_total || 0;
        const prevRevenue = prev.data.data?.resumen?.monto_total || 0;
        const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue * 100) : 0;
        setPerformanceData({ revenue, growth: parseFloat(growth.toFixed(1)), target: 500000 });
      }
    } catch { }
    finally { setPerformanceLoading(false); }
  }, []);

  useEffect(() => { fetchPerformanceData(performancePeriod); }, [performancePeriod]);

  // ─── Guardar lista en settings ────────────────────────────────────────────────
  const saveMediaList = useCallback(async (list) => {
    const r = await api.get('/settings/business');
    const current = r.data.data || {};
    await api.post('/settings/business', {
      ...current,
      promoMediaList: list.map(({ _index, ...rest }) => rest), // no guardar _index
      promoMediaUrl: '',   // limpiar formato antiguo
      promoMediaType: '',
    });
  }, []);

  // ─── Upload — soporta múltiples archivos ──────────────────────────────────────
  const handleMediaUpload = useCallback(async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) { enqueueSnackbar(`"${file.name}" es demasiado grande (máx 50MB)`, { variant: 'warning' }); continue; }
    }
    setUploadingMedia(true);
    enqueueSnackbar(`Subiendo ${files.length} archivo(s)...`, { variant: 'info' });
    try {
      const newItems = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/upload/file', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (response.data.success) {
          newItems.push({ url: response.data.data.url, type: file.type.startsWith('video') ? 'video' : 'image', kind: 'promo', title: file.name.replace(/\.[^.]+$/, '') });
        }
      }
      if (newItems.length) {
        const newList = [...adminMediaList.map(({ _index, ...rest }) => rest), ...newItems];
        await saveMediaList(newList);
        setAdminMediaList(newList.map((m, i) => ({ ...m, _index: i })));
        enqueueSnackbar(`${newItems.length} archivo(s) agregado(s) al carrusel ✨`, { variant: 'success' });
      }
    } catch { enqueueSnackbar('Error al subir archivo(s)', { variant: 'error' }); }
    finally { setUploadingMedia(false); event.target.value = ''; }
  }, [adminMediaList, saveMediaList]);

  // ─── Remove media por índice ──────────────────────────────────────────────────
  const handleRemoveMedia = useCallback(async (adminIndex) => {
    if (!window.confirm('¿Eliminar este elemento del carrusel?')) return;
    try {
      const newList = adminMediaList.filter(m => m._index !== adminIndex).map(({ _index, ...rest }) => rest);
      await saveMediaList(newList);
      setAdminMediaList(newList.map((m, i) => ({ ...m, _index: i })));
      enqueueSnackbar('Elemento eliminado', { variant: 'info' });
    } catch { enqueueSnackbar('Error al eliminar', { variant: 'error' }); }
  }, [adminMediaList, saveMediaList]);

  const handleNavigate = (path) => startTransition(() => navigate(path));

  // ─── Fotos de productos para el carrusel ──────────────────────────────────────
  const productImages = React.useMemo(() =>
    (productos || [])
      .filter(p => p.imagen && typeof p.imagen === 'string' && p.imagen.startsWith('http'))
      .map(p => ({ url: p.imagen, nombre: p.nombre || p.name || 'Producto' }))
      .slice(0, 12),
    [productos]
  );

  const progressPct = Math.min(((dashboardData.dailySales / dashboardData.metaDia) * 100 || 0), 100);

  // ─── Productos filtrados Top ───────────────────────────────────────────────────
  const filteredProducts = React.useMemo(() => {
    const productsList = productos || [];
    const isDesc = productOrder === 'desc';
    let sorted = [];
    if (productFilter === 'ventas') {
      sorted = dashboardData.topProducts?.length > 0
        ? dashboardData.topProducts.map(tp => ({ _id: tp._id, nombre: tp.nombre, precio: (tp.total_vendido / tp.cantidad_vendida) || 0, stock: tp.cantidad_vendida, isSaleData: true }))
        : [...productsList].sort((a, b) => (parseInt(b.stock) || 0) - (parseInt(a.stock) || 0));
    } else {
      sorted = [...productsList].sort((a, b) => {
        if (productFilter === 'valor') {
          return isDesc ? ((parseFloat(b.precio) || 0) * (parseInt(b.stock) || 0)) - ((parseFloat(a.precio) || 0) * (parseInt(a.stock) || 0))
            : ((parseFloat(a.precio) || 0) * (parseInt(a.stock) || 0)) - ((parseFloat(b.precio) || 0) * (parseInt(b.stock) || 0));
        }
        const va = productFilter === 'precio' ? parseFloat(a.precio) || 0 : parseInt(a.stock) || 0;
        const vb = productFilter === 'precio' ? parseFloat(b.precio) || 0 : parseInt(b.stock) || 0;
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
  }, [productos, productFilter, productOrder, dashboardData.topProducts]);

  // ─── Quick actions config ─────────────────────────────────────────────────────
  const quickActions = [
    { icon: Add, label: 'Nueva Venta', color: '#10b981', path: '/quick-sale', variant: 'filled' },
    { icon: InventoryIcon, label: 'Agregar Producto', color: '#3b82f6', path: '/products', variant: 'filled' },
    { icon: Analytics, label: 'Ver Reportes', color: '#8b5cf6', path: '/analytics', variant: 'filled' },
    { icon: PersonAdd, label: 'Nuevo Cliente', color: '#f59e0b', path: '/customers', variant: 'filled' },
    { icon: Receipt, label: 'Ver Ventas', color: theme.palette.primary.main, path: '/sales', variant: 'outlined' },
    { icon: Settings, label: 'Reparaciones', color: '#6b7280', path: '/reparaciones', variant: 'outlined' },
    { icon: AttachMoney, label: 'Gasto Rápido', color: '#ef4444', onClick: () => setOpenExpenseModal(true), variant: 'outlined' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 2 }}>
        <CircularProgress size={38} thickness={4} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Cargando dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.mode === 'dark' ? '#0f1117' : '#f5f6fa' }}>

      {/* Toast sin datos */}
      {!hasData && (
        <Box sx={{
          position: 'fixed', top: { xs: 12, md: 80 }, right: { xs: 12, md: 16 },
          bgcolor: 'background.paper', py: 1.5, px: 2.5, borderRadius: 2.5,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 1400,
          borderLeft: '4px solid', borderColor: 'warning.main',
          display: 'flex', alignItems: 'center', gap: 1.5, maxWidth: 340,
        }}>
          <NotificationsActive sx={{ color: 'warning.main', fontSize: 20 }} />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.75rem' }}>Sin datos aún</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>Agrega productos para ver métricas</Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, maxWidth: 1600, mx: 'auto' }}>

        {/* ══════════════════════════════════════════
            HEADER
        ══════════════════════════════════════════ */}
        <Box sx={{
          display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5, mb: 3, p: { xs: 2, md: 3 },
          bgcolor: 'background.paper', borderRadius: 4,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: { xs: 44, md: 54 }, height: { xs: 44, md: 54 },
              borderRadius: 3.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
            }}>
              <DashboardIcon sx={{ color: 'white', fontSize: { xs: 24, md: 28 } }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', md: '1.75rem' }, letterSpacing: '-0.02em', color: 'text.primary' }}>Dashboard</Typography>
                <Tooltip title="Actualizar">
                  <IconButton onClick={fetchDashboardData} size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06), color: 'primary.main', border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, '&:hover': { bgcolor: 'primary.main', color: 'white', transform: 'rotate(180deg)' } }}>
                    <Refresh sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem', mt: 0.5 }}>
                {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es }).replace(/^\w/, (c) => c.toUpperCase())}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1 }}>{user?.nombre || user?.displayName || 'Usuario'}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{userRole?.toUpperCase() || 'USER'}</Typography>
            </Box>
            <Avatar sx={{
              width: 44, height: 44,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              fontWeight: 800,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}>
              {(user?.nombre || user?.displayName || 'U')[0].toUpperCase()}
            </Avatar>
          </Box>
        </Box>

        {/* ══════════════════════════════════════════
            ACCIONES RÁPIDAS
        ══════════════════════════════════════════ */}
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, border: `1px solid ${theme.palette.divider}`, mb: 2, overflow: 'hidden' }}>
          <Box onClick={() => isMobile && setActionsExpanded(p => !p)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: { xs: '10px 14px', md: '11px 20px' }, cursor: isMobile ? 'pointer' : 'default', borderBottom: actionsExpanded ? `1px solid ${theme.palette.divider}` : 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.5, transform: 'scale(1.3)' } } }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem' }}>Acciones Rápidas</Typography>
            </Box>
            {isMobile && <IconButton size="small">{actionsExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}</IconButton>}
          </Box>
          <Collapse in={actionsExpanded || !isMobile}>
            <Box sx={{ p: { xs: 1.5, md: 2 } }}>
              <Grid container spacing={{ xs: 1, md: 1.5 }}>
                {quickActions.map((a, i) => (
                  <Grid item xs={6} sm={4} md={12 / 7} key={i}>
                    <QuickAction {...a} onClick={a.onClick || (() => handleNavigate(a.path))} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        </Box>

        {/* ══════════════════════════════════════════
            KPIs PRINCIPALES
        ══════════════════════════════════════════ */}
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 2 }}>
          {[
            { title: 'Ventas del Día', value: `$${dashboardData.dailySales.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`, icon: AttachMoney, trend: dashboardData.salesGrowth, subtitle: 'Ingresos de hoy', gradient: ['#10b981', '#059669'] },
            { title: 'Ticket Promedio', value: `$${dashboardData.averageTicket.toFixed(2)}`, icon: Receipt, trend: 5.2, subtitle: 'Por transacción', gradient: ['#3b82f6', '#2563eb'] },
            { title: 'Clientes Atendidos', value: dashboardData.customersServed, icon: People, trend: 8.3, subtitle: 'Hoy', gradient: ['#f59e0b', '#d97706'] },
            { title: 'Valor Inventario', value: `$${dashboardData.inventoryValue.toLocaleString()}`, icon: Inventory, trend: -2.1, subtitle: 'Stock actual', gradient: ['#ef4444', '#dc2626'] },
          ].map((c, i) => (
            <Grid item xs={6} md={3} key={i}><StatCard {...c} theme={theme} /></Grid>
          ))}
        </Grid>

        {/* ══════════════════════════════════════════
            IMPULSO + CARRUSEL MULTIMEDIA
        ══════════════════════════════════════════ */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch' }}>

          {/* ── Impulso y Metas ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1, border: `1px solid ${theme.palette.divider}`, p: { xs: 1.5, md: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.8 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: 2, background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: 13 }}>📊</Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.88rem' }}>Impulso y Metas</Typography>
              </Box>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}><CashRegisterWidget /></Grid>
                {[
                  { icon: ShoppingCart, color: 'success', label: 'Caja Actual', value: `$${dashboardData.cajaActual.toLocaleString()}` },
                  { icon: InventoryIcon, color: 'warning', label: 'Stock Bajo', value: dashboardData.stockBajo },
                  { icon: Analytics, color: 'info', label: 'Meta del Día', value: `$${dashboardData.metaDia.toLocaleString()}`, chip: `${progressPct.toFixed(1)}%` },
                  { icon: Speed, color: 'secondary', label: 'Promedio/Hora', value: `$${dashboardData.promedioHora.toFixed(0)}` },
                ].map((m, i) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Box sx={{ textAlign: 'center', p: { xs: 1, md: 1.4 }, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.2s', '&:hover': { borderColor: theme.palette[m.color]?.main, boxShadow: `0 2px 10px ${alpha(theme.palette[m.color]?.main || '#000', 0.15)}` } }}>
                      <Box sx={{ display: 'inline-flex', p: 0.7, borderRadius: 1.5, bgcolor: alpha(theme.palette[m.color]?.main || '#000', 0.1), mb: 0.5 }}>
                        <m.icon sx={{ fontSize: 19, color: `${m.color}.main` }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.2 }}>{m.value}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem', display: 'block' }}>{m.label}</Typography>
                      {m.chip && <Chip label={m.chip} size="small" sx={{ mt: 0.3, height: 15, fontSize: '0.56rem', bgcolor: alpha(theme.palette.info.main, 0.12), color: 'info.main' }} />}
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Progress bar */}
              <Box sx={{ p: 1.4, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.7 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.7rem' }}>Progreso del Día</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem' }}>${dashboardData.dailySales.toLocaleString()} / ${dashboardData.metaDia.toLocaleString()}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={progressPct} sx={{ height: 7, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.1), '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#667eea,#764ba2)', borderRadius: 4, transition: 'width 0.8s ease' } }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.4 }}>
                  <Typography variant="caption" sx={{ color: progressPct >= 100 ? 'success.main' : 'text.secondary', fontWeight: 700, fontSize: '0.68rem' }}>{progressPct.toFixed(1)}% completado</Typography>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* ── Carrusel Multimedia ── */}
          <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 210 } }}>
            <Card sx={{
              width: '100%',
              height: { xs: 220, md: '100%' },
              minHeight: { md: 280 },
              borderRadius: 3, boxShadow: 1, overflow: 'hidden',
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: (adminMediaList.length > 0 || productImages.length > 0) ? 'none' : `1px solid ${theme.palette.divider}`,
              background: (adminMediaList.length > 0 || productImages.length > 0) ? '#111' : theme.palette.background.paper,
              transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 4 },
            }}>
              <PromoCarousel
                adminMedia={adminMediaList}
                productImages={productImages}
                userRole={userRole}
                onUpload={handleMediaUpload}
                onRemove={handleRemoveMedia}
                isUploading={uploadingMedia}
              />
            </Card>
          </Box>
        </Box>

        {/* ══════════════════════════════════════════
            MÉTRICAS SECUNDARIAS
        ══════════════════════════════════════════ */}
        <Grid container spacing={{ xs: 1.5, md: 2 }}>

          {/* TOP PRODUCTOS */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 } }}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <EmojiEvents sx={{ fontSize: 19, color: '#f59e0b' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8rem' }}>TOP PRODUCTOS</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                  {[{ key: 'ventas', label: '🔥 Ventas', c: 'error' }, { key: 'precio', label: '$ Precio', c: 'primary' }, { key: 'stock', label: '📦 Stock', c: 'success' }, { key: 'valor', label: '💎 Valor', c: 'info' }].map(f => (
                    <Chip key={f.key} label={f.label} size="small" clickable onClick={() => { setProductFilter(f.key); setProductOrder('desc'); }}
                      color={productFilter === f.key ? f.c : 'default'} variant={productFilter === f.key ? 'filled' : 'outlined'}
                      sx={{ fontSize: '0.58rem', height: 20, fontWeight: 700 }} />
                  ))}
                </Box>
                <Stack spacing={1}>
                  {filteredProducts.length > 0 ? filteredProducts.map((p, i) => (
                    <Box key={i} sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${alpha(theme.palette.divider, 0.5)}`, transition: 'all 0.2s', '&:hover': { transform: 'translateX(3px)', borderColor: alpha(theme.palette.primary.main, 0.3) } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', flex: 1, mr: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</Typography>
                        <Chip label={productFilter === 'stock' || productFilter === 'ventas' ? `${p.value} uds` : `$${p.value.toLocaleString('es-DO')}`}
                          size="small" color={productFilter === 'ventas' ? 'error' : productFilter === 'stock' ? (p.value < 10 ? 'error' : 'success') : 'primary'}
                          sx={{ fontWeight: 800, height: 19, fontSize: '0.65rem', flexShrink: 0 }} />
                      </Box>
                      <LinearProgress variant="determinate" value={Math.min((p.value / (productFilter === 'stock' ? 100 : productFilter === 'ventas' ? 50 : productFilter === 'valor' ? 50000 : 20000)) * 100, 100)}
                        sx={{ height: 4, borderRadius: 4, bgcolor: alpha(theme.palette.divider, 0.1), '& .MuiLinearProgress-bar': { background: productFilter === 'ventas' ? 'linear-gradient(90deg,#ef4444,#dc2626)' : `linear-gradient(90deg,${theme.palette.primary.main},${theme.palette.primary.dark})`, borderRadius: 4 } }} />
                    </Box>
                  )) : (
                    <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                      <InventoryIcon sx={{ fontSize: 26, mb: 1, opacity: 0.4 }} />
                      <Typography variant="caption" display="block">Sin productos</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* RENDIMIENTO */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 } }}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Whatshot sx={{ fontSize: 19, color: '#ef4444' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8rem' }}>Rendimiento</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                  {['dia', 'mes', 'anio'].map(p => (
                    <Chip key={p} label={p === 'dia' ? 'Hoy' : p === 'mes' ? 'Mes' : 'Año'} size="small" clickable
                      onClick={() => setPerformancePeriod(p)}
                      color={performancePeriod === p ? 'primary' : 'default'}
                      sx={{ fontSize: '0.6rem', height: 20, fontWeight: 700 }} />
                  ))}
                </Box>
                {performanceLoading ? (
                  <Box sx={{ my: 1 }}><CircularProgress size={20} /></Box>
                ) : (
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main', mb: 0.3, fontSize: '1.25rem' }}>
                    ${performanceData.revenue.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  {performancePeriod === 'dia' ? 'Ventas de hoy' : performancePeriod === 'mes' ? 'Ventas del mes' : 'Ventas del año'}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>Crecimiento</Typography>
                  <Chip
                    label={`${performanceData.growth >= 0 ? '+' : ''}${performanceData.growth}%`}
                    size="small"
                    color={performanceData.growth >= 0 ? 'success' : 'error'}
                    icon={performanceData.growth >= 0 ? <TrendingUp sx={{ fontSize: 11 }} /> : <TrendingDown sx={{ fontSize: 11 }} />}
                    sx={{ fontSize: '0.62rem', height: 19, fontWeight: 800 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>Objetivo</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>${performanceData.target.toLocaleString()}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min((performanceData.revenue / performanceData.target) * 100, 100)} sx={{ height: 5, borderRadius: 4, bgcolor: alpha(theme.palette.success.main, 0.1), '& .MuiLinearProgress-bar': { bgcolor: 'success.main', borderRadius: 4 } }} />
              </CardContent>
            </Card>
          </Grid>

          {/* RESUMEN DE INVENTARIO */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 } }}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <InventoryIcon sx={{ fontSize: 19, color: '#f59e0b' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8rem' }}>Inventario</Typography>
                </Box>

                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>Valor Total del Inventario</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.1rem' }}>
                      ${dashboardData.inventoryValue.toLocaleString('es-DO')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Total Productos</Typography>
                    <Chip label={`${productos.length} SKUs`} size="small" color="default" sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'error.main' }}>Stock Bajo (&lt; 10 uds)</Typography>
                    <Chip label={dashboardData.stockBajo} size="small" color={dashboardData.stockBajo > 0 ? "error" : "success"} sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }} />
                  </Box>
                </Stack>
                <Button fullWidth size="small" variant="text" onClick={() => navigate('/products')} sx={{ mt: 2, fontSize: '0.7rem', fontWeight: 700, textTransform: 'none' }}>
                  Ir a Productos
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* ÚLTIMAS VENTAS */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 } }}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Receipt sx={{ fontSize: 19, color: '#10b981' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8rem' }}>Últimas Ventas</Typography>
                </Box>

                <Stack spacing={1.2}>
                  {dashboardData.ultimasVentas && dashboardData.ultimasVentas.length > 0 ? (
                    dashboardData.ultimasVentas.map((venta, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}>
                        <Box sx={{ overflow: 'hidden' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', display: 'block' }}>
                            {venta.cliente_nombre || 'Cliente General'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {venta.estado === 'Completada' ? '✅' : '⏳'} {format(new Date(venta.fecha || new Date()), 'HH:mm')} hrs
                          </Typography>
                        </Box>
                        <Chip label={`$${(venta.total || 0).toLocaleString('es-DO')}`} size="small" color="success" variant="outlined" sx={{ fontSize: '0.65rem', height: 20, fontWeight: 800 }} />
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                      <ShoppingCart sx={{ fontSize: 26, mb: 1, opacity: 0.4 }} />
                      <Typography variant="caption" display="block">No hay ventas hoy</Typography>
                    </Box>
                  )}
                </Stack>

                <Button fullWidth size="small" variant="text" onClick={() => navigate('/sales')} sx={{ mt: 1, fontSize: '0.7rem', fontWeight: 700, textTransform: 'none' }}>
                  Ver Historial
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Box>

      <QuickExpenseModal open={openExpenseModal} onClose={() => setOpenExpenseModal(false)} onSuccess={() => { }} />
    </Box>
  );
};

export default DashboardPro;
