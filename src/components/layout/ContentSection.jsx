import React from 'react';
import { Box, Grid, useTheme, useMediaQuery } from '@mui/material';

const ContentSection = ({
  children,
  columns = 1,
  spacing = 2,
  sx = {},
  itemProps = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const getResponsiveColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return Math.min(2, columns);
    return columns;
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Grid
        container
        spacing={spacing}
        sx={{
          width: '100%',
          margin: 0
        }}
      >
        {React.Children.map(children, (child) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={12 / getResponsiveColumns()}
            sx={{
              p: 0,
              ...itemProps
            }}
          >
            {child}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ContentSection; 