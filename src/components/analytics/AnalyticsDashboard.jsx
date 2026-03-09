/**
 * AnalyticsDashboard — Panel de análisis avanzado para POSENT PRO
 *
 * Características:
 * ✅ Filtros globales (hoy, ayer, 7 días, 30 días, semana, mes, mes pasado, año, personalizado)
 * ✅ Métricas que se actualizan en tiempo real al cambiar filtros
 * ✅ Gráficos interactivos (ventas, productos, métodos de pago)
 * ✅ Vista por hora / día / semana / mes
 * ✅ Exportación CSV, Excel y PDF respetando filtros activos
 * ✅ Skeleton loading, animaciones suaves, skeleton en métricas
 * ✅ Comparación vs. período anterior con tendencias
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, CircularProgress, Alert, Tooltip, Fade,
  Avatar, Chip, useTheme, alpha, useMediaQuery, Stack, Divider,
  Select, MenuItem, FormControl, InputLabel, Menu, ListItemIcon,
  ListItemText, LinearProgress, Skeleton, ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Category as CategoryIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  ReceiptLong as ReceiptIcon,
  Inventory as InventoryIcon,
  Group as GroupIcon,
  Assignment as ReportIcon,
  AccountBalanceWallet as WalletIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import {
  Line, Bar, Doughnut,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip as ChartTooltip, Legend, Filler,
} from 'chart.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { saveAs } from 'file-saver';
import { useAuth } from '../../context/AuthContextMongo';
import useAnalytics, { TIME_RANGES } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../utils/formatters';
import { exportAnalyticsPDF, exportAnalyticsExcel, exportSalesExcel } from '../../utils/exportService';
import DailySummaryConfigCard from '../settings/DailySummaryConfigCard';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, ChartTooltip, Legend, Filler
);

// ─── Colores de la paleta ─────────────────────────────────────────────────────
const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316'];

// ─── Componente: MetricCard ───────────────────────────────────────────────────
const MetricCard = ({ title, value, subtitle, icon: Icon, trend, gradient, loading }) => {
  const theme = useTheme();
  const g = gradient || [theme.palette.primary.main, theme.palette.primary.dark];
  const trendColor = trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#94a3b8';

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
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        borderColor: alpha(g[0], 0.3)
      },
    }}>
      <CardContent sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 1.5, fontSize: '0.65rem' }}>
              {title}
            </Typography>
            {loading ? (
              <>
                <Skeleton variant="text" width="80%" height={40} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="40%" height={20} />
              </>
            ) : (
              <>
                <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 900, mt: 0.5, lineHeight: 1.2, fontSize: { xs: '1.4rem', md: '1.85rem' }, letterSpacing: '-0.025em' }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5, display: 'block', fontWeight: 600 }}>
                    {subtitle}
                  </Typography>
                )}
              </>
            )}
          </Box>
          <Box sx={{
            width: 52, height: 52, borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(g[0], 0.12)} 0%, ${alpha(g[1], 0.08)} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: g[0], flexShrink: 0, ml: 1,
            border: `1px solid ${alpha(g[0], 0.1)}`
          }}>
            <Icon sx={{ fontSize: 28 }} />
          </Box>
        </Box>
        {!loading && trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', px: 1, py: 0.4, borderRadius: 1.5,
              bgcolor: alpha(trendColor, 0.1),
              color: trendColor
            }}>
              {trend > 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> :
                trend < 0 ? <TrendingDownIcon sx={{ fontSize: 14 }} /> :
                  <TrendingFlatIcon sx={{ fontSize: 14 }} />}
              <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.75rem', ml: 0.5 }}>
                {trend > 0 ? '+' : ''}{trend?.toFixed(1)}%
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem' }}>
              vs. período anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Componente: GlobalFilterBar ─────────────────────────────────────────────
const GlobalFilterBar = ({
  timeRange, onTimeRangeChange,
  customStart, onCustomStartChange,
  customEnd, onCustomEndChange,
  rangeLabel, startDate, endDate,
  loading, onRefresh,
  onExport, exportLoading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const exportOptions = [
    {
      id: 'analyticsPDF',
      label: 'Reporte PDF',
      icon: <TimelineIcon fontSize="small" />,
      desc: 'KPIs + top productos · Para socios / prueba de ventas',
      color: 'error.main',
    },
    {
      id: 'analyticsExcel',
      label: 'Análisis Excel',
      icon: <ReceiptIcon fontSize="small" />,
      desc: 'Ventas por tiempo, productos, pagos · Para contabilidad',
      color: 'success.main',
    },
    {
      id: 'salesExcel',
      label: 'Ventas Detalladas Excel',
      icon: <ReceiptIcon fontSize="small" />,
      desc: 'Todas las ventas del período con cliente y método de pago',
      color: 'primary.main',
    },
    {
      id: 'inventory',
      label: 'Inventario CSV',
      icon: <InventoryIcon fontSize="small" />,
      desc: 'Estado actual del stock',
      color: 'warning.main',
    },
    {
      id: 'customers',
      label: 'Clientes CSV',
      icon: <GroupIcon fontSize="small" />,
      desc: 'Base de datos de clientes',
      color: 'info.main',
    },
  ];

  return (
    <Box sx={{
      display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
      p: { xs: 2, md: 2.5 }, bgcolor: 'background.paper',
      borderRadius: 4, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      mb: 4,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flex: 1 }}>
        {/* Selector de rango con estilo pill */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ fontWeight: 700 }}>Seleccionar Período</InputLabel>
          <Select
            value={timeRange}
            onChange={e => onTimeRangeChange(e.target.value)}
            label="Seleccionar Período"
            sx={{ borderRadius: 3, fontWeight: 700, bgcolor: alpha(theme.palette.action.hover, 0.4) }}
          >
            {TIME_RANGES.map(r => <MenuItem key={r.value} value={r.value} sx={{ fontWeight: 600 }}>{r.label}</MenuItem>)}
          </Select>
        </FormControl>

        {/* Fechas personalizadas */}
        {timeRange === 'custom' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              type="date" label="Desde" size="small"
              value={customStart} onChange={e => onCustomStartChange(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ width: 160, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <TextField
              type="date" label="Hasta" size="small"
              value={customEnd} onChange={e => onCustomEndChange(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ width: 160, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Box>
        )}

        {/* Label del período activo */}
        {timeRange !== 'custom' && startDate && endDate && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.8,
            borderRadius: '50px', bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}>
            <DateRangeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: 'primary.main' }}>
              {format(startDate, 'd MMM', { locale: es })} – {format(endDate, 'd MMM yyyy', { locale: es })}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Tooltip title="Actualizar datos">
          <IconButton onClick={onRefresh} disabled={loading} size="medium"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              '&:hover': { bgcolor: 'primary.main', color: 'white', transform: 'rotate(180deg)' }
            }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          size="medium"
          onClick={e => setExportAnchor(e.currentTarget)}
          disabled={exportLoading}
          sx={{
            fontWeight: 800,
            borderRadius: '50px',
            textTransform: 'none',
            px: 3,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
            '&:hover': { boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)' }
          }}
        >
          {exportLoading ? 'Exportando...' : 'Exportar Reporte'}
        </Button>
      </Box>

      {/* Menú de exportación */}
      <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}
        PaperProps={{ sx: { width: 300, mt: 1.5 } }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" fontWeight={700}>Exportar datos</Typography>
          <Typography variant="caption" color="text.secondary">
            Período: {rangeLabel}
          </Typography>
        </Box>
        {exportOptions.map(opt => (
          <MenuItem key={opt.id}
            onClick={() => { onExport(opt.id); setExportAnchor(null); }}
            sx={{ py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
            <ListItemIcon sx={{ color: 'primary.main' }}>{opt.icon}</ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={700}>{opt.label}</Typography>
              <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

// ─── Main AnalyticsDashboard ──────────────────────────────────────────────────
export const AnalyticsDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  const {
    timeRange, setTimeRange,
    customStart, setCustomStart,
    customEnd, setCustomEnd,
    groupBy, setGroupBy,
    rangeLabel, startDate, endDate,
    summary, charts, tables,
    loading, error,
    refresh, fetchExportData,
    getExportParams,
  } = useAnalytics(true);

  const [exportLoading, setExportLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // ── Gráfico: Ventas en el tiempo ────────────────────────────────────────────
  const salesChartData = useMemo(() => ({
    labels: charts.salesByTime.map(d => d.label),
    datasets: [{
      label: 'Ingresos',
      data: charts.salesByTime.map(d => d.revenue),
      borderColor: PALETTE[0],
      backgroundColor: alpha(PALETTE[0], 0.12),
      borderWidth: 2.5,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: PALETTE[0],
      pointRadius: 4,
      pointHoverRadius: 7,
    }],
  }), [charts.salesByTime]);

  const salesChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { color: theme.palette.text.primary, font: { weight: 600 } } },
      tooltip: {
        callbacks: {
          label: ctx => ` ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: { grid: { color: alpha(theme.palette.divider, 0.5) }, ticks: { color: theme.palette.text.secondary } },
      y: {
        beginAtZero: true,
        grid: { color: alpha(theme.palette.divider, 0.5) },
        ticks: { color: theme.palette.text.secondary, callback: v => formatCurrency(v) },
      },
    },
  }), [theme]);

  // ── Gráfico: Productos más vendidos ────────────────────────────────────────
  const productsChartData = useMemo(() => ({
    labels: tables.topProducts.slice(0, 8).map(p => p.name.length > 20 ? p.name.slice(0, 17) + '…' : p.name),
    datasets: [{
      label: 'Ingresos',
      data: tables.topProducts.slice(0, 8).map(p => p.revenue),
      backgroundColor: PALETTE,
      borderRadius: 6,
    }],
  }), [tables.topProducts]);

  // ── Gráfico: Métodos de pago ────────────────────────────────────────────────
  const paymentChartData = useMemo(() => ({
    labels: charts.revenueByPayment.map(p => p.method),
    datasets: [{
      data: charts.revenueByPayment.map(p => p.amount),
      backgroundColor: PALETTE,
      hoverOffset: 12,
      borderWidth: 0,
    }],
  }), [charts.revenueByPayment]);

  // ── Exportación profesional CSV ─────────────────────────────────────────────
  const exportToCSV = useCallback((rows, filename) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => {
        const val = row[h] ?? '';
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(',')),
    ].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }, []);

  // ─── Exportación profesional (PDF / Excel) ───────────────────────────────
  const handleExport = useCallback(async (type) => {
    try {
      setExportLoading(true);
      const raw = await fetchExportData(type === 'analyticsPDF' || type === 'analyticsExcel' ? 'analytics' : type === 'salesExcel' ? 'sales' : type);

      if (type === 'analyticsPDF') {
        // Combinar con datos del hook (ya tenemos charts/tables en memoria)
        await exportAnalyticsPDF({ summary, charts, tables, period: { startDate, endDate }, ...raw }, rangeLabel);
      } else if (type === 'analyticsExcel') {
        await exportAnalyticsExcel({ summary, charts, tables, saleDetails: raw?.saleDetails, period: { startDate, endDate } }, rangeLabel);
      } else if (type === 'salesExcel') {
        await exportSalesExcel(raw?.sales || raw, rangeLabel);
      }

      setNotification({ type: 'success', message: '✅ Archivo exportado correctamente' });
    } catch (err) {
      console.error('Export error:', err);
      setNotification({ type: 'error', message: 'Error al exportar: ' + err.message });
    } finally {
      setExportLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  }, [fetchExportData, rangeLabel, summary, charts, tables, startDate, endDate]);

  // ── Botones de GroupBy ────────────────────────────────────────────────────────
  const groupByOptions = useMemo(() => {
    if (['today', 'yesterday'].includes(timeRange)) return [{ v: 'hour', l: 'Por hora' }];
    if (['last7', 'week'].includes(timeRange)) return [{ v: 'day', l: 'Por día' }];
    if (['last30', 'month', 'lastMonth'].includes(timeRange)) return [
      { v: 'day', l: 'Por día' },
      { v: 'week', l: 'Por semana' },
    ];
    return [{ v: 'day', l: 'Por día' }, { v: 'week', l: 'Por semana' }, { v: 'month', l: 'Por mes' }];
  }, [timeRange]);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 42, height: 42, borderRadius: 2.5, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TimelineIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={800} lineHeight={1}>Panel de Análisis</Typography>
          <Typography variant="caption" color="text.secondary">
            {rangeLabel} · Actualizado {format(new Date(), 'HH:mm', { locale: es })}
          </Typography>
        </Box>
      </Box>

      {/* ── Notificación flotante ───────────────────────────────────────── */}
      {notification && (
        <Fade in>
          <Alert severity={notification.type} sx={{ mb: 2 }} onClose={() => setNotification(null)}>
            {notification.message}
          </Alert>
        </Fade>
      )}

      {/* ── Error global ────────────────────────────────────────────────── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={
          <Button color="inherit" size="small" onClick={refresh}>Reintentar</Button>
        }>
          {error}
        </Alert>
      )}

      {/* ── Barra de filtros globales ───────────────────────────────────── */}
      <GlobalFilterBar
        timeRange={timeRange} onTimeRangeChange={setTimeRange}
        customStart={customStart} onCustomStartChange={setCustomStart}
        customEnd={customEnd} onCustomEndChange={setCustomEnd}
        rangeLabel={rangeLabel} startDate={startDate} endDate={endDate}
        loading={loading} onRefresh={refresh}
        onExport={handleExport} exportLoading={exportLoading}
      />

      {/* ── Métricas principales ────────────────────────────────────────── */}
      <Grid container spacing={{ xs: 1.5, md: 2.5 }} sx={{ mb: 3 }}>
        {[
          {
            title: 'Facturación Total',
            value: formatCurrency(summary.totalRevenue),
            subtitle: `${summary.totalOrders} transacciones`,
            icon: MoneyIcon,
            trend: summary.revenueTrend,
            gradient: ['#6366f1', '#4f46e5'],
          },
          {
            title: 'Pedidos',
            value: summary.totalOrders,
            subtitle: `${summary.uniqueCustomers} clientes únicos`,
            icon: CartIcon,
            trend: summary.ordersTrend,
            gradient: ['#10b981', '#059669'],
          },
          {
            title: 'Ticket Promedio',
            value: formatCurrency(summary.avgTicket),
            subtitle: 'Por transacción',
            icon: ReceiptIcon,
            trend: summary.ticketTrend,
            gradient: ['#3b82f6', '#2563eb'],
          },
          {
            title: 'Productos Vendidos',
            value: summary.totalItems.toLocaleString(),
            subtitle: 'Unidades en el período',
            icon: InventoryIcon,
            trend: undefined,
            gradient: ['#f59e0b', '#d97706'],
          },
        ].map((card, i) => (
          <Grid item xs={6} md={3} key={i}>
            <MetricCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ── Gráfico principal: Ventas en el tiempo ──────────────────────── */}
      <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3, transition: 'all 0.3s', '&:hover': { boxShadow: 4 } }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>Ventas en el Tiempo</Typography>
              <Typography variant="caption" color="text.secondary">{rangeLabel}</Typography>
            </Box>
            {/* Botones de agrupación */}
            <ToggleButtonGroup
              value={groupBy}
              exclusive
              onChange={(_, v) => v && setGroupBy(v)}
              size="small"
            >
              {groupByOptions.map(opt => (
                <ToggleButton key={opt.v} value={opt.v}
                  sx={{ px: 2, py: 0.5, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none' }}>
                  {opt.l}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ height: { xs: 220, md: 300 }, position: 'relative' }}>
            {loading ? (
              <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2 }} />
            ) : charts.salesByTime.length > 0 ? (
              <Line data={salesChartData} options={salesChartOptions} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'text.disabled' }}>
                <Box textAlign="center">
                  <TimelineIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                  <Typography variant="body2">No hay ventas en este período</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ── Gráficos secundarios: Productos + Métodos de pago ──────────── */}
      <Grid container spacing={{ xs: 1.5, md: 2.5 }} sx={{ mb: 3 }}>
        {/* Productos más vendidos */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2, transition: 'all 0.3s', '&:hover': { boxShadow: 4 } }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" fontWeight={800} mb={2}>🏆 Productos Más Vendidos</Typography>
              {loading ? (
                <Stack spacing={1.5}>
                  {[...Array(5)].map((_, i) => <Skeleton key={i} height={36} sx={{ borderRadius: 1 }} />)}
                </Stack>
              ) : tables.topProducts.length > 0 ? (
                <Box sx={{ height: { xs: 200, md: 280 } }}>
                  <Bar
                    data={productsChartData}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      indexAxis: 'y',
                      plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: ctx => ` ${formatCurrency(ctx.parsed.x)}` } },
                      },
                      scales: {
                        x: {
                          ticks: { callback: v => formatCurrency(v), color: theme.palette.text.secondary },
                          grid: { color: alpha(theme.palette.divider, 0.5) },
                        },
                        y: {
                          ticks: { color: theme.palette.text.primary, font: { weight: 600 } },
                          grid: { display: false },
                        },
                      },
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
                  <InventoryIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                  <Typography variant="body2">Sin datos de productos</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Métodos de pago */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2, transition: 'all 0.3s', '&:hover': { boxShadow: 4 } }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" fontWeight={800} mb={2}>💳 Métodos de Pago</Typography>
              {loading ? (
                <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
              ) : charts.revenueByPayment.length > 0 ? (
                <>
                  <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                    <Doughnut
                      data={paymentChartData}
                      options={{
                        responsive: true, maintainAspectRatio: false, cutout: '65%',
                        plugins: {
                          legend: { position: 'bottom', labels: { color: theme.palette.text.primary, padding: 12, font: { weight: '600', size: 11 } } },
                          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}` } },
                        },
                      }}
                    />
                  </Box>
                  <Stack spacing={1} mt={2}>
                    {charts.revenueByPayment.map((item, i) => {
                      const total = charts.revenueByPayment.reduce((s, v) => s + v.amount, 0);
                      const pct = total > 0 ? (item.amount / total) * 100 : 0;
                      return (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PALETTE[i % PALETTE.length] }} />
                            <Typography variant="caption" fontWeight={600}>{item.method}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">{pct.toFixed(1)}%</Typography>
                            <Typography variant="caption" fontWeight={800}>{formatCurrency(item.amount)}</Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
                  <WalletIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                  <Typography variant="body2">Sin datos de pagos</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Tablas: Top Productos + Top Clientes + Categorías ──────────── */}
      <Grid container spacing={{ xs: 1.5, md: 2.5 }} sx={{ mb: 3 }}>

        {/* Table: Productos */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" fontWeight={800} mb={2}>📦 Top Productos (Tabla)</Typography>
              {loading ? (
                <Stack spacing={1}>{[...Array(5)].map((_, i) => <Skeleton key={i} height={44} sx={{ borderRadius: 1 }} />)}</Stack>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>PRODUCTO</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.72rem' }}>CANT.</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.72rem' }}>TOTAL</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tables.topProducts.slice(0, 8).map((p, i) => (
                        <TableRow key={i} sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }, transition: 'background 0.15s' }}>
                          <TableCell>
                            <Box sx={{
                              width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              bgcolor: i < 3 ? [PALETTE[3], '#C0C0C0', '#CD7F32'][i] : alpha(theme.palette.action.hover, 1),
                              color: i < 3 ? 'white' : 'text.secondary',
                              fontWeight: 800, fontSize: '0.72rem',
                            }}>{i + 1}</Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={`${p.quantity} uds`} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2" fontWeight={800} color="primary.main">{formatCurrency(p.revenue)}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      {tables.topProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>
                            No hay datos para este período
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Table: Clientes */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" fontWeight={800} mb={2}>👥 Top Clientes</Typography>
              {loading ? (
                <Stack spacing={1}>{[...Array(5)].map((_, i) => <Skeleton key={i} height={44} sx={{ borderRadius: 1 }} />)}</Stack>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>CLIENTE</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.72rem' }}>COMPRAS</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.72rem' }}>TOTAL</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tables.topCustomers.slice(0, 8).map((c, i) => (
                        <TableRow key={i} sx={{ '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.04) }, transition: 'background 0.15s' }}>
                          <TableCell>
                            <Box sx={{
                              width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              bgcolor: i < 3 ? [PALETTE[3], '#C0C0C0', '#CD7F32'][i] : alpha(theme.palette.action.hover, 1),
                              color: i < 3 ? 'white' : 'text.secondary', fontWeight: 800, fontSize: '0.72rem',
                            }}>{i + 1}</Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: alpha(PALETTE[i % PALETTE.length], 0.8), fontWeight: 700 }}>
                                {(c.name || 'C')[0].toUpperCase()}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={c.orders} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2" fontWeight={800} color="success.main">{formatCurrency(c.total)}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      {tables.topCustomers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>
                            No hay datos para este período
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Ventas por categoría */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" fontWeight={800} mb={2}>🗂️ Ventas por Categoría</Typography>
              {loading ? (
                <Stack spacing={2}>{[...Array(4)].map((_, i) => <Skeleton key={i} height={40} sx={{ borderRadius: 1 }} />)}</Stack>
              ) : charts.salesByCategory.length > 0 ? (
                <Grid container spacing={2}>
                  {charts.salesByCategory.map((item, i) => {
                    const max = charts.salesByCategory[0]?.amount || 1;
                    const pct = (item.amount / max) * 100;
                    return (
                      <Grid item xs={12} sm={6} key={i}>
                        <Box sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.2s', '&:hover': { borderColor: PALETTE[i % PALETTE.length], boxShadow: `0 2px 12px ${alpha(PALETTE[i % PALETTE.length], 0.15)}` } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: PALETTE[i % PALETTE.length] }} />
                              <Typography variant="body2" fontWeight={700}>{item.category}</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={800} color="primary.main">{formatCurrency(item.amount)}</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={pct}
                            sx={{ height: 6, borderRadius: 3, bgcolor: alpha(PALETTE[i % PALETTE.length], 0.1), '& .MuiLinearProgress-bar': { bgcolor: PALETTE[i % PALETTE.length], borderRadius: 3 } }} />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                            {pct.toFixed(1)}% del total
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5, color: 'text.disabled' }}>
                  <CategoryIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                  <Typography variant="body2">No hay datos de categorías registrados</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Resumen automático + Config ─────────────────────────────────── */}
      <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
        <Grid item xs={12} md={6} lg={4}>
          <DailySummaryConfigCard user={user} />
        </Grid>
      </Grid>

    </Box>
  );
};

export default AnalyticsDashboard;