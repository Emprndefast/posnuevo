import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';

const ResponsiveLayout = ({ 
  children, 
  maxWidth = 'xl',
  sx = {},
  containerProps = {},
  contentProps = {},
  disableGutters = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLandscape = useMediaQuery('(orientation: landscape)');

  const getContainerPadding = () => {
    if (disableGutters) return 0;
    if (isMobile) return isLandscape ? 2 : 1;
    if (isTablet) return 2;
    return 3;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        ...sx
      }}
    >
      <Container
        maxWidth={maxWidth}
        disableGutters={disableGutters}
        sx={{
          flex: 1,
          py: getContainerPadding(),
          px: getContainerPadding(),
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1.5, sm: 2, md: 3 },
          overflow: 'auto',
          maxWidth: '100% !important',
          ...containerProps
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 1.5, sm: 2, md: 3 },
            flex: 1,
            width: '100%',
            maxWidth: '100%',
            ...contentProps
          }}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default ResponsiveLayout; 