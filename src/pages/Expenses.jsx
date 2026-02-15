import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Tooltip,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    TrendingDown as ExpenseIcon,
    Receipt as ReceiptIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import expenseService from '../services/expenseService';
import { useAuth } from '../context/AuthContextMongo';

const Expenses = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [stats, setStats] = useState(null);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [filterFechaInicio, setFilterFechaInicio] = useState('');
    const [filterFechaFin, setFilterFechaFin] = useState('');

    // Formulario
    const [formData, setFormData] = useState({
        concepto: '',
        categoria: '',
        monto: '',
        metodo_pago: 'efectivo',
        descripcion: '',
        proveedor: '',
        fecha: format(new Date(), 'yyyy-MM-dd'),
        estado: 'aprobado'
    });

    const categories = expenseService.getCategories();
    const paymentMethods = expenseService.getPaymentMethods();

    useEffect(() => {
        loadExpenses();
        loadStats();
    }, [filterCategoria, filterEstado, filterFechaInicio, filterFechaFin]);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (filterCategoria) filters.categoria = filterCategoria;
            if (filterEstado) filters.estado = filterEstado;
            if (filterFechaInicio) filters.fecha_inicio = filterFechaInicio;
            if (filterFechaFin) filters.fecha_fin = filterFechaFin;
            if (searchTerm) filters.search = searchTerm;

            const response = await expenseService.getExpenses(filters);
            setExpenses(response.data || []);
        } catch (error) {
            console.error('Error al cargar gastos:', error);
            enqueueSnackbar('Error al cargar gastos', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const filters = {};
            if (filterFechaInicio) filters.fecha_inicio = filterFechaInicio;
            if (filterFechaFin) filters.fecha_fin = filterFechaFin;

            const statsData = await expenseService.getExpenseStats(filters);
            setStats(statsData);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const handleOpenDialog = (expense = null) => {
        if (expense) {
            setEditingExpense(expense);
            setFormData({
                concepto: expense.concepto,
                categoria: expense.categoria,
                monto: expense.monto,
                metodo_pago: expense.metodo_pago,
                descripcion: expense.descripcion || '',
                proveedor: expense.proveedor || '',
                fecha: format(new Date(expense.fecha), 'yyyy-MM-dd'),
                estado: expense.estado
            });
        } else {
            setEditingExpense(null);
            setFormData({
                concepto: '',
                categoria: '',
                monto: '',
                metodo_pago: 'efectivo',
                descripcion: '',
                proveedor: '',
                fecha: format(new Date(), 'yyyy-MM-dd'),
                estado: 'aprobado'
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingExpense(null);
    };

    const handleSubmit = async () => {
        try {
            if (!formData.concepto || !formData.categoria || !formData.monto) {
                enqueueSnackbar('Por favor completa los campos requeridos', { variant: 'warning' });
                return;
            }

            if (editingExpense) {
                await expenseService.updateExpense(editingExpense._id, formData);
                enqueueSnackbar('Gasto actualizado exitosamente', { variant: 'success' });
            } else {
                await expenseService.createExpense(formData);
                enqueueSnackbar('Gasto registrado exitosamente', { variant: 'success' });
            }

            handleCloseDialog();
            loadExpenses();
            loadStats();
        } catch (error) {
            console.error('Error al guardar gasto:', error);
            enqueueSnackbar('Error al guardar gasto', { variant: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este gasto?')) return;

        try {
            await expenseService.deleteExpense(id);
            enqueueSnackbar('Gasto eliminado exitosamente', { variant: 'success' });
            loadExpenses();
            loadStats();
        } catch (error) {
            console.error('Error al eliminar gasto:', error);
            enqueueSnackbar('Error al eliminar gasto', { variant: 'error' });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(amount);
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'aprobado': return 'success';
            case 'pendiente': return 'warning';
            case 'rechazado': return 'error';
            default: return 'default';
        }
    };

    const getCategoryIcon = (categoria) => {
        const cat = categories.find(c => c.value === categoria);
        return cat ? cat.icon : '📦';
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Encabezado */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        <ExpenseIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Gastos y Consumos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Gestiona los gastos de caja chica, mantenimiento y otros consumos
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nuevo Gasto
                </Button>
            </Box>

            {/* Estadísticas */}
            {stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    Total Gastos
                                </Typography>
                                <Typography variant="h5">
                                    {formatCurrency(stats.resumen?.total || 0)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    Cantidad
                                </Typography>
                                <Typography variant="h5">
                                    {stats.resumen?.cantidad || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    Promedio
                                </Typography>
                                <Typography variant="h5">
                                    {formatCurrency(stats.resumen?.promedio || 0)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    Categoría Principal
                                </Typography>
                                <Typography variant="h6">
                                    {stats.por_categoria?.[0]?._id || 'N/A'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Filtros */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Categoría</InputLabel>
                                <Select
                                    value={filterCategoria}
                                    onChange={(e) => setFilterCategoria(e.target.value)}
                                    label="Categoría"
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    {categories.map(cat => (
                                        <MenuItem key={cat.value} value={cat.value}>
                                            {cat.icon} {cat.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={filterEstado}
                                    onChange={(e) => setFilterEstado(e.target.value)}
                                    label="Estado"
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="aprobado">Aprobado</MenuItem>
                                    <MenuItem value="pendiente">Pendiente</MenuItem>
                                    <MenuItem value="rechazado">Rechazado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Desde"
                                value={filterFechaInicio}
                                onChange={(e) => setFilterFechaInicio(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Hasta"
                                value={filterFechaFin}
                                onChange={(e) => setFilterFechaFin(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={1}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={loadExpenses}
                                sx={{ height: '40px' }}
                            >
                                <FilterIcon />
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tabla de Gastos */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Concepto</TableCell>
                                <TableCell>Categoría</TableCell>
                                <TableCell>Monto</TableCell>
                                <TableCell>Método Pago</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : expenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography color="text.secondary">
                                            No hay gastos registrados
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                expenses.map((expense) => (
                                    <TableRow key={expense._id}>
                                        <TableCell>
                                            {format(new Date(expense.fecha), 'dd/MM/yyyy', { locale: es })}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">
                                                {expense.concepto}
                                            </Typography>
                                            {expense.proveedor && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {expense.proveedor}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={expense.categoria}
                                                icon={<span>{getCategoryIcon(expense.categoria)}</span>}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold" color="error">
                                                {formatCurrency(expense.monto)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{expense.metodo_pago}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={expense.estado}
                                                color={getEstadoColor(expense.estado)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDialog(expense)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(expense._id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Diálogo de Formulario */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Concepto *"
                            value={formData.concepto}
                            onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Categoría *</InputLabel>
                            <Select
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                label="Categoría *"
                            >
                                {categories.map(cat => (
                                    <MenuItem key={cat.value} value={cat.value}>
                                        {cat.icon} {cat.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Monto *"
                            type="number"
                            value={formData.monto}
                            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">RD$</InputAdornment>
                            }}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Método de Pago</InputLabel>
                            <Select
                                value={formData.metodo_pago}
                                onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                                label="Método de Pago"
                            >
                                {paymentMethods.map(method => (
                                    <MenuItem key={method.value} value={method.value}>
                                        {method.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Proveedor/Beneficiario"
                            value={formData.proveedor}
                            onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                        />

                        <TextField
                            fullWidth
                            label="Fecha"
                            type="date"
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            fullWidth
                            label="Descripción"
                            multiline
                            rows={3}
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <LoadingButton
                        variant="contained"
                        onClick={handleSubmit}
                    >
                        {editingExpense ? 'Actualizar' : 'Guardar'}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Expenses;
