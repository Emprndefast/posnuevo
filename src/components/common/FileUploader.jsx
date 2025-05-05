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

const FileUploader = ({
  onUploadComplete,
  onDelete,
  initialUrl,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  path = 'uploads/'
}) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > maxSize) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${maxSize / 1024 / 1024}MB`);
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
      
      const fileName = `${path}${Date.now()}-${file.name}`;
      const url = await storageService.uploadFile(file, fileName);
      
      onUploadComplete(url);
      setUploading(false);
    } catch (err) {
      setError('Error al subir el archivo. Por favor, inténtalo de nuevo.');
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (previewUrl) {
        const urlParts = previewUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        await storageService.deleteFile(`${path}${fileName}`);
        setPreviewUrl('');
        setFile(null);
        onDelete();
      }
    } catch (err) {
      setError('Error al eliminar el archivo.');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <input
          accept={accept}
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            disabled={uploading}
          >
            Seleccionar Archivo
          </Button>
        </label>
        
        {file && !uploading && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
          >
            Subir
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
          <Typography>Subiendo archivo...</Typography>
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

export default FileUploader; 