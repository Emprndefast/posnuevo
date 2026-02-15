import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Box,
    CircularProgress
} from '@mui/material';
import { useBranch } from '../../context/BranchContext';
import inventoryService from '../../services/inventoryService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MovementHistoryModal = ({ open, onClose, product }) => {
    const { activeBranch } = useBranch();
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && product && activeBranch) {
            loadHistory();
        }
    }, [open, product, activeBranch]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const result = await inventoryService.getMovementHistory({
                branch_id: activeBranch.id,
                product_id: product._id || product.id,
                limit: 50
            });
            if (result.success) {
                setMovements(result.data);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChipColor = (type) => {
        switch (type) {
            case 'venta': return 'success';
            case 'compra': return 'info';
            case 'ajuste_entrada': return 'success';
            case 'ajuste_salida': return 'error';
            case 'transferencia_enviada': return 'warning';
            case 'transferencia_recibida': return 'info';
            case 'devolucion': return 'warning';
            default: return 'default';
        }
    };

    const formatType = (type) => {
        return type.replace(/_/g, ' ').toUpperCase();
    };

    if (!product) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Kardex: {product.name}</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell align="right">Cantidad</TableCell>
                                    <TableCell align="right">Stock Prev</TableCell>
                                    <TableCell align="right">Stock Nuevo</TableCell>
                                    <TableCell>Motivo</TableCell>
                                    <TableCell>Usuario</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {movements.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">No hay movimientos registrados</TableCell>
                                    </TableRow>
                                ) : (
                                    movements.map((mov) => (
                                        <TableRow key={mov._id}>
                                            <TableCell>{format(new Date(mov.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={formatType(mov.tipo)}
                                                    size="small"
                                                    color={getChipColor(mov.tipo)}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right">{mov.cantidad}</TableCell>
                                            <TableCell align="right">{mov.stock_anterior}</TableCell>
                                            <TableCell align="right">{mov.stock_nuevo}</TableCell>
                                            <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {mov.motivo}
                                            </TableCell>
                                            <TableCell>{mov.usuario_id}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default MovementHistoryModal;
