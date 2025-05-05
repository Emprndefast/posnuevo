import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { PhotoCamera, Save, Business, Delete } from '@mui/icons-material';
import ConfigCard from '../ConfigCard';

const BusinessInfoCard = ({ 
  businessInfo, 
  onSave, 
  onImageChange 
}) => {
  const [info, setInfo] = useState(businessInfo || {
    nombreNegocio: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    logo: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (businessInfo) {
      setInfo(businessInfo);
      if (businessInfo.logo) {
        setImagePreview(businessInfo.logo);
      }
    }
  }, [businessInfo]);

  const validateField = (name, value) => {
    switch (name) {
      case 'nombreNegocio':
        return value.trim().length < 3 ? 'El nombre debe tener al menos 3 caracteres' : '';
      case 'ruc':
        return !/^\d{11}$/.test(value) ? 'El RUC debe tener 11 dígitos' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email inválido' : '';
      case 'telefono':
        return !/^\d{9}$/.test(value) ? 'El teléfono debe tener 9 dígitos' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    setInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          logo: 'La imagen no debe superar los 5MB'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setInfo(prev => ({
          ...prev,
          logo: reader.result
        }));
        if (onImageChange) onImageChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // Validar todos los campos
    const newErrors = {};
    Object.keys(info).forEach(key => {
      const error = validateField(key, info[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(info);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setInfo(prev => ({
      ...prev,
      logo: ''
    }));
  };

  return (
    <ConfigCard
      icon={Business}
      title="Información del Negocio"
      iconColor="info.main"
    >
      <Box sx={{ width: '100%', mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Paper
            elevation={3}
            sx={{
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              mb: 2
            }}
          >
            {imagePreview ? (
              <>
                <Avatar
                  src={imagePreview}
                  sx={{ width: '100%', height: '100%' }}
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </>
            ) : (
              <Avatar sx={{ width: '100%', height: '100%' }}>
                <Business sx={{ fontSize: 60 }} />
              </Avatar>
            )}
          </Paper>
          
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="logo-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="logo-upload">
            <Tooltip title="Cambiar logo">
              <IconButton 
                color="primary" 
                component="span"
                disabled={isSaving}
              >
                <PhotoCamera />
              </IconButton>
            </Tooltip>
          </label>
          <Typography variant="caption" color="text.secondary">
            Logo del negocio (máx. 5MB)
          </Typography>
          {errors.logo && (
            <Typography variant="caption" color="error">
              {errors.logo}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nombre del Negocio"
              name="nombreNegocio"
              value={info.nombreNegocio}
              onChange={handleChange}
              fullWidth
              margin="dense"
              error={!!errors.nombreNegocio}
              helperText={errors.nombreNegocio}
              disabled={isSaving}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="RUC"
              name="ruc"
              value={info.ruc}
              onChange={handleChange}
              fullWidth
              margin="dense"
              error={!!errors.ruc}
              helperText={errors.ruc}
              disabled={isSaving}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Teléfono"
              name="telefono"
              value={info.telefono}
              onChange={handleChange}
              fullWidth
              margin="dense"
              error={!!errors.telefono}
              helperText={errors.telefono}
              disabled={isSaving}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Dirección"
              name="direccion"
              value={info.direccion}
              onChange={handleChange}
              fullWidth
              margin="dense"
              error={!!errors.direccion}
              helperText={errors.direccion}
              disabled={isSaving}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Correo Electrónico"
              name="email"
              value={info.email}
              onChange={handleChange}
              fullWidth
              margin="dense"
              error={!!errors.email}
              helperText={errors.email}
              disabled={isSaving}
              required
            />
          </Grid>
        </Grid>

        {errors.submit && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
            onClick={handleSave}
            disabled={isSaving || Object.keys(errors).length > 0}
          >
            {isSaving ? 'Guardando...' : 'Guardar Información'}
          </Button>
        </Box>
      </Box>
    </ConfigCard>
  );
};

export default BusinessInfoCard; 