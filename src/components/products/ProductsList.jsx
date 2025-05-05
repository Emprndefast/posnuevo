import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Skeleton,
  alpha,
  useTheme,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';

const ProductsList = ({ open, onClose, products, loading, onEdit, onDelete, onPrintLabel }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleMenuClick = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleAction = (action) => {
    if (!selectedProduct) return;
    
    switch(action) {
      case 'edit':
        onEdit?.(selectedProduct);
        break;
      case 'print':
        onPrintLabel?.(selectedProduct);
        break;
      case 'delete':
        onDelete?.(selectedProduct);
        break;
      default:
        break;
    }
    handleMenuClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">
            Lista de Productos
          </Typography>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              ml: 2,
              color: 'text.secondary',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              px: 1.5,
              py: 0.5,
              borderRadius: 1
            }}
          >
            {products?.length || 0} productos
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.1),
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 2,
            boxShadow: 'none',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Código</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="rounded" width={40} height={40} />
                        <Box>
                          <Skeleton width={150} />
                          <Skeleton width={100} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} /></TableCell>
                    <TableCell align="right"><Skeleton width={60} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell align="center"><Skeleton width={40} /></TableCell>
                  </TableRow>
                ))
              ) : (
                products?.map((product) => (
                  <TableRow 
                    key={product.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {product.imageUrl ? (
                          <Avatar
                            src={product.imageUrl}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          />
                        ) : (
                          <Avatar
                            variant="rounded"
                            sx={{ 
                              width: 40, 
                              height: 40,
                              bgcolor: theme => alpha(theme.palette.primary.main, 0.1)
                            }}
                          >
                            <InventoryIcon color="primary" />
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="subtitle2">
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.description?.substring(0, 50)}
                            {product.description?.length > 50 ? '...' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.code}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: 'success.main',
                          fontWeight: 600
                        }}
                      >
                        {formatCurrency(product.price)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={product.stock}
                        size="small"
                        color={product.stock <= (product.minStock || 5) ? 'error' : 'default'}
                        sx={{ minWidth: 60, borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.category || 'Sin categoría'}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderColor: 'transparent',
                          color: 'primary.main'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.status === 'active' ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={product.status === 'active' ? 'success' : 'error'}
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, product)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver Detalles y Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('print')}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Imprimir Etiqueta</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Dialog>
  );
};

export default ProductsList; 