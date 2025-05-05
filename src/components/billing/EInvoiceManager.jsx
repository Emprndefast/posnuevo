import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Print as PrintIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { eInvoiceService } from '../../services/eInvoiceService';
import { useSnackbar } from '../../context/SnackbarContext';

const EInvoiceManager = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // Aquí deberías implementar la lógica para obtener las facturas
      // Por ahora usamos datos de ejemplo
      const mockInvoices = [
        {
          id: '1',
          invoiceNumber: 'FAC-001',
          customer: { name: 'Cliente Ejemplo' },
          total: 1000,
          status: 'approved',
          timestamp: new Date()
        }
      ];
      setInvoices(mockInvoices);
    } catch (error) {
      showSnackbar('Error al cargar facturas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToAFIP = async (invoiceId) => {
    try {
      setLoading(true);
      await eInvoiceService.sendToAFIP(invoiceId);
      showSnackbar('Factura enviada a AFIP exitosamente', 'success');
      fetchInvoices();
    } catch (error) {
      showSnackbar('Error al enviar factura a AFIP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadXML = async (invoiceId) => {
    try {
      const invoice = await eInvoiceService.getInvoiceStatus(invoiceId);
      // Implementar descarga del XML
      showSnackbar('XML descargado exitosamente', 'success');
    } catch (error) {
      showSnackbar('Error al descargar XML', 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      generated: 'info',
      approved: 'success',
      rejected: 'error'
    };
    return colors[status] || 'default';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">
            Gestión de Facturas Electrónicas
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchInvoices}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.customer.name}</TableCell>
                  <TableCell>${invoice.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(invoice.timestamp)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver Factura">
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Imprimir">
                      <IconButton size="small">
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Enviar a AFIP">
                      <IconButton
                        size="small"
                        onClick={() => handleSendToAFIP(invoice.id)}
                        disabled={invoice.status === 'approved'}
                      >
                        <SendIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Descargar XML">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadXML(invoice.id)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default EInvoiceManager; 