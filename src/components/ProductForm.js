import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import cloudinary from '../config/cloudinary';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ProductForm = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      setImageUrl(data.secure_url);
    } catch (error) {
      console.error('Error al cargar la imagen:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmitForm = (data) => {
    onSubmit({ ...data, imageUrl });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitForm)} sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <TextField
        fullWidth
        label="Nombre del Producto"
        {...register('name', { required: 'Este campo es requerido' })}
        error={!!errors.name}
        helperText={errors.name?.message}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Código"
        {...register('code', { required: 'Este campo es requerido' })}
        error={!!errors.code}
        helperText={errors.code?.message}
        margin="normal"
      />

      <TextField
        fullWidth
        type="number"
        label="Precio"
        {...register('price', { required: 'Este campo es requerido' })}
        error={!!errors.price}
        helperText={errors.price?.message}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Categoría"
        {...register('category', { required: 'Este campo es requerido' })}
        error={!!errors.category}
        helperText={errors.category?.message}
        margin="normal"
      />

      <TextField
        fullWidth
        type="number"
        label="Stock Actual"
        {...register('currentStock', { required: 'Este campo es requerido' })}
        error={!!errors.currentStock}
        helperText={errors.currentStock?.message}
        margin="normal"
      />

      <TextField
        fullWidth
        type="number"
        label="Stock Mínimo"
        {...register('minStock')}
        margin="normal"
      />

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Descripción"
        {...register('description')}
        margin="normal"
      />

      <Box sx={{ mt: 3, mb: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#f5f5f5',
            border: '2px dashed #9e9e9e',
            '&:hover': {
              backgroundColor: '#eeeeee',
            },
          }}
          onClick={() => document.getElementById('product-image').click()}
        >
          <input
            type="file"
            id="product-image"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: '#757575', mb: 1 }} />
          <Typography variant="body1" color="textSecondary">
            {isUploading ? 'Subiendo imagen...' : 'Haz clic o arrastra una imagen aquí'}
          </Typography>
          {imageUrl && (
            <Box sx={{ mt: 2 }}>
              <AdvancedImage
                cldImg={cloudinary.image(imageUrl)}
                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
              />
            </Box>
          )}
        </Paper>
      </Box>

      <Button
        fullWidth
        variant="contained"
        type="submit"
        disabled={isUploading}
        sx={{ mt: 2 }}
      >
        Guardar Producto
      </Button>
    </Box>
  );
};

export default ProductForm; 