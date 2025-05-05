import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';
import { Delete, Print, Paid } from '@mui/icons-material';

const RepairCard = ({ 
  reparacion, 
  onDelete, 
  onPrint, 
  onPrintLabel, 
  onMarkPaid, 
  mode 
}) => {
  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: mode === 'dark' ? '#333' : 'background.paper',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{reparacion.cliente}</Typography>
          <Chip 
            label={reparacion.pagado ? "Pagado" : "Pendiente"} 
            color={reparacion.pagado ? "success" : "warning"}
            size="small"
          />
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {reparacion.modelo}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {reparacion.problema}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="primary">
            ${reparacion.precio}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(reparacion.fecha).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          color="primary" 
          onClick={() => onMarkPaid(reparacion.id)} 
          disabled={reparacion.pagado}
          startIcon={<Paid />}
        >
          Pagado
        </Button>
        <Button 
          size="small" 
          color="error" 
          onClick={() => onDelete(reparacion.id)}
          startIcon={<Delete />}
        >
          Eliminar
        </Button>
        <Button 
          size="small" 
          onClick={() => onPrint(reparacion)}
          startIcon={<Print />}
        >
          Factura
        </Button>
        <Button 
          size="small" 
          onClick={() => onPrintLabel(reparacion)}
          startIcon={<Print />}
        >
          Etiqueta
        </Button>
      </CardActions>
    </Card>
  );
};

export default RepairCard;