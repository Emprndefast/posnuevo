import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Avatar,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import api from '../../../api/api';
import { useBusiness } from '../../../context/BusinessContext';

const EmpresaConfigModal = ({ onClose }) => {
  const { businessData, saveBusinessData } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    rnc: '',
    direccion: '',
    telefono: '',
    email: '',
    website: '',
    logo: '',
    moneda: 'DOP',
    impuesto: 18
  });

  useEffect(() => {
    if (businessData) {
      setFormData(prev => ({
        ...prev,
        ...businessData
      }));
      if (businessData.logo) {
        setLogoPreview(businessData.logo);
      }
    }
  }, [businessData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setSnackbar({ open: true, message: 'Por favor selecciona una imagen válida', severity: 'error' });
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: 'La imagen no debe superar 5MB', severity: 'error' });
      return;
    }

    try {
      setUploadingLogo(true);

      // Crear preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Subir a Cloudinary
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await api.post('/upload/file', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.url) {
        setFormData(prev => ({
          ...prev,
          logo: response.data.url
        }));
        setSnackbar({ open: true, message: 'Logo cargado exitosamente', severity: 'success' });
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      setSnackbar({ open: true, message: 'Error al cargar el logo', severity: 'error' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: ''
    }));
    setLogoPreview(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const success = await saveBusinessData(formData);

      if (success) {
        setSnackbar({ open: true, message: 'Configuración guardada correctamente', severity: 'success' });
      } else {
        setError('Error al guardar la configuración');
      }

      setSaving(false);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Error al guardar la configuración');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Datos del Negocio
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Sección de Logo */}
      <Card sx={{ mb: 3, backgroundColor: 'rgba(0,0,0,0.02)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Logo de la Empresa
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            {/* Preview del logo */}
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                src={logoPreview || formData.logo}
                alt="Logo"
                sx={{
                  width: 120,
                  height: 120,
                  border: '2px dashed',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper'
                }}
                variant="rounded"
              >
                {!logoPreview && !formData.logo && 'LOGO'}
              </Avatar>
            </Box>

            {/* Botones de acción */}
            <Box sx={{ flex: 1 }}>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={uploadingLogo ? <CircularProgress size={20} /> : <CloudUpload />}
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? 'Subiendo...' : (formData.logo ? 'Cambiar Logo' : 'Subir Logo')}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </Button>
                {(logoPreview || formData.logo) && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleRemoveLogo}
                  >
                    Eliminar Logo
                  </Button>
                )}
                <Typography variant="caption" color="text.secondary">
                  Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
                </Typography>
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Nombre de la empresa"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="RNC / Identificación Fiscal"
            name="rnc"
            value={formData.rnc}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Correo electrónico"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Sitio web"
            name="website"
            value={formData.website}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="Moneda"
            name="moneda"
            value={formData.moneda}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="% Impuesto (ITBIS)"
            name="impuesto"
            type="number"
            value={formData.impuesto}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ minWidth: 120 }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
        </Button>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EmpresaConfigModal; 