import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  CircularProgress,
  Typography,
  Divider
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../config/api';

/**
 * Componente de Búsqueda Global Avanzada
 * Soporta: Productos, Clientes, Reparaciones
 * Con debounce y autocomplete
 */
export const AdvancedSearch = ({ onSelect = () => {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({
    products: [],
    customers: [],
    repairs: []
  });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Debounce de búsqueda
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    if (searchQuery.length < 2) {
      setResults({ products: [], customers: [], repairs: [] });
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    setDebounceTimer(timer);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const response = await api.get('/search/global', {
        params: { q: searchQuery }
      });

      setResults(response.data.data || { products: [], customers: [], repairs: [] });
      setShowResults(true);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setResults({ products: [], customers: [], repairs: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item, type) => {
    onSelect({ item, type });
    setSearchQuery('');
    setShowResults(false);
  };

  const totalResults = (results.products?.length || 0) + 
                      (results.customers?.length || 0) + 
                      (results.repairs?.length || 0);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        placeholder="🔍 Buscar productos, clientes, reparaciones..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
        size="small"
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
        }}
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: 1
        }}
      />

      {showResults && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 1,
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={20} />
            </Box>
          )}

          {!loading && totalResults === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                No se encontraron resultados para "{searchQuery}"
              </Typography>
            </Box>
          )}

          {!loading && results.products && results.products.length > 0 && (
            <>
              <Typography variant="caption" sx={{ px: 2, py: 1, fontWeight: 'bold', display: 'block', backgroundColor: '#f9f9f9' }}>
                📦 PRODUCTOS
              </Typography>
              <List dense>
                {results.products.map((product) => (
                  <ListItem key={product._id} disablePadding>
                    <ListItemButton
                      onClick={() => handleSelect(product, 'PRODUCTO')}
                    >
                      <ListItemText
                        primary={product.nombre}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={`RD$${product.precio}`} size="small" />
                            <Chip label={`Stock: ${product.stock}`} size="small" variant="outlined" />
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Divider />
            </>
          )}

          {!loading && results.customers && results.customers.length > 0 && (
            <>
              <Typography variant="caption" sx={{ px: 2, py: 1, fontWeight: 'bold', display: 'block', backgroundColor: '#f9f9f9' }}>
                👤 CLIENTES
              </Typography>
              <List dense>
                {results.customers.map((customer) => (
                  <ListItem key={customer._id} disablePadding>
                    <ListItemButton
                      onClick={() => handleSelect(customer, 'CLIENTE')}
                    >
                      <ListItemText
                        primary={customer.nombre}
                        secondary={customer.email || customer.telefono}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Divider />
            </>
          )}

          {!loading && results.repairs && results.repairs.length > 0 && (
            <>
              <Typography variant="caption" sx={{ px: 2, py: 1, fontWeight: 'bold', display: 'block', backgroundColor: '#f9f9f9' }}>
                🔧 REPARACIONES
              </Typography>
              <List dense>
                {results.repairs.map((repair) => (
                  <ListItem key={repair._id} disablePadding>
                    <ListItemButton
                      onClick={() => handleSelect(repair, 'REPARACION')}
                    >
                      <ListItemText
                        primary={repair.customer_name || repair.device}
                        secondary={repair.problem}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default AdvancedSearch;
