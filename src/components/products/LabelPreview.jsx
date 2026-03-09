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
  ViewWeek as BarcodeIcon,
  Add as AddIcon,
  Remove as RemoveIcon
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

const LabelPreview = ({ open, onClose, product, products = [] }) => {
  const theme = useTheme();
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copies, setCopies] = useState(1);

  // Determinar qué productos imprimir
  const itemsToPrint = products.length > 0 ? products : (product ? [product] : []);

  const handlePrint = async () => {
    try {
      setLoading(true);
      // Pequeño delay para asegurar que el contenido esté renderizado
      setTimeout(() => {
        window.print();
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error al imprimir:', error);
      setLoading(false);
    }
  };

  if (itemsToPrint.length === 0) return null;

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
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h6">Configurar Impresión de Etiquetas</Typography>
          <Box>
            <IconButton
              size="small"
              onClick={() => setShowQR(!showQR)}
              sx={{ mr: 1 }}
              title={showQR ? "Cambiar a Código de Barras" : "Cambiar a QR"}
            >
              {showQR ? <BarcodeIcon /> : <QrCodeIcon />}
            </IconButton>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box className="no-print" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Copias por etiqueta:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <IconButton size="small" onClick={() => setCopies(Math.max(1, copies - 1))}>
                <RemoveIcon />
              </IconButton>
              <Typography sx={{ px: 2, fontWeight: 'bold' }}>{copies}</Typography>
              <IconButton size="small" onClick={() => setCopies(copies + 1)}>
                <AddIcon />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Total etiquetas: {itemsToPrint.length * copies}
            </Typography>
          </Box>

          <Typography variant="subtitle2" className="no-print" gutterBottom sx={{ opacity: 0.7 }}>
            Vista previa (un elemento):
          </Typography>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxHeight: '400px',
            overflowY: 'auto',
            p: 1,
            bgcolor: alpha(theme.palette.background.default, 0.5),
            borderRadius: 2
          }}>
            {/* Solo mostramos la vista previa en pantalla del primer elemento */}
            <Box className="print-item" sx={{
              border: '1px dashed',
              borderColor: 'divider',
              p: 1.5,
              width: '50mm',
              height: '25mm',
              m: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
              bgcolor: 'white',
              boxShadow: 1,
              '@media print': {
                border: 'none',
                p: 0,
                m: 0,
                boxShadow: 'none',
                pageBreakAfter: 'always',
                width: '50mm',
                height: '25mm',
                display: 'flex', // Asegurar que sea visible en impresión
                visibility: 'visible !important'
              }
            }}>
              <Typography
                variant="subtitle2"
                align="center"
                sx={{
                  fontSize: '9pt',
                  lineHeight: 1.1,
                  fontWeight: 'bold',
                  mb: 0.5,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'black'
                }}
              >
                {itemsToPrint[0].name}
              </Typography>

              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                my: 0.5,
                width: '100%',
                overflow: 'hidden'
              }}>
                {showQR ? (
                  <QRCodeSVG
                    value={itemsToPrint[0].code || itemsToPrint[0].codigo || ''}
                    size={65}
                    level="M"
                    includeMargin={false}
                  />
                ) : (
                  <Barcode
                    value={itemsToPrint[0].code || itemsToPrint[0].codigo || '000000'}
                    width={1.2}
                    height={35}
                    fontSize={10}
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
                  fontSize: '11pt',
                  lineHeight: 1,
                  color: 'black',
                  mt: 0.5
                }}
              >
                {formatCurrency(itemsToPrint[0].price || 0)}
              </Typography>
            </Box>

            {/* Este bloque se repetirá n veces en la impresión real */}
            <Box className="no-print" sx={{ textAlign: 'center', opacity: 0.5 }}>
              <Typography variant="caption">
                {itemsToPrint.length > 1 ? `... y otros ${itemsToPrint.length - 1} productos` : ''}
              </Typography>
            </Box>

            {/* Contenido oculto que solo se ve al imprimir para generar todas las etiquetas */}
            <Box sx={{ display: 'none', '@media print': { display: 'block' } }}>
              {itemsToPrint.map((item) => (
                Array.from({ length: copies }).map((_, idx) => (
                  <Box key={`${item.id}-${idx}`} sx={{
                    width: '50mm',
                    height: '25mm',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pageBreakAfter: 'always',
                    m: 0,
                    p: 0,
                    visibility: 'visible !important'
                  }}>
                    <Typography
                      align="center"
                      sx={{
                        fontSize: '9pt',
                        lineHeight: 1.1,
                        fontWeight: 'bold',
                        mb: 0.5,
                        maxWidth: '100%',
                        color: 'black'
                      }}
                    >
                      {item.name}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 0.5, width: '100%' }}>
                      {showQR ? (
                        <QRCodeSVG
                          value={item.code || item.codigo || ''}
                          size={65}
                          level="M"
                        />
                      ) : (
                        <Barcode
                          value={item.code || item.codigo || '000000'}
                          width={1.4}
                          height={40}
                          fontSize={10}
                          displayValue={true}
                          background="#FFFFFF"
                          margin={0}
                        />
                      )}
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '11pt',
                        lineHeight: 1,
                        color: 'black'
                      }}
                    >
                      {formatCurrency(item.price || 0)}
                    </Typography>
                  </Box>
                ))
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions className="no-print" sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={onClose} variant="outlined">
            Cerrar
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={loading}
          >
            {loading ? 'Preparando...' : 'Imprimir Todas'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LabelPreview; 