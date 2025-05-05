import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  MenuItem
} from '@mui/material';
import ImageUploader from '../common/ImageUploader';

const CATEGORIAS = [
  'Electrónicos',
  'Ropa',
  'Alimentos',
  'Hogar',
  'Otros'
];

const ProductForm = ({ onSubmit, initialData = {} }) => {
  const [product, setProduct] = useState({
    name: initialData.name || '',
    code: initialData.code || '',
    price: initialData.price || '',
    category: initialData.category || '',
    currentStock: initialData.currentStock || '',
    minStock: initialData.minStock || '',
    description: initialData.description || '',
    imageUrl: initialData.imageUrl || '',
    imagePath: initialData.imagePath || ''
  });

  const handleImageUpload = (result) => {
    setProduct(prev => ({
      ...prev,
      imageUrl: result.url,
      imagePath: result.path
    }));
  };

  const handleImageError = (error) => {
    console.error('Error al subir imagen:', error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(product);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {initialData.id ? 'Editar Producto' : 'Nuevo Producto'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre del producto"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Código"
              name="code"
              value={product.code}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Precio"
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
              required
              variant="outlined"
              InputProps={{
                startAdornment: <Typography>$</Typography>
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Categoría"
              name="category"
              value={product.category}
              onChange={handleChange}
              variant="outlined"
            >
              {CATEGORIAS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Stock actual"
              name="currentStock"
              type="number"
              value={product.currentStock}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Stock mínimo"
              name="minStock"
              type="number"
              value={product.minStock}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              multiline
              rows={3}
              value={product.description}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Imagen del Producto
            </Typography>
            
            {product.imageUrl && (
              <Card sx={{ mb: 2, maxWidth: 300 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.imageUrl}
                  alt={product.name}
                  sx={{ objectFit: 'contain' }}
                />
              </Card>
            )}

            <ImageUploader
              onUploadSuccess={handleImageUpload}
              onUploadError={handleImageError}
              onDelete={() => setProduct(prev => ({ ...prev, imageUrl: '', imagePath: '' }))}
              initialUrl={product.imageUrl}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography color="textSecondary" variant="body2">
                {product.imageUrl ? '✓ Imagen cargada' : '* Se recomienda agregar una imagen'}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!product.name || !product.code || !product.price || !product.currentStock}
              >
                {initialData.id ? 'Actualizar' : 'Crear'} Producto
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ProductForm; 