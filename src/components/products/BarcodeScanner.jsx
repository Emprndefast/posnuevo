import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  CameraAlt as CameraIcon,
  QrCode as QrCodeIcon,
  QrCode2 as QrCode2Icon,
} from '@mui/icons-material';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';

const BarcodeScanner = ({ open, onClose, onDetected }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [error, setError] = useState(null);
  const [hasCamera, setHasCamera] = useState(false);
  const webcamRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    if (!open) return;
    setError(null);
    setHasCamera(false);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setHasCamera(true))
      .catch(() => {
        setError('No se detectó una cámara. Por favor, conecta una cámara o usa un dispositivo con cámara.');
        setHasCamera(false);
      });
    return () => {
      codeReader.current.reset();
    };
  }, [open]);

  useEffect(() => {
    let scanInterval;
    if (open && hasCamera && webcamRef.current) {
      scanInterval = setInterval(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
          codeReader.current
            .decodeFromImage(undefined, imageSrc)
            .then(result => {
              if (result) {
                onDetected(result.text);
                clearInterval(scanInterval);
              }
            })
            .catch(() => {
              // Ignorar errores de lectura - seguir escaneando
            });
        }
      }, 500);
    }
    return () => {
      if (scanInterval) {
        clearInterval(scanInterval);
      }
    };
  }, [open, hasCamera, onDetected]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
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
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6">Escanear Código</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<QrCodeIcon />} label="Código QR" />
        <Tab icon={<QrCode2Icon />} label="Código de Barras" />
      </Tabs>

      <DialogContent>
        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box sx={{ position: 'relative', width: '100%', mt: 2 }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Typography variant="body1" color="text.secondary" align="center">
                {selectedTab === 0 
                  ? "Coloca el código QR frente a la cámara"
                  : "Coloca el código de barras frente a la cámara"}
              </Typography>
              
              <Box 
                sx={{ 
                  width: '100%',
                  height: 300,
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 2,
                  bgcolor: 'black'
                }}
              >
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "environment"
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: selectedTab === 0 ? '200px' : '280px',
                    height: selectedTab === 0 ? '200px' : '100px',
                    border: '2px solid #fff',
                    borderRadius: selectedTab === 0 ? 2 : 1,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                  }}
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                Asegúrate de que el código esté bien iluminado y centrado
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanner; 