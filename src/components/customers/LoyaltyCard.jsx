import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip, Grid } from '@mui/material';
import { loyaltyService } from '../../services/loyaltyService';
import { useSnackbar } from '../../context/SnackbarContext';

const LoyaltyCard = ({ customerId }) => {
  const [loyaltyData, setLoyaltyData] = useState({
    points: 0,
    level: 'Nuevo',
    nextLevelPoints: 1000,
    progress: 0
  });
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const points = await loyaltyService.getPointsHistory(customerId);
        const totalPoints = points.reduce((sum, transaction) => sum + transaction.points, 0);
        const level = loyaltyService.getLoyaltyLevel(totalPoints);
        
        // Calcular puntos necesarios para el siguiente nivel
        let nextLevelPoints;
        switch (level) {
          case 'Nuevo':
            nextLevelPoints = 1000;
            break;
          case 'Bronce':
            nextLevelPoints = 5000;
            break;
          case 'Plata':
            nextLevelPoints = 10000;
            break;
          default:
            nextLevelPoints = 0;
        }

        // Calcular progreso hacia el siguiente nivel
        const progress = nextLevelPoints > 0 
          ? (totalPoints / nextLevelPoints) * 100 
          : 100;

        setLoyaltyData({
          points: totalPoints,
          level,
          nextLevelPoints,
          progress: Math.min(progress, 100)
        });
      } catch (error) {
        showSnackbar('Error al cargar datos de lealtad', 'error');
      }
    };

    fetchLoyaltyData();
  }, [customerId, showSnackbar]);

  const getLevelColor = (level) => {
    switch (level) {
      case 'Oro':
        return '#FFD700';
      case 'Plata':
        return '#C0C0C0';
      case 'Bronce':
        return '#CD7F32';
      default:
        return '#757575';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Programa de Lealtad
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Nivel Actual:
              </Typography>
              <Chip
                label={loyaltyData.level}
                sx={{
                  backgroundColor: getLevelColor(loyaltyData.level),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Puntos Acumulados:
              </Typography>
              <Typography variant="h6" color="primary">
                {loyaltyData.points}
              </Typography>
            </Box>
          </Grid>

          {loyaltyData.level !== 'Oro' && (
            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Próximo nivel: {loyaltyData.nextLevelPoints - loyaltyData.points} puntos restantes
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={loyaltyData.progress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getLevelColor(loyaltyData.level)
                  }
                }}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Descuento actual: {loyaltyService.calculateDiscount(loyaltyData.level) * 100}%
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LoyaltyCard; 