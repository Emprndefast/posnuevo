import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    useTheme,
    alpha
} from '@mui/material';
import {
    AttachMoney,
    LockOpen,
    Lock,
    Receipt,
    TrendingUp,
    TrendingDown,
    Refresh,
    Visibility,
    GetApp
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import cashRegisterService from '../services/cashRegisterService';
import { useBranch } from '../context/BranchContext';
import OpenCashRegisterModal from '../components/cash-register/OpenCashRegisterModal';
import CloseCashRegisterModal from '../components/cash-register/CloseCashRegisterModal';

const CashRegisterPage = () => {
    const theme = useTheme();
    const { activeBranch } = useBranch();
    const [loading, setLoading] = useState(true);
    const [activeCashRegister, setActiveCashRegister] = useState(null);
    const [history, setHistory] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [closeModal, setCloseModal] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (activeBranch) {
            loadData();
        }
    }, [activeBranch]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            // Intentar obtener caja activa
            const activeResponse = await cashRegisterService.getActiveCashRegister(activeBranch?.id);
            if (activeResponse.success) {
                setActiveCashRegister(activeResponse.data);
            } else {
                setActiveCashRegister(null);
            }

            // Obtener historial
            const historyResponse = await cashRegisterService.getCashRegisterHistory({
                branch_id: activeBranch?.id,
                limit: 10
            });
            if (historyResponse.success) {
                setHistory(historyResponse.data || []);
            }
        } catch (err) {
            console.error('Error loading cash register data:', err);
            setError('Error al cargar datos de caja');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSuccess = () => {
        loadData();
    };

    const handleCloseSuccess = () => {
        loadData();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ABIERTA':
                return 'success';
            case 'CERRADA':
                return 'error';
            case 'CUADRADA':
                return 'info';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ABIERTA':
                return <LockOpen />;
            case 'CERRADA':
            case 'CUADRADA':
                return <Lock />;
            default:
                return <Receipt />;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Gestión de Caja
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {activeBranch?.nombre || 'Sucursal'}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={loadData}
                >
                    Actualizar
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Estado Actual de Caja */}
            <Card sx={{ mb: 3, background: activeCashRegister ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)` : 'background.paper' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box>
                            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                {activeCashRegister ? <LockOpen color="success" /> : <Lock color="error" />}
                                Estado de Caja
                            </Typography>
                            <Chip
                                label={activeCashRegister ? 'CAJA ABIERTA' : 'CAJA CERRADA'}
                                color={activeCashRegister ? 'success' : 'error'}
                                sx={{ fontWeight: 600 }}
                            />
                        </Box>
                        {activeCashRegister ? (
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<Lock />}
                                onClick={() => setCloseModal(true)}
                            >
                                Cerrar Caja
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<LockOpen />}
                                onClick={() => setOpenModal(true)}
                            >
                                Abrir Caja
                            </Button>
                        )}
                    </Box>

                    {activeCashRegister && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">Apertura</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {format(new Date(activeCashRegister.opening_date), "dd/MM/yyyy HH:mm", { locale: es })}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Por: {activeCashRegister.user_id?.nombre || 'Usuario'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">Monto Inicial</Typography>
                                <Typography variant="h6" color="primary.main">
                                    ${activeCashRegister.opening_amount?.toFixed(2) || '0.00'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">Ventas en Efectivo</Typography>
                                <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TrendingUp fontSize="small" />
                                    ${activeCashRegister.summary?.cash_sales?.toFixed(2) || '0.00'}
                                </Typography>
                                <Typography variant="caption">
                                    {activeCashRegister.summary?.sales_count || 0} ventas
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">Gastos</Typography>
                                <Typography variant="h6" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TrendingDown fontSize="small" />
                                    ${activeCashRegister.summary?.total_expenses?.toFixed(2) || '0.00'}
                                </Typography>
                                <Typography variant="caption">
                                    {activeCashRegister.summary?.expenses_count || 0} gastos
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                                    <Typography variant="caption">Efectivo Esperado en Caja</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        ${((activeCashRegister.opening_amount || 0) + (activeCashRegister.summary?.cash_sales || 0) - (activeCashRegister.summary?.total_expenses || 0)).toFixed(2)}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </CardContent>
            </Card>

            {/* Historial de Cajas */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Historial de Cajas
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha Apertura</TableCell>
                                    <TableCell>Usuario</TableCell>
                                    <TableCell align="right">Monto Inicial</TableCell>
                                    <TableCell align="right">Ventas</TableCell>
                                    <TableCell align="right">Gastos</TableCell>
                                    <TableCell align="right">Esperado</TableCell>
                                    <TableCell align="right">Contado</TableCell>
                                    <TableCell align="right">Diferencia</TableCell>
                                    <TableCell align="center">Estado</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                No hay historial de cajas
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map((cash) => (
                                        <TableRow key={cash._id || cash.id}>
                                            <TableCell>
                                                {format(new Date(cash.opening_date), "dd/MM/yyyy HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell>{cash.user_id?.nombre || 'N/A'}</TableCell>
                                            <TableCell align="right">${cash.opening_amount?.toFixed(2)}</TableCell>
                                            <TableCell align="right">${cash.summary?.cash_sales?.toFixed(2) || '0.00'}</TableCell>
                                            <TableCell align="right">${cash.summary?.total_expenses?.toFixed(2) || '0.00'}</TableCell>
                                            <TableCell align="right">${cash.expected_amount?.toFixed(2) || 'N/A'}</TableCell>
                                            <TableCell align="right">${cash.closing_amount?.toFixed(2) || 'N/A'}</TableCell>
                                            <TableCell align="right">
                                                {cash.difference !== undefined && cash.difference !== null ? (
                                                    <Typography
                                                        variant="body2"
                                                        color={cash.difference === 0 ? 'success.main' : cash.difference > 0 ? 'info.main' : 'error.main'}
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        {cash.difference >= 0 ? '+' : ''}{cash.difference.toFixed(2)}
                                                    </Typography>
                                                ) : 'N/A'}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    size="small"
                                                    icon={getStatusIcon(cash.status)}
                                                    label={cash.status}
                                                    color={getStatusColor(cash.status)}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Ver Reporte">
                                                    <IconButton size="small">
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Exportar">
                                                    <IconButton size="small">
                                                        <GetApp />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Modales */}
            <OpenCashRegisterModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSuccess={handleOpenSuccess}
            />
            <CloseCashRegisterModal
                open={closeModal}
                onClose={() => setCloseModal(false)}
                onSuccess={handleCloseSuccess}
                cashRegister={activeCashRegister}
            />
        </Box>
    );
};

export default CashRegisterPage;
