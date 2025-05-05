import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon,
  LocalOffer as LabelIcon,
} from '@mui/icons-material';
import { useFirebase } from '../../hooks/useFirebase';
import { COLLECTIONS } from '../../constants';
import { formatCurrency } from '../../utils/formatters';

const ProductLabel = ({ open, onClose, product }) => {
  const { loading, error } = useFirebase();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta de Producto</title>
          <style>
            @page {
              size: 80mm 40mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 5mm;
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
            .label {
              width: 70mm;
              height: 30mm;
              border: 1px solid #000;
              padding: 2mm;
              box-sizing: border-box;
            }
            .product-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 2mm;
              text-align: center;
            }
            .product-code {
              font-size: 12px;
              margin-bottom: 2mm;
              text-align: center;
            }
            .product-price {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 2mm;
            }
            .product-details {
              font-size: 10px;
              text-align: center;
            }
            .barcode {
              text-align: center;
              margin-top: 2mm;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="product-name">${product?.name}</div>
            <div class="product-code">Código: ${product?.code}</div>
            <div class="product-price">$${formatCurrency(product?.price)}</div>
            <div class="product-details">
              ${product?.category ? `Categoría: ${product?.category}<br>` : ''}
              ${product?.location ? `Ubicación: ${product?.location}` : ''}
            </div>
            <div class="barcode">
              ${product?.code}
            </div>
          </div>
          <div class="no-print" style="margin-top: 10mm; text-align: center;">
            <button onclick="window.print()">Imprimir Etiqueta</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 'bold', 
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <LabelIcon color="primary" />
        Etiqueta de Producto
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                border: '1px dashed rgba(0,0,0,0.1)',
                borderRadius: 2,
                bgcolor: 'rgba(0,0,0,0.02)'
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {product?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Código: {product?.code}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {formatCurrency(product?.price)}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {product?.category && `Categoría: ${product?.category}`}
                  {product?.location && ` • Ubicación: ${product?.location}`}
                </Typography>
              </Box>
              
              <Box sx={{ 
                mt: 3, 
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: '1.2em',
                letterSpacing: '2px'
              }}>
                {product?.code}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
        <Button 
          onClick={onClose} 
          startIcon={<CloseIcon />}
          sx={{ borderRadius: 2 }}
        >
          Cerrar
        </Button>
        <Button
          onClick={handlePrint}
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PrintIcon />}
          disabled={loading}
          sx={{ borderRadius: 2, fontWeight: 'bold' }}
        >
          {loading ? 'Preparando...' : 'Imprimir Etiqueta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductLabel; 