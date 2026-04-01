import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Print as PrintIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ShoppingBag as ShoppingBagIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

/* =========================
   SALE DETAILS
========================= */

export const SaleDetails = ({ open, onClose, sale, onPrint, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSale, setEditedSale] = useState(sale);
  const { enqueueSnackbar } = useSnackbar();
  const { setCart } = useCart();
  const navigate = useNavigate();

  if (!sale) return null;

  const saleId = sale._id || sale.id;
  const saleDate = new Date(sale.date || sale.createdAt);
  const isPending = ['pending', 'pendiente', 'procesando', 'processing'].includes(sale.status?.toLowerCase());

  const handleSave = async () => {
    try {
      setLoading(true);
      await onUpdate(editedSale);
      setIsEditing(false);
      enqueueSnackbar('Venta actualizada correctamente', { variant: 'success' });
    } catch (err) {
      setError(err.message);
      enqueueSnackbar('Error al actualizar la venta', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadToCart = async () => {
    try {
      const cartItems = (sale.items || []).map(item => ({
        id: item.producto_id || item.id || `item-${Math.random()}`,
        name: item.nombre || item.name || 'Producto',
        price: item.precio_unitario || item.price || 0,
        quantity: item.cantidad || item.quantity || 1,
        code: item.codigo || item.code || '',
        meta: { type: 'product', source: 'converted_order', orderId: sale._id || sale.id }
      }));
      if (cartItems.length === 0) {
        enqueueSnackbar('La orden no tiene productos', { variant: 'warning' });
        return;
      }
      try {
        if (saleId) await api.patch(`/sales/${saleId}`, { estado: 'procesando', status: 'processing' });
      } catch (err) {}
      setCart(cartItems);
      enqueueSnackbar('✅ Orden cargada al carrito', { variant: 'success' });
      navigate('/quick-sale', { state: { saleToLoad: sale } });
      onClose();
    } catch (err) {
      enqueueSnackbar('Error al cargar la orden', { variant: 'error' });
    }
  };

  const handleCancelSale = async () => {
    if (window.confirm('¿Confirmas que deseas cancelar definitivamente esta orden?')) {
      try {
        setLoading(true);
        await api.patch(`/sales/${saleId}`, { estado: 'anulada', status: 'anulada' });
        enqueueSnackbar('Orden cancelada correctamente', { variant: 'success' });
        onClose();
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        enqueueSnackbar('Error al cancelar orden', { variant: 'error' });
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Grid container justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Detalles de Venta #{String(saleId).slice(-6)}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Grid>
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box textAlign="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box mb={3} p={2} bgcolor="background.default" borderRadius={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Cliente</Typography>
                  <Typography variant="body1" fontWeight={500}>{sale.customerName || sale.cliente_nombre || 'Cliente General'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Fecha</Typography>
                  <Typography variant="body1">{format(saleDate, 'dd/MM/yyyy HH:mm', { locale: es })}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Estado</Typography>
                  <Box mt={0.5}>
                    <Chip label={sale.status || sale.estado} color={sale.status === 'completed' || sale.estado === 'completada' ? 'success' : isPending ? 'warning' : 'error'} size="small" />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Método de Pago</Typography>
                  <Typography variant="body1">{sale.paymentMethod || sale.metodo_pago || 'No especificado'}</Typography>
                </Grid>
                {(sale.notes || sale.notas) && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Notas de la orden:</Typography>
                    <Typography variant="body2">{sale.notes || sale.notas}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Productos</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cant.</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items?.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.name || item.nombre}</TableCell>
                      <TableCell align="right">{item.quantity || item.cantidad}</TableCell>
                      <TableCell align="right">{formatCurrency(item.price || item.precio_unitario || 0)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency((item.quantity || item.cantidad || 0) * (item.price || item.precio_unitario || 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right"><b>Total General</b></TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                        {formatCurrency(sale.total)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={2} display="flex" justifyContent="flex-end" flexWrap="wrap" gap={1.5}>
              {isEditing ? (
                <Button startIcon={<SaveIcon />} onClick={handleSave} variant="contained">
                  Guardar
                </Button>
              ) : (
                <>
                  {isPending && (
                    <>
                      <Button
                        variant="contained"
                        color={['procesando', 'processing'].includes(sale.status?.toLowerCase()) ? 'warning' : 'primary'}
                        startIcon={<ShoppingBagIcon />}
                        onClick={handleLoadToCart}
                      >
                        Procesar en Carrito
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelSale}
                      >
                        Anular
                      </Button>
                    </>
                  )}
                  {onUpdate && !isPending && (
                    <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                      Editar Info
                    </Button>
                  )}
                  {onPrint && (
                    <Button
                      variant={isPending ? "text" : "contained"}
                      color="secondary"
                      startIcon={<PrintIcon />}
                      onClick={() => onPrint(sale)}
                    >
                      Imprimir
                    </Button>
                  )}
                </>
              )}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* =========================
   SALES LIST
========================= */

const SalesList = ({
  open,
  onClose,
  sales,
  handlePrint,
  onViewDetails,
  getStatusColor
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { setCart } = useCart();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleLoadToCart = async (sale) => {
    try {
      // Mapear items de la venta al formato del carrito
      const cartItems = (sale.items || []).map(item => ({
        id: item.producto_id || item.id || `item-${Math.random()}`,
        name: item.nombre || item.name || 'Producto',
        price: item.precio_unitario || item.price || 0,
        quantity: item.cantidad || item.quantity || 1,
        code: item.codigo || item.code || '',
        meta: { type: 'product', source: 'converted_order', orderId: sale._id || sale.id }
      }));

      if (cartItems.length === 0) {
        enqueueSnackbar('La orden no tiene productos', { variant: 'warning' });
        return;
      }

      // Intentar marcar la orden como "procesando" en el backend para evitar doble procesamiento
      try {
        const saleId = sale._id || sale.id;
        if (saleId) {
          await api.patch(`/sales/${saleId}`, { estado: 'procesando', status: 'processing' });
          console.log('✅ Orden marcada como procesando:', saleId);
        }
      } catch (updateErr) {
        // No bloqueamos el flujo si falla la actualización
        console.warn('⚠️ No se pudo marcar la orden como procesando:', updateErr?.message);
      }

      // Reemplazar carrito actual con los items de la orden
      setCart(cartItems);
      
      enqueueSnackbar('✅ Orden cargada al carrito. Procede con el pago.', { variant: 'success' });
      
      // Redirigir al POS pasando la venta en el estado para precargar el cliente
      navigate('/quick-sale', { state: { saleToLoad: sale } });
      onClose();
    } catch (err) {
      console.error('Error al cargar orden al carrito:', err);
      enqueueSnackbar('Error al cargar la orden', { variant: 'error' });
    }
  };

  const handleCancelSale = async (sale) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar/anular esta solicitud de pedido pendiente?')) {
      try {
        const saleId = sale._id || sale.id;
        await api.patch(`/sales/${saleId}`, { estado: 'anulada', status: 'anulada' });
        enqueueSnackbar('Orden cancelada correctamente', { variant: 'success' });
        // Recargar para que desaparezca la orden de la vista de pendientes, o bien esperar que el estado mute localmente.
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        console.error('Error anulando orden:', err);
        enqueueSnackbar('Error al cancelar la orden', { variant: 'error' });
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Lista de Ventas</DialogTitle>

      <DialogContent>
        <TableContainer>
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay ventas
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => {
                  const date = new Date(sale.date || sale.createdAt);

                  return (
                    <TableRow 
                      key={sale._id} 
                      hover 
                      onClick={() => onViewDetails(sale)} 
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{sale._id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        {format(date, 'dd/MM/yyyy HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar>
                            {sale.customerName?.charAt(0) || <PersonIcon />}
                          </Avatar>
                          {sale.customerName || 'Cliente'}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(sale.total)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sale.status}
                          color={getStatusColor(sale.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={0.5}>
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onViewDetails(sale); }}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {['pending', 'pendiente', 'procesando', 'processing'].includes(sale.status?.toLowerCase()) && (
                            <>
                              <Tooltip title={
                                ['procesando', 'processing'].includes(sale.status?.toLowerCase())
                                  ? 'Continuar procesamiento en Carrito'
                                  : 'Procesar en Carrito (Editar Orden)'
                              }>
                                <IconButton 
                                  size="small" 
                                  color={['procesando', 'processing'].includes(sale.status?.toLowerCase()) ? 'warning' : 'primary'}
                                  onClick={(e) => { e.stopPropagation(); handleLoadToCart(sale); }}
                                >
                                  <ShoppingBagIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Cancelar / Anular Orden">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={(e) => { e.stopPropagation(); handleCancelSale(sale); }}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          <Tooltip title="Imprimir">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePrint(sale); }}>
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default SalesList;
