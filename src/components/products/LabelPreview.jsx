import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
  alpha,
  styled
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon,
  QrCode2 as QrCodeIcon,
  ViewWeek as BarcodeIcon
} from '@mui/icons-material';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '../../utils/formatters';

// Estilos globales para impresión
const printStyles = `
  @page {
    size: 50mm 25mm;
    margin: 0;
  }
  @media print {
    html, body {
      width: 50mm;
      height: 25mm;
      margin: 0;
      padding: 0;
    }
    body * {
      visibility: hidden;
    }
    .print-content, .print-content * {
      visibility: visible;
    }
    .print-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 50mm;
      height: 25mm;
    }
    .no-print {
      display: none !important;
    }
  }
`;

const LabelPreview = ({ open, onClose, product }) => {
  const theme = useTheme();
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setLoading(true);
      window.print();
    } catch (error) {
      console.error('Error al imprimir:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{printStyles}</style>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2
          }
        }}
      >
        <DialogTitle className="no-print" sx={{ 
          p: 0, 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6">Vista Previa de Etiqueta</Typography>
          <Box>
            <IconButton 
              size="small" 
              onClick={() => setShowQR(!showQR)}
              sx={{ mr: 1 }}
            >
              {showQR ? <BarcodeIcon /> : <QrCodeIcon />}
            </IconButton>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box className="print-content" sx={{
            border: '1px dashed',
            borderColor: 'divider',
            p: 2,
            width: '50mm',
            height: '25mm',
            m: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            '@media print': {
              border: 'none',
              p: 0
            }
          }}>
            <Typography 
              variant="subtitle2" 
              align="center"
              sx={{
                fontSize: '8pt',
                lineHeight: 1,
                fontWeight: 'bold',
                mb: 0.5
              }}
            >
              {product.name}
            </Typography>

            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              transform: 'scale(0.7)',
              my: -1
            }}>
              {showQR ? (
                <QRCodeSVG 
                  value={product.code}
                  size={60}
                  level="M"
                />
              ) : (
                <Barcode
                  value={product.code}
                  width={1}
                  height={30}
                  fontSize={8}
                  displayValue={true}
                  background="#FFFFFF"
                  margin={0}
                />
              )}
            </Box>

            <Typography 
              variant="subtitle1"
              sx={{ 
                fontWeight: 'bold',
                fontSize: '10pt',
                lineHeight: 1
              }}
            >
              {formatCurrency(product.price)}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions className="no-print" sx={{ p: 0, mt: 2 }}>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={loading}
          >
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LabelPreview; 