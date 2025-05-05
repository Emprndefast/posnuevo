import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import QRCode from 'qrcode.react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const InvoiceTemplate = ({ 
  businessInfo, 
  invoiceData, 
  items, 
  totals, 
  customer,
  fiscalInfo 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm:ss', { locale: es });
  };

  return (
    <Paper sx={{ p: 4, width: '210mm', margin: 'auto' }}>
      {/* Encabezado */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {businessInfo?.logo && (
            <img 
              src={businessInfo.logo} 
              alt="Logo" 
              style={{ maxWidth: 200, height: 'auto' }} 
            />
          )}
          <Typography variant="h5" gutterBottom>
            {businessInfo?.name || 'Nombre de la Empresa'}
          </Typography>
          <Typography variant="body2">
            {businessInfo?.address || 'Dirección de la Empresa'}
          </Typography>
          <Typography variant="body2">
            Tel: {businessInfo?.phone || 'N/A'}
          </Typography>
          <Typography variant="body2">
            RNC: {businessInfo?.rnc || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}>
          <Typography variant="h6" color="primary" gutterBottom>
            FACTURA FISCAL
          </Typography>
          <Typography variant="body1">
            NCF: {invoiceData.ncf || 'N/A'}
          </Typography>
          <Typography variant="body2">
            Fecha: {formatDate(invoiceData.date)}
          </Typography>
          <Typography variant="body2">
            No. de Factura: {invoiceData.invoiceNumber}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Información del Cliente */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Typography variant="subtitle2" gutterBottom>
            FACTURAR A
          </Typography>
          <Typography variant="body1">
            {customer?.name || 'Cliente General'}
          </Typography>
          {customer?.rnc && (
            <Typography variant="body2">
              RNC/Cédula: {customer.rnc}
            </Typography>
          )}
          {customer?.address && (
            <Typography variant="body2">
              Dirección: {customer.address}
            </Typography>
          )}
          {customer?.phone && (
            <Typography variant="body2">
              Tel: {customer.phone}
            </Typography>
          )}
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" gutterBottom>
            CONDICIONES DE PAGO
          </Typography>
          <Typography variant="body2">
            Método de Pago: {invoiceData.paymentMethod || 'Efectivo'}
          </Typography>
          <Typography variant="body2">
            Término: {invoiceData.paymentTerm || 'Contado'}
          </Typography>
          <Typography variant="body2">
            Vendedor: {invoiceData.seller || 'N/A'}
          </Typography>
        </Grid>
      </Grid>

      {/* Tabla de Productos */}
      <TableContainer sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Descripción</TableCell>
              <TableCell align="center">Cantidad</TableCell>
              <TableCell align="right">Precio Unit.</TableCell>
              <TableCell align="right">ITBIS</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">
                  {formatCurrency(item.price)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(item.tax)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(item.quantity * (item.price + item.tax))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totales */}
      <Grid container spacing={2}>
        <Grid item xs={7}>
          {/* Información Fiscal y Notas */}
          <Box sx={{ p: 2, bgcolor: '#f8f8f8', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              INFORMACIÓN FISCAL
            </Typography>
            <Typography variant="body2">
              Régimen Fiscal: {fiscalInfo?.regime || 'N/A'}
            </Typography>
            <Typography variant="body2">
              No. Autorización: {fiscalInfo?.authNumber || 'N/A'}
            </Typography>
            <Typography variant="body2">
              Fecha de Autorización: {fiscalInfo?.authDate ? formatDate(fiscalInfo.authDate) : 'N/A'}
            </Typography>
          </Box>
          {invoiceData.notes && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                NOTAS
              </Typography>
              <Typography variant="body2">
                {invoiceData.notes}
              </Typography>
            </Box>
          )}
        </Grid>
        <Grid item xs={5}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2">Subtotal:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body2">
                  {formatCurrency(totals.subtotal)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">Descuento:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body2">
                  {formatCurrency(totals.discount)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">ITBIS (18%):</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body2">
                  {formatCurrency(totals.tax)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">TOTAL:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2">
                  {formatCurrency(totals.total)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* Pie de Página */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={4}>
            <QRCode 
              value={JSON.stringify({
                invoice: invoiceData.invoiceNumber,
                business: businessInfo?.rnc,
                total: totals.total,
                date: invoiceData.date
              })}
              size={100}
            />
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {businessInfo?.footer || '¡Gracias por su compra!'}
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              Este documento es una representación impresa de un Comprobante Fiscal Digital
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              Puede verificar la autenticidad de este documento en {businessInfo?.website}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default InvoiceTemplate; 