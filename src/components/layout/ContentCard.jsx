import React from 'react';
import { Paper, Box, Typography, useTheme } from '@mui/material';

const ContentCard = ({
  title,
  subtitle,
  children,
  actions,
  sx = {},
  contentProps = {},
  elevation = 2
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={elevation}
      sx={{
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        ...sx
      }}
    >
      {(title || subtitle || actions) && (
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1, sm: 2 }
          }}
        >
          <Box sx={{ flex: 1 }}>
            {title && (
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 600
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: { xs: 'flex-start', sm: 'flex-end' }
              }}
            >
              {actions}
            </Box>
          )}
        </Box>
      )}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          ...contentProps
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default ContentCard; 