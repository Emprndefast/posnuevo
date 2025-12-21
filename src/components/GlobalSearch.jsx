/**
 * Buscador global para el POS
 * Busca en: clientes, productos, reparaciones
 * Accesible con Ctrl+K
 */

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
} from '@mui/material';
import {
  Shopping as ShoppingIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

const GlobalSearch = ({ open, onClose }) => {
  const navigate = useNavigate();
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
        // Buscar en múltiples endpoints en paralelo
        const [clientsRes, productsRes, repairsRes] = await Promise.all([
          api.get(`/api/clientes?search=${query}`).catch(() => ({ data: { data: [] } })),
          api.get(`/api/productos?search=${query}`).catch(() => ({ data: { data: [] } })),
          api.get(`/api/repairs?search=${query}`).catch(() => ({ data: { data: [] } })),
        ]);

        const clients = (clientsRes.data?.data || []).map((c) => ({
          type: 'cliente',
          id: c._id,
          title: c.nombre,
          subtitle: c.email,
          icon: PeopleIcon,
          path: `/clientes/${c._id}`,
        }));

        const products = (productsRes.data?.data || []).map((p) => ({
          type: 'producto',
          id: p._id,
          title: p.nombre,
          subtitle: `RD$${p.precio}`,
          icon: ShoppingIcon,
          path: `/productos/${p._id}`,
        }));

        const repairs = (repairsRes.data?.data || []).map((r) => ({
          type: 'reparacion',
          id: r._id,
          title: `${r.brand} ${r.device}`,
          subtitle: r.problem,
          icon: BuildIcon,
          path: `/repairs/${r._id}`,
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
    navigate(result.path);
    onClose();
    setQuery('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          placeholder="Buscar clientes, productos, reparaciones..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null,
          }}
        />

        {query && results.length === 0 && !loading && (
          <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
            No se encontraron resultados para "{query}"
          </Typography>
        )}

        {results.length > 0 && (
          <List>
            {results.map((result, index) => {
              const Icon = result.icon;
              return (
                <React.Fragment key={result.id}>
                  <ListItem
                    button
                    onClick={() => handleSelect(result)}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Icon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={result.title}
                      secondary={result.subtitle}
                    />
                  </ListItem>
                  {index < results.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;
