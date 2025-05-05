import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { printerService } from '../../services/printerService';

const PrintProductLabel = ({ open, onClose, product }) => {
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handlePrint = async () => {
    setPrinting(true);
    setError(null);
    setSuccess(false);

    try {
      await printerService.printLabel(product);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Vista Previa de Etiqueta
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          {/* Vista previa visual de la etiqueta */}
          <Paper 
            sx={{ 
              width: '80mm', 
              minHeight: '40mm',
              mx: 'auto',
              p: 2,
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              fontFamily: 'monospace',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1
            }}
          >
            {/* Simula el estilo de impresión térmica */}
            <Typography 
              sx={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'center',
                width: '100%',
                fontFamily: 'monospace'
              }}
            >
              {product?.name}
            </Typography>

            <Typography 
              sx={{ 
                fontSize: '12px',
                textAlign: 'center',
                width: '100%',
                fontFamily: 'monospace'
              }}
            >
              Código: {product?.code}
            </Typography>

            <Typography 
              sx={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                textAlign: 'center',
                width: '100%',
                fontFamily: 'monospace'
              }}
            >
              ${product?.price?.toFixed(2)}
            </Typography>

            {product?.category && (
              <Typography 
                sx={{ 
                  fontSize: '12px',
                  textAlign: 'center',
                  width: '100%',
                  fontFamily: 'monospace'
                }}
              >
                Categoría: {product.category}
              </Typography>
            )}

            {product?.location && (
              <Typography 
                sx={{ 
                  fontSize: '12px',
                  textAlign: 'center',
                  width: '100%',
                  fontFamily: 'monospace'
                }}
              >
                Ubicación: {product.location}
              </Typography>
            )}

            {/* Simulación del código de barras */}
            {product?.code && (
              <Box 
                sx={{ 
                  width: '100%',
                  height: '40px',
                  background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40'%3E%3Crect width='100%25' height='100%25' fill='white'/%3E%3Cpath d='M0 0h2v40h-2zM4 0h1v40h-1zM7 0h2v40h-2zM13 0h1v40h-1zM16 0h2v40h-2zM22 0h1v40h-1zM25 0h2v40h-2z' fill='black'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat-x',
                  backgroundSize: 'contain',
                  mt: 1
                }}
              />
            )}

            <Typography 
              sx={{ 
                fontSize: '10px',
                textAlign: 'center',
                width: '100%',
                fontFamily: 'monospace',
                mt: 1
              }}
            >
              {product?.code}
            </Typography>
          </Paper>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Esta es una vista previa de cómo se verá la etiqueta impresa.
            El resultado final puede variar según el modelo de impresora.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Etiqueta impresa correctamente
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
          disabled={printing}
        >
          Cerrar
        </Button>
        <Button
          onClick={handlePrint}
          variant="contained"
          color="primary"
          startIcon={printing ? <CircularProgress size={20} /> : <PrintIcon />}
          disabled={printing}
        >
          {printing ? 'Imprimiendo...' : 'Imprimir Etiqueta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintProductLabel; 