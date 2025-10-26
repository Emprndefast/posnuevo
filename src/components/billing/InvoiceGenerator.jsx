import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContextMongo';

export const InvoiceGenerator = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerEmail: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    notes: '',
  });

  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadBusinessInfo();
    generateInvoiceNumber();
    // Calcular totales
    const newSubtotal = invoiceData.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const newVat = newSubtotal * 0.21; // 21% IVA
    const newTotal = newSubtotal + newVat;

    setSubtotal(newSubtotal);
    setVat(newVat);
    setTotal(newTotal);
  }, [invoiceData.items]);

  const loadBusinessInfo = async () => {
    try {
      const q = query(collection(db, 'business_info'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setInvoiceData(prevData => ({
          ...prevData,
          businessInfo: snapshot.docs[0].data()
        }));
      }
    } catch (err) {
      console.error('Error loading business info:', err);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setInvoiceData(prevData => ({
      ...prevData,
      invoiceNumber: `INV-${year}${month}-${random}`
    }));
  };

  const handleAddItem = () => {
    setInvoiceData(prevData => ({
      ...prevData,
      items: [...prevData.items, { description: '', quantity: 1, price: 0 }],
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
    
    // Encabezado
    doc.setFontSize(20);
    doc.text('Factura', 105, 20, { align: 'center' });
    
    // Información de la empresa
    doc.setFontSize(12);
    doc.text(invoiceData.businessInfo?.name || 'Tu Empresa', 20, 40);
    doc.text(invoiceData.businessInfo?.address || 'Dirección', 20, 50);
    doc.text(invoiceData.businessInfo?.phone || 'Teléfono', 20, 60);
    doc.text(invoiceData.businessInfo?.email || 'Email', 20, 70);

    // Información de la factura
    doc.text(`Factura #: ${invoiceData.invoiceNumber}`, 20, 90);
    doc.text(`Fecha: ${invoiceData.date}`, 20, 100);
    doc.text(`Cliente: ${invoiceData.customerName}`, 20, 110);
    doc.text(`Email: ${invoiceData.customerEmail}`, 20, 120);

    // Tabla de items
    const tableData = invoiceData.items.map(item => [
      item.description,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 120,
      head: [['Descripción', 'Cantidad', 'Precio', 'Subtotal']],
      body: tableData,
    });

    // Totales
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`IVA (21%): $${vat.toFixed(2)}`, 140, finalY + 10);
    doc.text(`Total: $${total.toFixed(2)}`, 140, finalY + 20);

    // Notas
    if (invoiceData.notes) {
      doc.text('Notas:', 20, finalY + 40);
      doc.text(invoiceData.notes, 20, finalY + 50);
    }

    doc.save(`factura-${invoiceData.invoiceNumber}.pdf`);
  };

  const saveInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const invoiceRef = await addDoc(collection(db, 'invoices'), {
        ...invoiceData,
        subtotal,
        vat,
        total,
        createdAt: serverTimestamp(),
        userId: user.uid,
        status: 'generated'
      });
      console.log('Factura guardada con ID:', invoiceRef.id);
      // Aquí podrías mostrar un mensaje de éxito
    } catch (error) {
      console.error('Error al guardar la factura:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const doc = generatePDF();
    doc.autoPrint();
  };

  const handleDownload = () => {
    const doc = generatePDF();
    doc.save(`factura-${invoiceData.invoiceNumber}.pdf`);
  };

  const handleEmail = async () => {
    // Implementar envío de email con la factura adjunta
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Generador de Facturas
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Número de Factura"
              value={invoiceData.invoiceNumber}
              onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Fecha"
              value={invoiceData.date}
              onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre del Cliente"
              value={invoiceData.customerName}
              onChange={(e) => setInvoiceData({ ...invoiceData, customerName: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email del Cliente"
              type="email"
              value={invoiceData.customerEmail}
              onChange={(e) => setInvoiceData({ ...invoiceData, customerEmail: e.target.value })}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Items
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      ${(item.quantity * item.price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveItem(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            sx={{ mt: 2 }}
          >
            Agregar Item
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notas"
            value={invoiceData.notes}
            onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Resumen</Typography>
          <Typography>Subtotal: ${subtotal.toFixed(2)}</Typography>
          <Typography>IVA (21%): ${vat.toFixed(2)}</Typography>
          <Typography variant="h6">Total: ${total.toFixed(2)}</Typography>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <PdfIcon />}
            onClick={generatePDF}
            disabled={loading}
          >
            Generar PDF
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <PdfIcon />}
            onClick={saveInvoice}
            disabled={loading}
          >
            Guardar Factura
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Descargar
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={handleEmail}
          >
            Enviar por Email
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}; 