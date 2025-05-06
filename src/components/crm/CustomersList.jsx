import React from 'react';
import { useCrm } from '../../context/CrmContext';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const CustomersList = () => {
  const { customers, loading, error } = useCrm();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Clientes CRM
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/crm/customers/new"
        >
          Nuevo Cliente
        </Button>
      </Box>

      <Grid container spacing={3}>
        {customers.map((customer) => (
          <Grid item xs={12} sm={6} md={4} key={customer.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {customer.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {customer.email}
                </Typography>
                <Typography color="textSecondary">
                  {customer.phone}
                </Typography>
                <Box mt={2}>
                  <Button
                    component={Link}
                    to={`/crm/customers/${customer.id}`}
                    variant="outlined"
                    size="small"
                  >
                    Ver Detalles
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CustomersList; 