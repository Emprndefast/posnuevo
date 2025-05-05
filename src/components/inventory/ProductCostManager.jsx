import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ProductCostManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editedCost, setEditedCost] = useState('');
  const { user } = useAuth();
  const { darkMode } = useTheme();

  useEffect(() => {
    fetchProducts();
  }, [user.uid]);

  const fetchProducts = async () => {
    try {
      const q = query(
        collection(db, 'inventory'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        margin: calculateMargin(doc.data().price, doc.data().cost),
      }));
      setProducts(productsData);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los productos');
      setLoading(false);
    }
  };

  const calculateMargin = (price, cost) => {
    if (!cost || cost === 0) return 0;
    return ((price - cost) / price * 100).toFixed(2);
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setEditedCost(product.cost || '');
    setEditDialog(true);
  };

  const handleSave = async () => {
    try {
      const newCost = parseFloat(editedCost);
      if (isNaN(newCost) || newCost < 0) {
        setError('El costo debe ser un número válido');
        return;
      }

      await updateDoc(doc(db, 'inventory', selectedProduct.id), {
        cost: newCost,
      });

      const updatedProducts = products.map(product => {
        if (product.id === selectedProduct.id) {
          return {
            ...product,
            cost: newCost,
            margin: calculateMargin(product.price, newCost),
          };
        }
        return product;
      });

      setProducts(updatedProducts);
      setEditDialog(false);
      setError(null);
    } catch (err) {
      setError('Error al actualizar el costo');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Costos y Márgenes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Precio de Venta</TableCell>
                  <TableCell align="right">Costo</TableCell>
                  <TableCell align="right">Margen (%)</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="right">${product.price}</TableCell>
                    <TableCell align="right">
                      ${product.cost || 'No definido'}
                    </TableCell>
                    <TableCell align="right">
                      {product.margin}%
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleEditClick(product)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Editar Costo</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {selectedProduct?.name}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Costo"
            type="number"
            fullWidth
            value={editedCost}
            onChange={(e) => setEditedCost(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleSave} startIcon={<SaveIcon />}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductCostManager; 