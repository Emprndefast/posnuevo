import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { commonStyles } from '../../styles/commonStyles';

const ResponsiveTable = ({
  columns,
  data,
  emptyMessage = 'No hay datos disponibles',
  maxHeight,
  stickyHeader = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 1
        }}
      >
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  // En móviles, transformamos la tabla en tarjetas
  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map((row, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1
            }}
          >
            {columns.map((column) => (
              <Box
                key={column.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 0.5
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ minWidth: '40%' }}
                >
                  {column.label}:
                </Typography>
                <Typography
                  sx={{
                    flex: 1,
                    textAlign: 'right',
                    wordBreak: 'break-word'
                  }}
                >
                  {column.render
                    ? column.render(row[column.id], row)
                    : row[column.id]}
                </Typography>
              </Box>
            ))}
          </Paper>
        ))}
      </Box>
    );
  }

  // En desktop, mostramos la tabla normal
  return (
    <TableContainer
      component={Paper}
      sx={{
        ...commonStyles.table,
        maxHeight: maxHeight,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Table stickyHeader={stickyHeader} size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                sx={{
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  backgroundColor: theme.palette.background.paper
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                '&:nth-of-type(odd)': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    whiteSpace: column.wrap ? 'normal' : 'nowrap'
                  }}
                >
                  {column.render
                    ? column.render(row[column.id], row)
                    : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResponsiveTable; 