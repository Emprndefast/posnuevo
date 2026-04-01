import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Alert, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Card, CardContent, Divider, Stack
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon, Email as EmailIcon, Print as PrintIcon,
  Download as DownloadIcon, Add as AddIcon, Delete as DeleteIcon,
  Receipt as ReceiptIcon, Person as PersonIcon, Assignment as AssignmentIcon
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '../../context/AuthContextMongo';
import { useBusiness } from '../../context/BusinessContext';
import api from '../../api/api';
import { format } from 'date-fns';

export const InvoiceGenerator = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerEmail: '',
    customerRNC: '', // Nuevo: RNC/Cédula
    eCfType: 'B02', // Nuevo: Tipo de Comprobante
    items: [{ description: '', quantity: 1, price: 0 }],
    notes: '',
  });

  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { businessData } = useBusiness();

  useEffect(() => {
    generateInvoiceNumber('B02');
  }, []);

  useEffect(() => {
    if (businessData) {
      setInvoiceData(prev => ({ ...prev, businessInfo: businessData }));
    }
  }, [businessData]);

  useEffect(() => {
    const newSubtotal = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const newVat = newSubtotal * 0.18; // ITBIS de RD es 18% general (antes era 21% de prueba)
    setSubtotal(newSubtotal);
    setVat(newVat);
    setTotal(newSubtotal + newVat);
  }, [invoiceData.items]);

  const generateInvoiceNumber = (type) => {
    const random = Math.floor(Math.random() * 10000000).toString().padStart(8, '0');
    let prefix = 'E32'; // e-CF Consumo
    if (type === 'B01') prefix = 'E31'; // e-CF Crédito Fiscal
    
    setInvoiceData(prevData => ({
      ...prevData,
      eCfType: type,
      invoiceNumber: `${prefix}0000${random}` // Formato simulado e-NCF
    }));
  };

  const handleAddItem = () => {
    setInvoiceData(prevData => ({
      ...prevData, items: [...prevData.items, { description: '', quantity: 1, price: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const primaryColor = [25, 118, 210]; // Azul moderno
    const grayColor = [100, 100, 100];
    
    // --- ENCABEZADO PRO ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    const isCredito = invoiceData.eCfType === 'B01';
    const docTitle = isCredito ? 'FACTURA DE CRÉDITO FISCAL' : 'FACTURA DE CONSUMO';
    doc.text(docTitle, 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('COMPROBANTE FISCAL ELECTRÓNICO (e-CF)', 105, 26, { align: 'center' });

    // --- DATOS DEL EMISOR (IZQUIERDA) ---
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(14, 35, 85, 45, 2, 2);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('DATOS DEL EMISOR', 18, 42);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Razón Social: ${invoiceData.businessInfo?.nombre || 'Tu Empresa SRL'}`, 18, 50);
    doc.text(`RNC: ${invoiceData.businessInfo?.rnc || '000000000'}`, 18, 56);
    doc.text(`Dirección: ${invoiceData.businessInfo?.direccion || 'Avenida Principal #1'}`, 18, 62);
    doc.text(`Tel: ${invoiceData.businessInfo?.telefono || '809-000-0000'}`, 18, 68);
    doc.text(`Email: ${invoiceData.businessInfo?.email || 'ventas@empresa.com'}`, 18, 74);

    // --- DATOS DEL CLIENTE Y COMPROBANTE (DERECHA) ---
    doc.roundedRect(105, 35, 90, 45, 2, 2);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL RECEPTOR', 109, 42);
    
    doc.setFontSize(9);
    doc.text(`Fecha Emisión: ${invoiceData.date}`, 109, 50);
    doc.setFont('helvetica', 'bold');
    doc.text(`e-NCF: ${invoiceData.invoiceNumber}`, 109, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${invoiceData.customerName || 'Consumidor Final'}`, 109, 62);
    if(invoiceData.customerRNC) doc.text(`RNC/Cédula: ${invoiceData.customerRNC}`, 109, 68);
    if(invoiceData.customerEmail) doc.text(`Email: ${invoiceData.customerEmail}`, 109, 74);

    // --- TABLA DE ITEMS ---
    const tableData = invoiceData.items.map((item, idx) => [
      idx + 1,
      item.description,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 90,
      head: [['#', 'Descripción del Artículo / Servicio', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
      },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    // --- TOTALES Y RESUMEN ---
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Cuadro de Totales (Derecha)
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.rect(125, finalY, 70, 30);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal Gravado:', 130, finalY + 8);
    doc.text(`$${subtotal.toFixed(2)}`, 190, finalY + 8, { align: 'right' });
    
    doc.text('ITBIS (18%):', 130, finalY + 16);
    doc.text(`$${vat.toFixed(2)}`, 190, finalY + 16, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('MONTO TOTAL:', 130, finalY + 26);
    doc.text(`$${total.toFixed(2)}`, 190, finalY + 26, { align: 'right' });

    // --- NOTAS Y FIRMA (Izquierda) ---
    if (invoiceData.notes) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTAS / OBSERVACIONES:', 14, finalY + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceData.notes, 14, finalY + 14, { maxWidth: 100 });
    }

    doc.setDrawColor(150);
    doc.setLineWidth(0.2);
    doc.line(14, finalY + 50, 80, finalY + 50);
    doc.text('Firma Digital Autorizada', 25, finalY + 55);

    doc.setFontSize(7);
    doc.setTextColor(grayColor[0]);
    doc.text('Documento válido como Factura Electrónica e-CF sujeto a validación de DGII.', 105, 280, { align: 'center' });

    return doc;
  };

  const saveInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/invoices', {
        ...invoiceData, subtotal, vat, total, status: 'generated'
      });
      console.log('Factura guardada:', response.data);
      alert("Factura guardada correctamente (Modo e-CF activo)");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReceiptIcon fontSize="large" color="primary" /> Generador e-CF PRO
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Emisión formal de comprobantes electrónicos requeridos por DGII.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* PARTE 1: DATOS FISCALES DEL DOCUMENTO */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <AssignmentIcon color="primary" /> Documento Fiscal
              </Typography>
              <Stack spacing={2.5}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de e-CF</InputLabel>
                  <Select
                    value={invoiceData.eCfType}
                    label="Tipo de e-CF"
                    onChange={(e) => {
                      const type = e.target.value;
                      generateInvoiceNumber(type);
                    }}
                  >
                    <MenuItem value="B02">Factura de Consumo (B02 - 32)</MenuItem>
                    <MenuItem value="B01">Crédito Fiscal (B01 - 31)</MenuItem>
                    <MenuItem value="B14">Régimen Especial (B14 - 44)</MenuItem>
                    <MenuItem value="B15">Gubernamental (B15 - 45)</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth label="e-NCF / Comprobante" value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                  inputProps={{ style: { fontWeight: 'bold' } }}
                />
                <TextField
                  fullWidth type="date" label="Fecha Emisión" value={invoiceData.date}
                  onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* PARTE 2: DATOS DEL RECEPTOR/CLIENTE */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <PersonIcon color="primary" /> Receptor (Cliente)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField fullWidth label="Razón Social / Nombre Completo" value={invoiceData.customerName}
                    onChange={(e) => setInvoiceData({ ...invoiceData, customerName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                   <TextField fullWidth label={invoiceData.eCfType === 'B01' ? 'RNC (Obligatorio)' : 'Cédula / RNC'} 
                    value={invoiceData.customerRNC}
                    onChange={(e) => setInvoiceData({ ...invoiceData, customerRNC: e.target.value })}
                    required={invoiceData.eCfType === 'B01'}
                    error={invoiceData.eCfType === 'B01' && !invoiceData.customerRNC}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Correo Electrónico para envío e-CF" type="email" value={invoiceData.customerEmail}
                    onChange={(e) => setInvoiceData({ ...invoiceData, customerEmail: e.target.value })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* PARTE 3: DETALLES DE LINEA */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Detalle de Servicios y Productos</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="center" width="15%">Cantidad</TableCell>
                      <TableCell align="center" width="20%">Precio Base</TableCell>
                      <TableCell align="right" width="20%">Subtotal</TableCell>
                      <TableCell align="center" width="60px"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField fullWidth variant="standard" value={item.description} placeholder="Ej. Memoria RAM 8GB"
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
                        </TableCell>
                        <TableCell align="center">
                          <TextField type="number" variant="standard" inputProps={{ min: 1, style: { textAlign: 'center' } }} value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)} />
                        </TableCell>
                        <TableCell align="center">
                          <TextField type="number" variant="standard" inputProps={{ min: 0, style: { textAlign: 'center' } }} value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="500">${(item.quantity * item.price).toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton color="error" size="small" onClick={() => handleRemoveItem(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box mt={2}>
                <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddItem}>
                  Agregar Fila
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <TextField fullWidth multiline rows={4} label="Notas, Observaciones o Términos (Opcional)" value={invoiceData.notes}
                    onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0f4f8', borderRadius: 2 }}>
                    <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Subtotal Gravado:</Typography>
                        <Typography>${subtotal.toFixed(2)}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">ITBIS (18%):</Typography>
                        <Typography>${vat.toFixed(2)}</Typography>
                      </Box>
                      <Divider />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6" fontWeight="bold">TOTAL VENTA:</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">${total.toFixed(2)}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* BOTONERA ACCIONES */}
      <Paper elevation={0} sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => generatePDF().autoPrint()}>
          Imprimir Vía POS
        </Button>
        <Button variant="outlined" startIcon={<EmailIcon />} onClick={() => alert("Pendiente de enviar por correo!")}>
          Enviar a Cliente
        </Button>
        <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={() => generatePDF().save(`${invoiceData.invoiceNumber}.pdf`)}>
          Descargar PDF
        </Button>
        <Button variant="contained" color="primary" startIcon={loading ? <CircularProgress size={20}/> : <PdfIcon />} onClick={saveInvoice} disabled={loading}>
          Generar y Enviar a DGII (Mock)
        </Button>
      </Paper>
    </Box>
  );
};