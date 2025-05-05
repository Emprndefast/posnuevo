import React, { useState } from 'react';
import {
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';

const ProfileForm = ({ 
  formData, 
  handleChange, 
  handleImageUpload, 
  handleImageDelete,
  isBusiness = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [imageLoading, setImageLoading] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('La imagen no debe superar 1MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('El archivo debe ser una imagen');
      return;
    }

    setImageLoading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      handleImageUpload(reader.result);
      setImageLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Box position="relative">
          <Avatar
            src={formData.imageUrl}
            sx={{ 
              width: 120, 
              height: 120, 
              mb: 2,
              cursor: 'pointer',
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                opacity: 0.8
              }
            }}
          >
            {formData.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <IconButton
              color="primary"
              component="span"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              {imageLoading ? (
                <CircularProgress size={24} />
              ) : (
                <PhotoCamera />
              )}
            </IconButton>
          </label>
          {formData.imageUrl && (
            <IconButton
              color="error"
              onClick={handleImageDelete}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <Delete />
            </IconButton>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {isBusiness ? 'Datos del Negocio' : 'Datos Personales'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={isBusiness ? "Nombre del Negocio" : "Nombre"}
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Correo Electrónico"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            variant="outlined"
            disabled={!isBusiness}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Teléfono"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Dirección"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>

        {isBusiness && (
          <>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Información Adicional
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RUC/NIT"
                name="taxId"
                value={formData.taxId || ''}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sitio Web"
                name="website"
                value={formData.website || ''}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Redes Sociales
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Facebook"
                name="socialMedia.facebook"
                value={formData.socialMedia?.facebook || ''}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Instagram"
                name="socialMedia.instagram"
                value={formData.socialMedia?.instagram || ''}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Twitter"
                name="socialMedia.twitter"
                value={formData.socialMedia?.twitter || ''}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="WhatsApp"
                name="socialMedia.whatsapp"
                value={formData.socialMedia?.whatsapp || ''}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
          </>
        )}

        {!isBusiness && (
          <>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Preferencias
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Idioma</InputLabel>
                <Select
                  name="language"
                  value={formData.language || 'es'}
                  onChange={handleChange}
                  label="Idioma"
                >
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Zona Horaria</InputLabel>
                <Select
                  name="timezone"
                  value={formData.timezone || 'America/Lima'}
                  onChange={handleChange}
                  label="Zona Horaria"
                >
                  <MenuItem value="America/Lima">Lima (GMT-5)</MenuItem>
                  <MenuItem value="America/Mexico_City">Ciudad de México (GMT-6)</MenuItem>
                  <MenuItem value="America/New_York">Nueva York (GMT-4)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifications || false}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'notifications',
                        value: e.target.checked
                      }
                    })}
                  />
                }
                label="Recibir notificaciones"
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default ProfileForm; 