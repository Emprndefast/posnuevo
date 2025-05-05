import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const SetupProgress = ({ step, totalSteps }) => {
  // Asegura que el paso nunca sea mayor que el total
  const safeStep = Math.min(step, totalSteps);
  const progress = Math.min((safeStep / totalSteps) * 100, 100);

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Progreso
      </Typography>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
};

export default SetupProgress; 