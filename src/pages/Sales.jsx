import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Print as PrintIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import saleApiService from '../services/saleApiService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSnackbar } from '../hooks/useSnackbar';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import usePrint from '../hooks/usePrint';
import { usePrinter } from '../context/PrinterContext';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetailsDialog, setSaleDetailsDialog] = useState(false);
  const [printDialog, setPrintDialog] = useState(false);
  const [printPeriod, setPrintPeriod] = useState('day');
  const [printDate, setPrintDate] = useState(new Date());
  const { showSnackbar } = useSnackbar();
  const { print, loading: printLoading, error } = usePrint();
  const { isConnected, printerConfig } = usePrinter();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadSales();
  }, []);

  const normalizeSale = (sale) => {
    const date = sale.fecha ? new Date(sale.fecha) : (sale.date ? new Date(sale.date) : new Date());
    return {
      id: sale._id || sale.id,
      date,
      total: sale.total || 0,
      customerName: sale.cliente_nombre || (sale.cliente_id && (sale.cliente_id.nombre || sale.cliente_id.name)) || 'Cliente General',
      items: (sale.items || []).map(i => ({
        name: i.nombre || i.name || 'Producto',
        price: i.precio_unitario || i.price || (i.subtotal ? i.subtotal / (i.cantidad || i.quantity || 1) : 0),
        quantity: i.cantidad || i.quantity || 1
      })),
      status: sale.estado || sale.status || 'completed',
      ticketNumber: sale.numero_venta || sale._id || sale.id,
      branchName: sale.branch_id?.nombre || sale.sucursal?.nombre || (sale.branch ? sale.branch.nombre : 'General')
    };
  };

  const loadSales = async () => {
    try {
      setLoading(true);
      // Usar API del backend (MongoDB)
      const response = await saleApiService.getAllSales();
      const salesData = (response.data && response.data.data) ? response.data.data : response.data || [];
      setSales(salesData.map(normalizeSale));
    } catch (error) {
      showSnackbar('Error al cargar las ventas: ' + (error.message || error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setSaleDetailsDialog(true);
  };

  const handlePrintTicket = async (sale) => {
    try {
      if (!isConnected) {
        throw new Error('La impresora no está conectada');
      }

      // Crear el objeto de datos para la impresión
      const printData = {
        type: 'sale',
        content: {
          ...sale,
          date: format(sale.date, 'dd/MM/yyyy HH:mm', { locale: es }),
          items: sale.items.map(item => ({
            ...item,
            subtotal: (item.price * item.quantity).toFixed(2)
          }))
        }
      };

      // Usar el servicio de impresión
      await print('sale', printData);

      setSnackbar({
        open: true,
        message: 'Ticket impreso correctamente',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error al imprimir: ' + err.message,
        severity: 'error'
      });
    }
  };

  const handlePrintReport = async () => {
    try {
      // Obtener ventas desde el backend (calcular periodo aquí)
      const computeRange = (period, date) => {
        const start = new Date(date);
        const end = new Date(date);
        switch (period) {
          case 'day':
            start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
            break;
          case 'week':
            start.setDate(start.getDate() - start.getDay()); start.setHours(0, 0, 0, 0);
            end.setDate(end.getDate() + (6 - end.getDay())); end.setHours(23, 59, 59, 999);
            break;
          case 'month':
            start.setDate(1); start.setHours(0, 0, 0, 0);
            end = new Date(start.getFullYear(), start.getMonth() + 1, 0); end.setHours(23, 59, 59, 999);
            break;
          default:
            start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
        }
        return { start, end };
      };

      const { start, end } = computeRange(printPeriod, printDate);
      const salesRes = await saleApiService.getSalesByDateRange(start.toISOString(), end.toISOString());
      const salesInPeriod = (salesRes.data && salesRes.data.data) ? salesRes.data.data.map(normalizeSale) : [];

      // Crear un nuevo documento PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Título
      page.drawText('REPORTE DE VENTAS', {
        x: 50,
        y: height - 50,
        size: 20,
        font
      });

      // Período
      page.drawText(`Período: ${printPeriod} - Fecha: ${printDate.toLocaleDateString()}`, {
        x: 50,
        y: height - 80,
        size: 12,
        font
      });

      // Resumen
      const total = salesInPeriod.reduce((sum, sale) => sum + sale.total, 0);
      const totalItems = salesInPeriod.reduce((sum, sale) =>
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

      page.drawText(`Total Ventas: $${total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, {
        x: 50,
        y: height - 120,
        size: 14,
        font
      });

      page.drawText(`Total Productos Vendidos: ${totalItems.toLocaleString('es-MX')}`, {
        x: 50,
        y: height - 140,
        size: 14,
        font
      });

      // Lista de ventas
      let yPos = height - 180;
      salesInPeriod.forEach(sale => {
        if (yPos < 50) { // Nueva página si no hay espacio
          page = pdfDoc.addPage([600, 800]);
          yPos = height - 50;
        }

        page.drawText(`${saleService.formatDate(sale.date)} - ${sale.customerName || 'Cliente General'}`, {
          x: 50,
          y: yPos,
          size: 10,
          font
        });
        page.drawText(`$${sale.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, {
          x: 400,
          y: yPos,
          size: 10,
          font
        });
        yPos -= 20;
      });

      // Generar y descargar el PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-ventas-${printPeriod}-${printDate.toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      showSnackbar('Reporte generado correctamente', 'success');
      setPrintDialog(false);
    } catch (error) {
      showSnackbar('Error al generar el reporte: ' + error.message, 'error');
    }
  };

  const SaleDetailsDialog = ({ open, onClose, sale }) => {
    const { print, loading: printLoading } = usePrint();
    const { isConnected } = usePrinter();

    const handlePrint = async () => {
      try {
        if (!isConnected) {
          throw new Error('La impresora no está conectada');
        }

        // Crear el objeto de datos para la impresión
        const printData = {
          type: 'sale',
          content: {
            ...sale,
            date: saleService.formatDate(sale.date),
            items: sale.items.map(item => ({
              ...item,
              subtotal: (item.price * item.quantity).toFixed(2)
            }))
          }
        };

        // Usar el servicio de impresión
        await print('sale', printData);

        setSnackbar({
          open: true,
          message: 'Ticket impreso correctamente',
          severity: 'success'
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Error al imprimir: ' + err.message,
          severity: 'error'
        });
      }
    };

    if (!sale) return null;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2
        }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Detalles de Venta #{sale.id?.slice(-6)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {saleService.formatDate(sale.date)}
            </Typography>
          </Box>
          <Chip
            label={sale.status === 'completed' ? 'Completada' : 'Cancelada'}
            color={sale.status === 'completed' ? 'success' : 'error'}
            size="small"
          />
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Información del Cliente */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Información del Cliente
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nombre
                    </Typography>
                    <Typography variant="body1">
                      {sale.customerName || 'Cliente General'}
                    </Typography>
                  </Box>
                  {sale.customerPhone && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Teléfono
                      </Typography>
                      <Typography variant="body1">
                        {sale.customerPhone}
                      </Typography>
                    </Box>
                  )}
                  {sale.customerEmail && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {sale.customerEmail}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Información de la Venta */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Información de la Venta
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Vendedor
                    </Typography>
                    <Typography variant="body1">
                      {sale.sellerName || sale.userId}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Método de Pago
                    </Typography>
                    <Typography variant="body1">
                      {sale.paymentMethod || 'Efectivo'}
                    </Typography>
                  </Box>
                  {sale.notes && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Notas
                      </Typography>
                      <Typography variant="body1">
                        {sale.notes}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Productos */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Productos Vendidos
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Producto</TableCell>
                        <TableCell align="right">Precio Unit.</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sale.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productId}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">{item.name}</Typography>
                              {item.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {item.description}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            ${item.price.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            ${(item.price * item.quantity).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">
                          <Typography variant="subtitle2">Total:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2">
                            {sale.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={!isConnected || printLoading}
          >
            {printLoading ? 'Imprimiendo...' : 'Imprimir Ticket'}
          </Button>
        </DialogActions>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Ventas</Typography>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => setPrintDialog(true)}
        >
          Imprimir Reporte
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Sucursal / Caja</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{saleService.formatDate(sale.date)}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {sale.branchName}
                  </Typography>
                </TableCell>
                <TableCell>{sale.customerName || 'Cliente General'}</TableCell>
                <TableCell>{sale.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                <TableCell>
                  <Chip
                    label={sale.status}
                    color={sale.status === 'completed' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Ver detalles">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(sale)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de detalles de venta */}
      <SaleDetailsDialog
        open={saleDetailsDialog}
        onClose={() => setSaleDetailsDialog(false)}
        sale={selectedSale}
      />

      {/* Diálogo de impresión de reporte */}
      <Dialog
        open={printDialog}
        onClose={() => setPrintDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Imprimir Reporte</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={printPeriod}
                onChange={(e) => setPrintPeriod(e.target.value)}
                label="Período"
              >
                <MenuItem value="day">Día</MenuItem>
                <MenuItem value="week">Semana</MenuItem>
                <MenuItem value="month">Mes</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="date"
              label="Fecha"
              value={printDate.toISOString().split('T')[0]}
              onChange={(e) => setPrintDate(new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrintReport}
          >
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Sales; 