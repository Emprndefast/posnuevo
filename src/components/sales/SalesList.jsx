import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Divider,
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
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';

export const SaleDetails = ({ open, onClose, sale, onPrint, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSale, setEditedSale] = useState(sale);
  const { enqueueSnackbar } = useSnackbar();

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onUpdate(editedSale);
      setIsEditing(false);
      enqueueSnackbar('Venta actualizada correctamente', { 
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        }
      });
    } catch (error) {
      setError(error.message);
      enqueueSnackbar('Error al actualizar la venta', { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Grid container justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Detalles de Venta #{sale.id.slice(-6)}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Grid>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Grid container justifyContent="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Grid>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Cliente
                </Typography>
                <Typography variant="body1">
                  {sale.customerName || 'Cliente General'}
                </Typography>
                {sale.customerEmail && (
                  <Typography variant="body2" color="textSecondary">
                    {sale.customerEmail}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Estado
                </Typography>
                <Chip
                  label={sale.status === 'completed' ? 'Completada' : 'Cancelada'}
                  color={sale.status === 'completed' ? 'success' : 'error'}
                  size="small"
                />
              </Grid>
            </Grid>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unit.</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        ${item.price?.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${(item.quantity * item.price)?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>${sale.total?.toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Información Adicional
                </Typography>
                <Typography variant="body2">
                  Vendedor: {sale.sellerName}
                </Typography>
                <Typography variant="body2">
                  Fecha: {new Date(sale.date).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Método de pago: {sale.paymentMethod}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Notas
                </Typography>
                <Typography variant="body2">
                  {sale.notes || 'Sin notas adicionales'}
                </Typography>
              </Grid>
            </Grid>

            <Grid container justifyContent="flex-end" spacing={1} sx={{ mt: 3 }}>
              {isEditing ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  Guardar Cambios
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={() => onPrint(sale)}
                  >
                    Imprimir Ticket
                  </Button>
                </>
              )}
            </Grid>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const SalesList = ({ 
  open, 
  onClose, 
  sales, 
  loading, 
  handlePrint, 
  onViewDetails,
  getStatusColor 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: 1, sm: 2 },
          maxHeight: '90vh',
          width: '100%'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        p: { xs: 2, sm: 3 }
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Lista de Ventas
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
        <TableContainer>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                '& th': {
                  fontWeight: 600,
                  color: 'text.primary'
                }
              }}>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>ID</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                      <Typography variant="h6" color="text.secondary">
                        No se encontraron ventas
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow 
                    key={sale.id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {sale.id.slice(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {format(sale.date.toDate(), 'dd/MM/yyyy', { locale: es })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(sale.date.toDate(), 'HH:mm', { locale: es })}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5
                      }}>
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: theme.palette.primary.main 
                        }}>
                          {sale.customerName?.charAt(0) || <PersonIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                            {sale.customerName || 'Cliente no registrado'}
                          </Typography>
                          {sale.customerPhone && (
                            <Typography variant="caption" color="text.secondary">
                              {sale.customerPhone}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {formatCurrency(sale.total)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sale.status}
                        size="small"
                        color={getStatusColor(sale.status)}
                        sx={{ minWidth: 90 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Ver detalles">
                          <IconButton 
                            size="small"
                            onClick={() => onViewDetails(sale)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Imprimir">
                          <IconButton 
                            size="small"
                            onClick={() => handlePrint(sale)}
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default SalesList; 