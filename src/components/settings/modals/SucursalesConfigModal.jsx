import React, { useState, useEffect } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Divider,
    FormControlLabel,
    Switch,
    Box,
    Collapse,
    Alert,
    CircularProgress,
    Card,
    CardContent
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocalPrintshop,
    Storefront,
    CheckCircle,
    Cancel
} from '@mui/icons-material';

import branchService from '../../../services/branchService';

const SucursalesConfigModal = ({ onClose }) => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBranch, setEditingBranch] = useState(null); // Si es null, mostramos lista. Si tiene obj, mostramos form.
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        rnc: '',
        ciudad: '',
        es_principal: false,
        printer_config: {
            connectionType: 'usb', // usb, network, bluetooth
            printerName: '',
            printerIp: '',
            printerPort: 9100,
            paperSize: '80mm'
        }
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            setLoading(true);
            const data = await branchService.getAll();
            if (data.success) {
                setBranches(data.data || []);
            }
        } catch (err) {
            console.error(err);
            setError('Error al cargar sucursales');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setFormData({
            nombre: branch.nombre || '',
            direccion: branch.direccion || '',
            telefono: branch.telefono || '',
            rnc: branch.rnc || '',
            ciudad: branch.ciudad || '',
            es_principal: branch.es_principal || false,
            printer_config: {
                connectionType: branch.printer_config?.connectionType || 'usb',
                printerName: branch.printer_config?.printerName || '',
                printerIp: branch.printer_config?.printerIp || '',
                printerPort: branch.printer_config?.printerPort || 9100,
                paperSize: branch.printer_config?.paperSize || '80mm'
            }
        });
        setError(null);
        setSuccess(null);
    };

    const handleCreate = () => {
        setEditingBranch({ isNew: true });
        setFormData({
            nombre: '',
            direccion: '',
            telefono: '',
            rnc: '',
            ciudad: '',
            es_principal: false,
            printer_config: {
                connectionType: 'usb',
                printerName: '',
                printerIp: '',
                printerPort: 9100,
                paperSize: '80mm'
            }
        });
        setError(null);
        setSuccess(null);
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;

        if (name.startsWith('printer_')) {
            const printerField = name.replace('printer_', '');
            setFormData(prev => ({
                ...prev,
                printer_config: {
                    ...prev.printer_config,
                    [printerField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            if (!formData.nombre || !formData.direccion) {
                setError('Nombre y Dirección son obligatorios');
                setSaving(false);
                return;
            }

            if (editingBranch.isNew) {
                await branchService.create(formData);
                setSuccess('Sucursal creada exitosamente');
            } else {
                await branchService.update(editingBranch._id || editingBranch.id, formData);
                setSuccess('Sucursal actualizada exitosamente');
            }

            setTimeout(() => {
                setEditingBranch(null);
                loadBranches();
            }, 1000); // Dar tiempo a leer el mensaje de éxito
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingBranch(null);
        setError(null);
    };

    const renderBranchList = () => (
        <List>
            {branches.map((branch) => (
                <ListItem
                    key={branch._id || branch.id}
                    divider
                    sx={{
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                        mb: 1
                    }}
                >
                    <Box sx={{ mr: 2, color: 'primary.main' }}>
                        <Storefront />
                    </Box>
                    <ListItemText
                        primary={
                            <Typography variant="subtitle1" fontWeight="bold">
                                {branch.nombre}
                                {branch.es_principal && (
                                    <Box component="span" sx={{ ml: 1, px: 1, py: 0.2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1, fontSize: '0.7em' }}>
                                        PRINCIPAL
                                    </Box>
                                )}
                            </Typography>
                        }
                        secondary={
                            <>
                                <Typography variant="body2" component="span" display="block">
                                    {branch.direccion}
                                </Typography>
                                {branch.telefono && (
                                    <Typography variant="caption" color="textSecondary">
                                        Tel: {branch.telefono}
                                    </Typography>
                                )}
                            </>
                        }
                    />
                    <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(branch)} color="primary">
                            <EditIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
            {branches.length === 0 && !loading && (
                <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
                    No hay sucursales registradas.
                </Typography>
            )}
        </List>
    );

    const renderForm = () => (
        <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                    Datos Generales
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Nombre de Sucursal"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                    multiline
                    rows={2}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="RNC / RUT"
                    name="rnc"
                    value={formData.rnc}
                    onChange={handleChange}
                    placeholder="Opcional si es igual al negocio"
                />
            </Grid>

            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.es_principal}
                            onChange={handleChange}
                            name="es_principal"
                            color="primary"
                        />
                    }
                    label="Marcar como Sucursal Principal"
                />
            </Grid>

            {/* Configuración de Impresora */}
            <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalPrintshop sx={{ mr: 1 }} /> Configuración de Impresión
                </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>Tipo de Conexión</InputLabel>
                    <Select
                        label="Tipo de Conexión"
                        name="printer_connectionType"
                        value={formData.printer_config.connectionType}
                        onChange={handleChange}
                    >
                        <MenuItem value="usb">USB (Driver Local)</MenuItem>
                        <MenuItem value="network">Red / LAN / WiFi</MenuItem>
                        <MenuItem value="bluetooth">Bluetooth</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>Tamaño de Papel</InputLabel>
                    <Select
                        label="Tamaño de Papel"
                        name="printer_paperSize"
                        value={formData.printer_config.paperSize}
                        onChange={handleChange}
                    >
                        <MenuItem value="80mm">80mm (Estándar)</MenuItem>
                        <MenuItem value="58mm">58mm (Pequeño)</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            {formData.printer_config.connectionType === 'network' ? (
                <>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            fullWidth
                            label="Dirección IP de Impresora"
                            name="printer_printerIp"
                            value={formData.printer_config.printerIp}
                            onChange={handleChange}
                            placeholder="Ej: 192.168.1.100"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Puerto"
                            name="printer_printerPort"
                            type="number"
                            value={formData.printer_config.printerPort}
                            onChange={handleChange}
                            placeholder="9100"
                        />
                    </Grid>
                </>
            ) : (
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label={formData.printer_config.connectionType === 'bluetooth' ? "Nombre del Dispositivo Bluetooth" : "Nombre de Impresora (Sistema Operativo)"}
                        name="printer_printerName"
                        value={formData.printer_config.printerName}
                        onChange={handleChange}
                        helperText={formData.printer_config.connectionType === 'usb' ? "Debe coincidir EXACTAMENTE con el nombre en Panel de Control" : ""}
                    />
                </Grid>
            )}
        </Grid>
    );

    return (
        <>
            <DialogTitle sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        {editingBranch ? (editingBranch.isNew ? 'Nueva Sucursal' : 'Editar Sucursal') : 'Gestión de Sucursales'}
                    </Typography>
                    {!editingBranch && (
                        <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            size="small"
                            onClick={handleCreate}
                        >
                            Nueva
                        </Button>
                    )}
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {loading && (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                {!loading && !editingBranch && renderBranchList()}
                {!loading && editingBranch && renderForm()}

            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                {editingBranch ? (
                    <>
                        <Button onClick={handleCancelEdit} color="inherit" disabled={saving}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} variant="contained" disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </>
                ) : (
                    <Button onClick={onClose} color="primary">
                        Cerrar
                    </Button>
                )}
            </DialogActions>
        </>
    );
};

export default SucursalesConfigModal;
