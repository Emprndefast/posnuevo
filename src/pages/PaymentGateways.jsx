import React, { useState, useEffect } from 'react';
import paymentGatewayService from '../services/paymentGatewayService';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import { CreditCard, Payment, VerifiedUser, ErrorOutline, AddCircle, InfoOutlined } from '@mui/icons-material';

const PaymentGateways = () => {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    apiKey: '',
    secretKey: '',
    isActive: true
  });

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    try {
      setLoading(true);
      const data = await paymentGatewayService.getPaymentGateways();
      setGateways(data);
    } catch (error) {
      console.error('Error al cargar pasarelas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await paymentGatewayService.configurePaymentGateway(formData);
      setFormData({
        name: '',
        type: '',
        apiKey: '',
        secretKey: '',
        isActive: true
      });
      loadGateways();
    } catch (error) {
      console.error('Error al configurar pasarela:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Pasarelas de Pago
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configurar Nueva Pasarela
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
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
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value="stripe">Stripe</MenuItem>
                        <MenuItem value="paypal">PayPal</MenuItem>
                        <MenuItem value="mercadopago">MercadoPago</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="API Key"
                      name="apiKey"
                      value={formData.apiKey}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Secret Key"
                      name="secretKey"
                      value={formData.secretKey}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                    >
                      Guardar Configuración
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pasarelas Configuradas
              </Typography>
              {gateways.length === 0 ? (
                <Alert severity="info" sx={{ my: 2 }}>
                  No hay pasarelas configuradas aún.
                </Alert>
              ) : gateways.map(gateway => (
                <Card key={gateway.id} sx={{ mb: 2, borderLeft: `6px solid ${gateway.isActive ? '#43a047' : '#e53935'}` }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {gateway.type === 'stripe' && <CreditCard color="primary" />}
                        {gateway.type === 'paypal' && <Payment color="info" />}
                        {gateway.type === 'mercadopago' && <VerifiedUser color="secondary" />}
                        {gateway.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tipo: {gateway.type.charAt(0).toUpperCase() + gateway.type.slice(1)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={gateway.isActive ? 'Activo' : 'Inactivo'}
                        color={gateway.isActive ? 'success' : 'error'}
                        icon={gateway.isActive ? <VerifiedUser /> : <ErrorOutline />}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentGateways; 