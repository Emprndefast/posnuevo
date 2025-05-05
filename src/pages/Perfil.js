import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Container,
  Grid,
  Divider,
  TextField,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { updateProfile } from 'firebase/auth';
import { auth, storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import storageService from '../services/storageService';

const DATOS_INICIALES = {
  // Datos principales (algunos no editables)
  nombre: 'Usuario1',
  email: 'usuario1@example.com',
  fechaNacimiento: '1990-01-01',
  telefono: '123456789',
  direccion: 'Calle Principal 123',
  dni: '12345678',
  
  // Datos secundarios (todos editables)
  biografia: '',
  intereses: '',
  facebook: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  fotoUrl: '',
  sitioWeb: ''
};

const Perfil = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user: currentUser, loading: authLoading, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(DATOS_INICIALES);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setProfileData(prev => ({
            ...prev,
            ...userDoc.data()
          }));
        } else {
          // Si no existe, usar los datos iniciales
          await setDoc(doc(db, 'users', currentUser.uid), DATOS_INICIALES);
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar los datos del perfil',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);
      await setDoc(doc(db, 'users', currentUser.uid), profileData, { merge: true });
      // Solo actualizar photoURL si la URL es válida (no base64)
      if (profileData.fotoUrl && typeof profileData.fotoUrl === 'string' && profileData.fotoUrl.startsWith('http')) {
        await updateProfile(currentUser, { photoURL: profileData.fotoUrl });
        await auth.currentUser.reload();
        setUser(auth.currentUser); // Actualiza el contexto con el usuario recargado
      }
      setSnackbar({
        open: true,
        message: 'Perfil actualizado correctamente',
        severity: 'success'
      });
      setEditing(false);
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar los cambios',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'La imagen no debe superar 5MB',
        severity: 'error'
      });
      return;
    }

    try {
      // Subir a Cloudinary
      const result = await storageService.uploadProfileImage(file);
      setProfileData(prev => ({
        ...prev,
        fotoUrl: result.url
      }));
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al subir la imagen',
        severity: 'error'
      });
    }
  };

  if (loading || authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Encabezado del perfil */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Mi Perfil
          </Typography>
          <Button
            variant={editing ? "contained" : "outlined"}
            color={editing ? "primary" : "inherit"}
            startIcon={editing ? <SaveIcon /> : <EditIcon />}
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
          >
            {editing ? (saving ? 'Guardando...' : 'Guardar Cambios') : 'Editar Perfil'}
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Columna izquierda: Foto y datos principales */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={profileData.fotoUrl}
                  sx={{
                    width: 150,
                    height: 150,
                    mb: 2,
                    border: `4px solid ${theme.palette.primary.main}`
                  }}
                >
                  {profileData.nombre?.[0]?.toUpperCase()}
                </Avatar>
                {editing && (
                  <label htmlFor="icon-button-file">
                    <input
                      accept="image/*"
                      id="icon-button-file"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    <IconButton
                      color="primary"
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'background.paper'
                      }}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </label>
                )}
              </Box>
            </Box>

            {/* Datos principales no editables */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
                Datos Principales
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    disabled
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="DNI"
                    value={profileData.dni}
                    disabled
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Fecha de Nacimiento"
                    value={profileData.fechaNacimiento}
                    disabled
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Columna derecha: Datos editables */}
          <Grid item xs={12} md={8}>
            {/* Datos principales editables */}
            <Typography variant="h6" gutterBottom>
              Información Personal
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  value={profileData.nombre}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={profileData.telefono}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  name="direccion"
                  value={profileData.direccion}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Datos secundarios */}
            <Typography variant="h6" gutterBottom>
              Información Adicional
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Biografía"
                  name="biografia"
                  value={profileData.biografia}
                  onChange={handleChange}
                  disabled={!editing}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Intereses"
                  name="intereses"
                  value={profileData.intereses}
                  onChange={handleChange}
                  disabled={!editing}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Sitio Web"
                  name="sitioWeb"
                  value={profileData.sitioWeb}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Redes Sociales
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Facebook"
                  name="facebook"
                  value={profileData.facebook}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Twitter"
                  name="twitter"
                  value={profileData.twitter}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Instagram"
                  name="instagram"
                  value={profileData.instagram}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn"
                  name="linkedin"
                  value={profileData.linkedin}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Botones de acción */}
        {editing && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => setEditing(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Perfil;
