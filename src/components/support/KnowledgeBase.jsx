import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Collapse,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const CATEGORIES = {
  getting_started: 'Primeros Pasos',
  inventory: 'Inventario',
  sales: 'Ventas',
  repairs: 'Reparaciones',
  billing: 'Facturación',
  settings: 'Configuración',
  troubleshooting: 'Solución de Problemas'
};

export const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [searchTerm, articles]);

  const loadArticles = async () => {
    try {
      const articlesRef = collection(db, 'knowledge_base');
      const q = query(articlesRef, where('status', '==', 'published'));
      const querySnapshot = await getDocs(q);
      
      const loadedArticles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setArticles(loadedArticles);
      setFilteredArticles(loadedArticles);
    } catch (error) {
      console.error('Error al cargar artículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    if (!searchTerm.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = articles.filter(article => 
      article.title.toLowerCase().includes(searchLower) ||
      article.content.toLowerCase().includes(searchLower) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );

    setFilteredArticles(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleArticle = (articleId) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Base de Conocimientos
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Encuentra respuestas a tus preguntas más comunes
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar artículos..."
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredArticles.map(article => (
          <Grid item xs={12} key={article.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {article.title}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={CATEGORIES[article.category]} 
                        color="primary" 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      {article.tags.map(tag => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          variant="outlined" 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <IconButton onClick={() => toggleArticle(article.id)}>
                    {expandedArticle === article.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <Collapse in={expandedArticle === article.id}>
                  <Divider sx={{ my: 2 }} />
                  <Typography 
                    variant="body1" 
                    component="div" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      '& p': { mb: 2 }
                    }}
                  >
                    {article.content}
                  </Typography>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {filteredArticles.length === 0 && !loading && (
          <Grid item xs={12}>
            <Typography variant="body1" align="center" color="text.secondary">
              No se encontraron artículos que coincidan con tu búsqueda.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}; 