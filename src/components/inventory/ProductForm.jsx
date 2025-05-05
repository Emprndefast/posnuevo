import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  PhotoCamera,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  QrCode as BarcodeIcon,
  LocalOffer as TagIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useFirebase } from '../../hooks/useFirebase';
import { COLLECTIONS } from '../../constants';

const ProductForm = ({ product = null, onSave, onCancel }) => {
  const { darkMode } = useTheme();
  const { uploadFile, loading, error } = useFirebase();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    barcode: '',
    price: '',
    cost: '',
    quantity: '',
    minStock: '',
    category: '',
    location: '',
    description: '',
    photo: '',
    tags: [],
    dateAdded: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    supplier: '',
    unit: 'unidad',
    taxRate: '0',
    status: 'active',
    notes: '',
    warranty: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: ''
    }
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [categories, setCategories] = useState([
    'Electrónicos',
    'Repuestos',
    'Accesorios',
    'Herramientas',
    'Otros',
  ]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        dateAdded: product.dateAdded || new Date().toISOString(),
        lastModified: new Date().toISOString(),
      });
    } else {
      setFormData({
        name: '',
        code: '',
        barcode: '',
        price: '',
        cost: '',
        quantity: '',
        minStock: '',
        category: '',
        location: '',
        description: '',
        photo: '',
        tags: [],
        dateAdded: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        supplier: '',
        unit: 'unidad',
        taxRate: '0',
        status: 'active',
        notes: '',
        warranty: '',
        dimensions: {
          length: '',
          width: '',
          height: '',
          weight: ''
        }
      });
    }
    setPhotoFile(null);
    setValidationErrors({});
    setNewTag('');
    setIsDirty(false);
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setIsDirty(true);
    
    if (name === 'photo' && files && files[0]) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({
          ...prev,
          photo: 'La imagen no debe superar los 5MB'
        }));
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({ ...prev, photo: ev.target.result }));
      };
      reader.readAsDataURL(file);
    } else if (name.includes('dimensions.')) {
      const dimensionField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionField]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.code.trim()) errors.code = 'El código es requerido';
    if (!formData.price || formData.price <= 0) errors.price = 'El precio debe ser mayor a 0';
    if (!formData.cost || formData.cost < 0) errors.cost = 'El costo no puede ser negativo';
    if (!formData.quantity || formData.quantity < 0) errors.quantity = 'La cantidad no puede ser negativa';
    if (!formData.minStock || formData.minStock < 0) errors.minStock = 'El stock mínimo no puede ser negativo';
    if (!formData.category) errors.category = 'La categoría es requerida';
    if (formData.barcode && !/^\d+$/.test(formData.barcode)) {
      errors.barcode = 'El código de barras debe contener solo números';
    }
    if (formData.taxRate && (formData.taxRate < 0 || formData.taxRate > 100)) {
      errors.taxRate = 'El porcentaje de impuesto debe estar entre 0 y 100';
    }
    if (formData.dimensions.weight && formData.dimensions.weight < 0) {
      errors['dimensions.weight'] = 'El peso no puede ser negativo';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      let photoURL = formData.photo;
      
      if (photoFile) {
        photoURL = await uploadFile(`productos/${Date.now()}_${formData.name}`, photoFile);
      }
      
      const productData = {
        ...formData,
        photo: photoURL,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        quantity: parseInt(formData.quantity),
        minStock: parseInt(formData.minStock),
        taxRate: parseFloat(formData.taxRate),
        dimensions: {
          ...formData.dimensions,
          weight: formData.dimensions.weight ? parseFloat(formData.dimensions.weight) : null,
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : null,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : null,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : null,
        }
      };
      
      await onSave(productData);
      setIsDirty(false);
    } catch (err) {
      console.error('Error al guardar el producto:', err);
      setValidationErrors(prev => ({
        ...prev,
        submit: 'Error al guardar el producto. Por favor, intente nuevamente.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: '' }));
    setPhotoFile(null);
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('¿Está seguro de que desea cancelar? Los cambios no guardados se perderán.')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        {/* Información básica */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Información básica
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre del producto"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Código"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            error={!!validationErrors.code}
            helperText={validationErrors.code}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Código de barras"
            name="barcode"
            value={formData.barcode}
            onChange={handleInputChange}
            error={!!validationErrors.barcode}
            helperText={validationErrors.barcode}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Categoría"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            error={!!validationErrors.category}
            helperText={validationErrors.category}
            required
          />
        </Grid>
        
        {/* Precios y stock */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Precios y stock
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Precio"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            error={!!validationErrors.price}
            helperText={validationErrors.price}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Costo"
            name="cost"
            type="number"
            value={formData.cost}
            onChange={handleInputChange}
            error={!!validationErrors.cost}
            helperText={validationErrors.cost}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Cantidad"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            error={!!validationErrors.quantity}
            helperText={validationErrors.quantity}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Stock mínimo"
            name="minStock"
            type="number"
            value={formData.minStock}
            onChange={handleInputChange}
            error={!!validationErrors.minStock}
            helperText={validationErrors.minStock}
            required
          />
        </Grid>
        
        {/* Información adicional */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Información adicional
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Proveedor"
            name="supplier"
            value={formData.supplier}
            onChange={handleInputChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Unidad"
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            select
          >
            <MenuItem value="unidad">Unidad</MenuItem>
            <MenuItem value="kg">Kilogramo</MenuItem>
            <MenuItem value="l">Litro</MenuItem>
            <MenuItem value="m">Metro</MenuItem>
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Impuesto (%)"
            name="taxRate"
            type="number"
            value={formData.taxRate}
            onChange={handleInputChange}
            error={!!validationErrors.taxRate}
            helperText={validationErrors.taxRate}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Garantía"
            name="warranty"
            value={formData.warranty}
            onChange={handleInputChange}
            placeholder="Ej: 12 meses"
          />
        </Grid>
        
        {/* Dimensiones */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Dimensiones
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Largo (cm)"
            name="dimensions.length"
            type="number"
            value={formData.dimensions.length}
            onChange={handleInputChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Ancho (cm)"
            name="dimensions.width"
            type="number"
            value={formData.dimensions.width}
            onChange={handleInputChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Alto (cm)"
            name="dimensions.height"
            type="number"
            value={formData.dimensions.height}
            onChange={handleInputChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Peso (kg)"
            name="dimensions.weight"
            type="number"
            value={formData.dimensions.weight}
            onChange={handleInputChange}
            error={!!validationErrors['dimensions.weight']}
            helperText={validationErrors['dimensions.weight']}
          />
        </Grid>
        
        {/* Descripción y notas */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Descripción y notas
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notas"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            multiline
            rows={2}
          />
        </Grid>
        
        {/* Foto del producto */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Foto del producto
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('photo-input').click()}
          >
            {formData.photo ? (
              <Box sx={{ position: 'relative' }}>
                <img
                  src={formData.photo}
                  alt="Producto"
                  style={{ maxWidth: '100%', maxHeight: 200 }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto();
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ) : (
              <Box>
                <PhotoCamera sx={{ fontSize: 40, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Haz clic para subir una foto
                </Typography>
              </Box>
            )}
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleInputChange}
            />
          </Box>
        </Grid>
        
        {/* Botones de acción */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm; 