import React, { useEffect, useState } from 'react';
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
  Chip
} from '@mui/material';
import { loyaltyService } from '../../services/loyaltyService';
import { useSnackbar } from '../../context/SnackbarContext';

const PointsHistory = ({ customerId }) => {
  const [transactions, setTransactions] = useState([]);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const history = await loyaltyService.getPointsHistory(customerId);
        // Ordenar por fecha más reciente
        const sortedHistory = history.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setTransactions(sortedHistory);
      } catch (error) {
        showSnackbar('Error al cargar historial de puntos', 'error');
      }
    };

    fetchTransactions();
  }, [customerId, showSnackbar]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionType = (type) => {
    const types = {
      earn: { label: 'Ganados', color: 'success' },
      redeem: { label: 'Canjeados', color: 'error' }
    };
    return types[type] || { label: 'Desconocido', color: 'default' };
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Historial de Puntos
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Puntos</TableCell>
              <TableCell>Detalles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => {
              const type = getTransactionType(transaction.type);
              return (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                  <TableCell>
                    <Chip
                      label={type.label}
                      color={type.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {transaction.points > 0 ? '+' : ''}{transaction.points}
                  </TableCell>
                  <TableCell>
                    {transaction.transactionId && `Venta: ${transaction.transactionId}`}
                    {transaction.rewardId && `Recompensa: ${transaction.rewardId}`}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">
                    No hay transacciones registradas
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PointsHistory; 