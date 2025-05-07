import React, { useState } from 'react';
import { generateCanvaFlyer } from '../../api/canvaService';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';

const CanvaFlyerGenerator = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buyUrl, setBuyUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const flyer = await generateCanvaFlyer({ name, price, imageUrl, buyUrl });
      setResult(flyer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>Generador de Flyer Canva</Typography>
      <TextField label="Nombre del producto" fullWidth margin="normal" value={name} onChange={e => setName(e.target.value)} />
      <TextField label="Precio" fullWidth margin="normal" value={price} onChange={e => setPrice(e.target.value)} />
      <TextField label="URL de la imagen" fullWidth margin="normal" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      <TextField label="URL de compra" fullWidth margin="normal" value={buyUrl} onChange={e => setBuyUrl(e.target.value)} />
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleGenerate} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Generar Flyer'}
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {result && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="success">Flyer generado correctamente</Alert>
          {/* Ajusta esto según la respuesta real de Canva */}
          {result.image_url && <img src={result.image_url} alt="Flyer Canva" style={{ width: '100%', marginTop: 8 }} />}
          {result.url && <a href={result.url} target="_blank" rel="noopener noreferrer">Ver en Canva</a>}
        </Box>
      )}
    </Box>
  );
};

export default CanvaFlyerGenerator; 