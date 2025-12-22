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
  Save as SaveIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';

/* =========================
   SALE DETAILS
========================= */

export const SaleDetails = ({ open, onClose, sale, onPrint, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSale, setEditedSale] = useState(sale);
  const { enqueueSnackbar } = useSnackbar();

  if (!sale) return null;

  const saleId = sale._id;
  const saleDate = new Date(sale.date || sale.createdAt);

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Grid container justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Detalles de Venta #{saleId.slice(-6)}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Grid>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Box textAlign="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Cliente</Typography>
                <Typography>{sale.customerName || 'Cliente General'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Estado</Typography>
                <Chip
                  label={sale.status}
                  color={sale.status === 'completed' ? 'success' : 'error'}
                  size="small"
                />
              </Grid>
            </Grid>

            <TableContainer component={Paper} variant="outlined">
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
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.price}</TableCell>
                      <TableCell align="right">
                        ${(item.quantity * item.price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right"><b>Total</b></TableCell>
                    <TableCell align="right"><b>${sale.total}</b></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography mt={2}>
              Fecha: {saleDate.toLocaleString()}
            </Typography>

            <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
              {isEditing ? (
                <Button startIcon={<SaveIcon />} onClick={handleSave}>
                  Guardar
                </Button>
              ) : (
                <>
                  <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={() => onPrint(sale)}
                  >
                    Imprimir
                  </Button>
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
                    <TableRow key={sale._id} hover>
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
                        <IconButton onClick={() => onViewDetails(sale)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton onClick={() => handlePrint(sale)}>
                          <PrintIcon />
                        </IconButton>
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
