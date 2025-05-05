import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  TextField,
  Grid,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { loyaltyService } from '../../services/loyaltyService';
import { useSnackbar } from '../../context/SnackbarContext';

const SaleSummary = ({ 
  subtotal, 
  customerId, 
  onCompleteSale,
  onApplyDiscount
}) => {
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [customerLevel, setCustomerLevel] = useState('Nuevo');
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      if (!customerId) return;

      try {
        const points = await loyaltyService.getPointsHistory(customerId);
        const totalPoints = points.reduce((sum, transaction) => sum + transaction.points, 0);
        const level = loyaltyService.getLoyaltyLevel(totalPoints);
        const discount = loyaltyService.calculateDiscount(level);

        setAvailablePoints(totalPoints);
        setCustomerLevel(level);
        setLoyaltyDiscount(discount);
        
        // Aplicar descuento automático basado en nivel
        if (discount > 0) {
          onApplyDiscount(subtotal * discount);
        }
      } catch (error) {
        showSnackbar('Error al cargar datos de lealtad', 'error');
      }
    };

    fetchLoyaltyData();
  }, [customerId, subtotal, onApplyDiscount, showSnackbar]);

  const handleRedeemPoints = () => {
    if (pointsToRedeem > availablePoints) {
      showSnackbar('Puntos insuficientes', 'error');
      return;
    }

    const discountAmount = pointsToRedeem * 0.01; // 1 punto = $0.01
    onApplyDiscount(discountAmount);
    showSnackbar(`Descuento aplicado: $${discountAmount.toFixed(2)}`, 'success');
  };

  const handleCompleteSale = async () => {
    try {
      // Calcular puntos a ganar (10% del subtotal)
      const pointsToEarn = loyaltyService.calculatePoints(subtotal);
      
      // Registrar puntos ganados
      if (customerId) {
        await loyaltyService.addPoints(customerId, pointsToEarn, 'sale-' + Date.now());
      }

      // Completar la venta
      onCompleteSale();
      
      if (pointsToEarn > 0) {
        showSnackbar(`¡Ganaste ${pointsToEarn} puntos!`, 'success');
      }
    } catch (error) {
      showSnackbar('Error al procesar la venta', 'error');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resumen de Venta
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Box>
          </Grid>

          {customerId && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Programa de Lealtad
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Nivel: {customerLevel} - Descuento: {loyaltyDiscount * 100}%
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    label="Puntos a canjear"
                    type="number"
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                    size="small"
                    sx={{ width: '150px' }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleRedeemPoints}
                    disabled={pointsToRedeem <= 0}
                  >
                    Canjear
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Puntos disponibles: {availablePoints}
                </Typography>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCompleteSale}
            >
              Completar Venta
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SaleSummary; 