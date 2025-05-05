import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
} from '@mui/material';
import {
  Edit,
  Delete,
  Print,
  Warning,
  ShoppingCart,
} from '@mui/icons-material';
import Barcode from 'react-barcode';

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onPrintLabel,
  onSale,
  darkMode,
}) => {
  const isLowStock = product.quantity < product.minStock;

  return (
    <Card
      sx={{
        bgcolor: darkMode ? '#333' : '#fff',
        borderRadius: '12px',
        boxShadow: isLowStock ? '0 0 10px rgba(255, 0, 0, 0.2)' : 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            {product.name}
          </Typography>
          {isLowStock && (
            <Chip
              icon={<Warning />}
              label="Stock Bajo"
              color="warning"
              size="small"
            />
          )}
        </Box>

        <Typography color="text.secondary" gutterBottom>
          Categoría: {product.category}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
          <Typography variant="h5" color="primary">
            ${product.price}
          </Typography>
          <Chip
            label={`Stock: ${product.quantity}`}
            color={isLowStock ? 'error' : 'success'}
          />
        </Box>

        <Box mt={2} mb={1}>
          <Barcode
            value={product.id}
            height={30}
            width={1.2}
            displayValue={false}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box>
          <IconButton 
            size="small" 
            onClick={() => onEdit(product)}
            color="primary"
          >
            <Edit />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => onDelete(product.id)}
            color="error"
          >
            <Delete />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => onPrintLabel(product)}
          >
            <Print />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={() => onSale(product.id, 1)}
          size="small"
        >
          Vender
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;