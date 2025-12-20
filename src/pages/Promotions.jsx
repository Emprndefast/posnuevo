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
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalOffer,
  Event,
  CheckCircle,
  Cancel,
  Add as AddIcon
} from '@mui/icons-material';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'DESCUENTO_FIJO',
    descuentoFijo: 0,
    descuentoPorcentaje: 0,
    montoMinimo: 0,
    codigo: '',
    usosMaximos: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    horaInicio: '',
    horaFin: '',
    activa: true,
    aplicaEnLinea: true,
    aplicaEnTienda: true
  });

  useEffect(() => {
    loadPromotions();
    loadStats();
  }, [page]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionService.getPromotions(page, 10);
      setPromotions(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al cargar promociones', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await promotionService.getPromotionStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedPromotion) {
        await promotionService.updatePromotion(selectedPromotion._id, formData);
        setSnackbar({ open: true, message: 'Promoción actualizada', severity: 'success' });
      } else {
        await promotionService.createPromotion(formData);
        setSnackbar({ open: true, message: 'Promoción creada', severity: 'success' });
      }
      handleCloseDialog();
      loadPromotions();
      loadStats();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al guardar promoción', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      nombre: promotion.nombre,
      descripcion: promotion.descripcion || '',
      tipo: promotion.tipo,
      descuentoFijo: promotion.descuentoFijo || 0,
      descuentoPorcentaje: promotion.descuentoPorcentaje || 0,
      montoMinimo: promotion.montoMinimo || 0,
      codigo: promotion.codigo || '',
      usosMaximos: promotion.usosMaximos || '',
      fechaInicio: promotion.fechaInicio?.split('T')[0],
      fechaFin: promotion.fechaFin?.split('T')[0],
      horaInicio: promotion.horaInicio || '',
      horaFin: promotion.horaFin || '',
      activa: promotion.activa,
      aplicaEnLinea: promotion.aplicaEnLinea,
      aplicaEnTienda: promotion.aplicaEnTienda
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
        loadStats();
      } catch (error) {
        setSnackbar({ open: true, message: 'Error al eliminar promoción', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggle = async (promotionId) => {
    try {
      await promotionService.togglePromotion(promotionId);
      loadPromotions();
      loadStats();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al cambiar estado', severity: 'error' });
    }
  };

  const handleOpenDialog = () => {
    setSelectedPromotion(null);
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: 'DESCUENTO_FIJO',
      descuentoFijo: 0,
      descuentoPorcentaje: 0,
      montoMinimo: 0,
      codigo: '',
      usosMaximos: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      horaInicio: '',
      horaFin: '',
      activa: true,
      aplicaEnLinea: true,
      aplicaEnTienda: true
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPromotion(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getPromocionTypeBadge = (tipo) => {
    const tipos = {
      'DESCUENTO_FIJO': { label: 'Descuento Fijo', color: 'primary' },
      'DESCUENTO_PORCENTAJE': { label: 'Descuento %', color: 'secondary' },
      'COMPRA_X_LLEVA_Y': { label: 'Compre X Lleve Y', color: 'success' },
      'COMBO': { label: 'Combo', color: 'info' },
      'CUPÓN': { label: 'Cupón', color: 'warning' }
    };
    const tipo_info = tipos[tipo] || { label: tipo, color: 'default' };
    return tipo_info;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Promociones y Descuentos
          </Typography>
          {stats && (
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Chip label={`Total: ${stats.total}`} color="primary" variant="outlined" />
              <Chip label={`Activas: ${stats.activas}`} color="success" variant="outlined" />
              <Chip label={`Cupones Usados: ${stats.cupones}`} color="warning" variant="outlined" />
            </Box>
          )}
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ fontWeight: 'bold', boxShadow: 2 }}
        >
          Nueva Promoción
        </Button>
      </Box>

      {/* Tabla de promociones */}
      {loading && !promotions.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Card} sx={{ boxShadow: 2 }}>
          {promotions.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="info">No hay promociones registradas.</Alert>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Descuento</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Período</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promotions.map((promo) => {
                  const tipoBadge = getPromocionTypeBadge(promo.tipo);
                  return (
                    <TableRow key={promo._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{promo.nombre}</TableCell>
                      <TableCell>
                        <Chip
                          label={tipoBadge.label}
                          size="small"
                          color={tipoBadge.color}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {promo.descuentoFijo > 0 && `$${promo.descuentoFijo.toFixed(2)}`}
                        {promo.descuentoPorcentaje > 0 && `${promo.descuentoPorcentaje}%`}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ fontSize: '0.85rem' }}>
                          {formatDate(promo.fechaInicio)} - {formatDate(promo.fechaFin)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Switch
                          size="small"
                          checked={promo.activa}
                          onChange={() => handleToggle(promo._id)}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Tooltip title="Editar">
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(promo)}
                            startIcon={<EditIcon />}
                          >
                            Editar
                          </Button>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDelete(promo._id)}
                            startIcon={<DeleteIcon />}
                          >
                            Eliminar
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}

      {/* Dialog para crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPromotion ? 'Editar Promoción' : 'Nueva Promoción'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />

          <FormControl fullWidth>
            <InputLabel>Tipo de Promoción</InputLabel>
            <Select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              label="Tipo de Promoción"
            >
              <MenuItem value="DESCUENTO_FIJO">Descuento Fijo</MenuItem>
              <MenuItem value="DESCUENTO_PORCENTAJE">Descuento Porcentaje</MenuItem>
              <MenuItem value="COMPRA_X_LLEVA_Y">Compra X Lleva Y</MenuItem>
              <MenuItem value="COMBO">Combo</MenuItem>
              <MenuItem value="CUPÓN">Cupón</MenuItem>
            </Select>
          </FormControl>

          {formData.tipo === 'DESCUENTO_FIJO' && (
            <TextField
              label="Monto Descuento ($)"
              name="descuentoFijo"
              type="number"
              value={formData.descuentoFijo}
              onChange={handleChange}
              fullWidth
              inputProps={{ step: '0.01' }}
            />
          )}

          {formData.tipo === 'DESCUENTO_PORCENTAJE' && (
            <TextField
              label="Porcentaje Descuento (%)"
              name="descuentoPorcentaje"
              type="number"
              value={formData.descuentoPorcentaje}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0, max: 100 }}
            />
          )}

          {formData.tipo === 'CUPÓN' && (
            <TextField
              label="Código de Cupón"
              name="codigo"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
              fullWidth
              required
            />
          )}

          <TextField
            label="Monto Mínimo de Compra ($)"
            name="montoMinimo"
            type="number"
            value={formData.montoMinimo}
            onChange={handleChange}
            fullWidth
            inputProps={{ step: '0.01' }}
          />

          <TextField
            label="Fecha Inicio"
            name="fechaInicio"
            type="date"
            value={formData.fechaInicio}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            label="Fecha Fin"
            name="fechaFin"
            type="date"
            value={formData.fechaFin}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <TextField
              label="Hora Inicio"
              name="horaInicio"
              type="time"
              value={formData.horaInicio}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hora Fin"
              name="horaFin"
              type="time"
              value={formData.horaFin}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                name="activa"
                checked={formData.activa}
                onChange={handleChange}
              />
            }
            label="Activa"
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  name="aplicaEnLinea"
                  checked={formData.aplicaEnLinea}
                  onChange={handleChange}
                />
              }
              label="Aplica En Línea"
            />
            <FormControlLabel
              control={
                <Switch
                  name="aplicaEnTienda"
                  checked={formData.aplicaEnTienda}
                  onChange={handleChange}
                />
              }
              label="Aplica En Tienda"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {selectedPromotion ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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