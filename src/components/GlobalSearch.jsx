import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Button,
} from '@mui/material';
import {
  ShoppingBag as ShoppingIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  Search as SearchIcon,
  AddShoppingCart as AddCartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { useCart } from '../context/CartContext';
import { useSnackbar } from 'notistack';

const GlobalSearch = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { enqueueSnackbar } = useSnackbar();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      setLoading(true);
      try {
        // Buscar en múltiples endpoints en paralelo con los prefijos correctos
        const [clientsRes, productsRes, repairsRes] = await Promise.all([
          api.get(`/customers?search=${query}`).catch(() => ({ data: { data: [] } })),
          api.get(`/products?search=${query}`).catch(() => ({ data: { data: [] } })),
          api.get(`/repairs?search=${query}`).catch(() => ({ data: { data: [] } })),
        ]);

        const clients = (clientsRes.data?.data || []).map((c) => ({
          type: 'cliente',
          id: c._id || c.id,
          title: c.nombre || c.name,
          subtitle: c.email || c.telefono || 'Cliente',
          icon: PeopleIcon,
          path: `/customers/${c._id || c.id}`,
        }));

        const products = (productsRes.data?.data || []).map((p) => ({
          type: 'producto',
          id: p._id || p.id,
          title: p.nombre || p.name,
          subtitle: `RD$${p.precio || p.price}`,
          icon: ShoppingIcon,
          path: `/quick-sale`,
          data: p // Guardar el objeto completo para el carrito
        }));

        const repairs = (repairsRes.data?.data || []).map((r) => ({
          type: 'reparacion',
          id: r._id || r.id,
          title: `${r.brand} ${r.device}`,
          subtitle: r.problem,
          icon: BuildIcon,
          path: `/repairs/${r._id || r.id}`,
        }));

        setResults([...clients, ...products, ...repairs].slice(0, 15));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (result) => {
    if (result.type === 'producto') {
      // Si es un producto, lo agregamos al carrito y vamos al POS
      const productForCart = {
        id: result.id,
        name: result.title,
        price: parseFloat(result.data.precio || result.data.price || 0),
        quantity: 1,
        code: result.data.codigo || result.data.code || '',
        meta: { type: 'product', source: 'global_search' }
      };
      
      addToCart(productForCart);
      enqueueSnackbar(`${result.title} agregado al carrito`, { variant: 'success' });
      navigate('/quick-sale');
    } else {
      navigate(result.path);
    }
    
    onClose();
    setQuery('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Buscar por clientes, productos, reparaciones (Ctrl+K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              startAdornment: loading ? (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              ) : (
                <SearchIcon color="action" sx={{ mr: 1 }} />
              ),
            }}
            sx={{
              '& input': {
                fontSize: '1.2rem',
              }
            }}
          />
        </Box>

        <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {query && results.length === 0 && !loading && (
            <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
              No se encontraron resultados para "{query}"
            </Typography>
          )}

          {results.length > 0 && (
            <List sx={{ pt: 0 }}>
              {results.map((result, index) => {
                const Icon = result.icon;
                return (
                  <React.Fragment key={`${result.type}-${result.id}`}>
                    <ListItem
                      button
                      onClick={() => handleSelect(result)}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: '#f8f9fa',
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Box sx={{
                          backgroundColor: result.type === 'producto' ? '#e7f3ff' : 
                                           result.type === 'cliente' ? '#fff0f0' : '#f0f0f0',
                          p: 1,
                          borderRadius: '12px',
                          display: 'flex'
                        }}>
                          <Icon fontSize="small" color={result.type === 'producto' ? 'primary' : 
                                                      result.type === 'cliente' ? 'error' : 'action'} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={600}>
                            {result.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {result.type.charAt(0).toUpperCase() + result.type.slice(1)} • {result.subtitle}
                          </Typography>
                        }
                      />
                      {result.type === 'producto' && (
                        <AddCartIcon fontSize="small" color="action" sx={{ opacity: 0.5 }} />
                      )}
                    </ListItem>
                    {index < results.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;
