import React, { useState, useEffect } from 'react';
import promotionService from '../services/promotionService';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, LocalOffer, Event, CheckCircle, Cancel } from '@mui/icons-material';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    value: '',
    startDate: '',
    endDate: '',
    products: [],
    categories: [],
    isActive: true
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionService.getPromotions();
      setPromotions(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al cargar promociones', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedPromotion) {
        await promotionService.updatePromotion(selectedPromotion.id, formData);
        setSnackbar({ open: true, message: 'Promoción actualizada', severity: 'success' });
      } else {
        await promotionService.createPromotion(formData);
        setSnackbar({ open: true, message: 'Promoción creada', severity: 'success' });
      }
      handleCloseDialog();
      loadPromotions();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al guardar promoción', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      name: promotion.name,
      type: promotion.type,
      value: promotion.value,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      products: promotion.products || [],
      categories: promotion.categories || [],
      isActive: promotion.isActive
    });
    setOpenDialog(true);
  };

  const handleDelete = async (promotionId) => {
    if (window.confirm('¿Está seguro de eliminar esta promoción?')) {
      try {
        setLoading(true);
        await promotionService.deletePromotion(promotionId);
        setSnackbar({ open: true, message: 'Promoción eliminada', severity: 'success' });
        loadPromotions();
      } catch (error) {
        setSnackbar({ open: true, message: 'Error al eliminar promoción', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenDialog = () => {
    setSelectedPromotion(null);
    setFormData({
      name: '',
      type: '',
      value: '',
      startDate: '',
      endDate: '',
      products: [],
      categories: [],
      isActive: true
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPromotion(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getPromotionTypeLabel = (type) => {
    switch (type) {
      case 'percentage':
        return 'Porcentaje';
      case 'fixed':
        return 'Monto Fijo';
      case 'buyXgetY':
        return 'Compre X Lleve Y';
      default:
        return type;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Promociones y Descuentos
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          startIcon={<LocalOffer />}
          sx={{ fontWeight: 'bold', boxShadow: 2 }}
        >
          Crear Promoción
        </Button>
      </Box>
      <Grid container spacing={3}>
        {promotions.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">No hay promociones registradas.</Alert>
          </Grid>
        )}
        {promotions.map(promotion => (
          <Grid item xs={12} md={6} lg={4} key={promotion.id}>
            <Card sx={{ boxShadow: 3, borderRadius: 3, position: 'relative' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocalOffer color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {promotion.name}
                  </Typography>
                  <Tooltip title={promotion.isActive ? 'Activa' : 'Inactiva'}>
                    <Chip
                      label={promotion.isActive ? 'Activa' : 'Inactiva'}
                      color={promotion.isActive ? 'success' : 'error'}
                      size="small"
                      icon={promotion.isActive ? <CheckCircle /> : <Cancel />}
                      sx={{ ml: 2 }}
                    />
                  </Tooltip>
                </Box>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Tipo: {getPromotionTypeLabel(promotion.type)}
                </Typography>
                <Typography variant="h5" color="primary" mb={1}>
                  {promotion.type === 'percentage'
                    ? `${promotion.value}%`
                    : `$${promotion.value}`}
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <Event sx={{ mr: 1 }} fontSize="small" />
                  <Typography variant="body2">
                    {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Tooltip title="Editar">
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(promotion)}
                    color="primary"
                  >
                    Editar
                  </Button>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(promotion.id)}
                    color="error"
                  >
                    Eliminar
                  </Button>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPromotion ? 'Editar Promoción' : 'Crear Promoción'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Promoción</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="percentage">Porcentaje</MenuItem>
                    <MenuItem value="fixed">Monto Fijo</MenuItem>
                    <MenuItem value="buyXgetY">Compre X Lleve Y</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Valor"
                  name="value"
                  type="number"
                  value={formData.value}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fecha de Inicio"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fecha de Fin"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {selectedPromotion ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Promotions; 