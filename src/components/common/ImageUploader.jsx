import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import storageService from '../../services/storageService';

const ImageUploader = ({ onUploadSuccess, onUploadError, onDelete }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Validar tipo de archivo
    if (!selectedFile.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      
      const result = await storageService.uploadProductImage(file);
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      
      setUploading(false);
    } catch (err) {
      setError(err.message);
      if (onUploadError) {
        onUploadError(err);
      }
      setUploading(false);
    }
  };

  const handleDelete = () => {
    setFile(null);
    setPreviewUrl('');
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="image-upload"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="image-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            disabled={uploading}
          >
            Seleccionar Imagen
          </Button>
        </label>
        
        {file && !uploading && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
          >
            Subir Imagen
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {uploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Subiendo imagen...</Typography>
        </Box>
      )}

      {previewUrl && (
        <Box sx={{ position: 'relative', width: 'fit-content' }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
          />
          <IconButton
            onClick={handleDelete}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default ImageUploader; 