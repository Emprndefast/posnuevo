import React from 'react';
import { Card, CardContent, CardHeader, Typography, IconButton, Divider, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

const StatCard = ({ title, subheader, value, icon: Icon, color = 'primary', trend }) => {
  // Definir gradientes y colores para cada tipo
  const colorSchemes = {
    primary: {
      gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      iconBg: '#90CAF9',
      textColor: '#fff'
    },
    success: {
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
      iconBg: '#A5D6A7',
      textColor: '#fff'
    },
    warning: {
      gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      iconBg: '#FFCC80',
      textColor: '#fff'
    },
    info: {
      gradient: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
      iconBg: '#80DEEA',
      textColor: '#fff'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.primary;

  return (
    <Card
      sx={{
        height: '100%',
        background: scheme.gradient,
        borderRadius: '16px',
        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px 0 rgba(0,0,0,0.15)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 60%)',
        }
      }}
    >
      <CardContent sx={{ position: 'relative', p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          {Icon && (
            <Box
              sx={{
                backgroundColor: scheme.iconBg,
                borderRadius: '12px',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon sx={{ color: scheme.gradient.split('gradient(')[1].split(' ')[2], fontSize: '1.75rem' }} />
            </Box>
          )}
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: scheme.textColor,
                fontWeight: 600,
                fontSize: '1rem',
                mb: 0.5,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {title}
            </Typography>
            {subheader && (
              <Typography
                variant="caption"
                sx={{
                  color: alpha(scheme.textColor, 0.8),
                  fontSize: '0.75rem'
                }}
              >
                {subheader}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Typography
            variant="h4"
            sx={{
              color: scheme.textColor,
              fontWeight: 700,
              lineHeight: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {value}
          </Typography>
          {trend !== undefined && (
            <Typography
              variant="body2"
              sx={{
                color: scheme.textColor,
                display: 'flex',
                alignItems: 'center',
                fontWeight: 500,
                backgroundColor: alpha(trend >= 0 ? '#4CAF50' : '#F44336', 0.2),
                px: 1,
                py: 0.5,
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;