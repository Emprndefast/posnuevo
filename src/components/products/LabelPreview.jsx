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
    body {
      margin: 0;
      padding: 0;
      background: white;
    }
    header, footer, nav, aside, .no-print, .MuiDialog-container {
      display: none !important;
    }
    .print-only {
      display: block !important;
      position: fixed;
      left: 0;
      top: 0;
      width: 50mm;
      height: 25mm;
      z-index: 9999;
      background: white;
    }
    .label-page {
      width: 50mm;
      height: 25mm;
      display: flex !important;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      overflow: hidden;
    }
  }
`;

const LabelPreview = ({ open, onClose, product, products = [] }) => {
  const theme = useTheme();
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copies, setCopies] = useState(1);
  const [useStockCount, setUseStockCount] = useState(false);

  // Determinar qué productos imprimir
  const itemsToPrint = products.length > 0 ? products : (product ? [product] : []);

  // Calcular total real de etiquetas
  const totalLabels = itemsToPrint.reduce((acc, item) => {
    const qty = useStockCount ? (parseInt(item.stock) || 1) : copies;
    return acc + qty;
  }, 0);

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
          <Box className="no-print" sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Copias por etiqueta:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <IconButton size="small" onClick={() => { setCopies(Math.max(1, copies - 1)); setUseStockCount(false); }}>
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ px: 2, fontWeight: 'bold' }}>{useStockCount ? '--' : copies}</Typography>
                <IconButton size="small" onClick={() => { setCopies(copies + 1); setUseStockCount(false); }}>
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                id="use-stock-count"
                checked={useStockCount}
                onChange={(e) => setUseStockCount(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <Typography component="label" htmlFor="use-stock-count" variant="body2" sx={{ cursor: 'pointer' }}>
                Usar cantidad de stock actual
              </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              Total etiquetas a imprimir: {totalLabels}
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
            <Box className="print-only" sx={{ display: 'none' }}>
              {itemsToPrint.map((item) => {
                const qty = useStockCount ? (parseInt(item.stock) || 1) : copies;
                return Array.from({ length: qty }).map((_, idx) => (
                  <Box key={`${item.id}-${idx}`} className="label-page">
                    <Typography
                      align="center"
                      sx={{
                        fontSize: '9pt',
                        lineHeight: 1.1,
                        fontWeight: 'bold',
                        mb: 0.5,
                        maxWidth: '100%',
                        color: 'black',
                        wordBreak: 'break-word',
                        px: 1
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
                ));
              })}
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