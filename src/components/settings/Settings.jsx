import React, { useState, Suspense, lazy, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  alpha,
  useMediaQuery,
  Stack,
  Avatar,
  Chip,
  InputAdornment,
  Paper,
  Badge,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tabs,
  Tab,
  Container,
  AppBar,
  Toolbar
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Brightness4,
  Brightness7,
  Language,
  Notifications,
  Security,
  Backup,
  Print,
  Email,
  Save,
  Delete,
  Warning,
  Settings as SettingsIcon,
  Refresh,
  Close,
  Edit,
  Security as SecurityIcon,
  Store,
  Person,
  ColorLens,
  Translate,
  NotificationsActive,
  Lock,
  CloudUpload,
  LocalPrintshop,
  MailOutline,
  DeleteForever,
  Check,
  Error as ErrorIcon,
  Visibility,
  Bluetooth,
  CloudDownload,
  Receipt as ReceiptIcon,
  ReceiptLong,
  HelpOutline,
  Close as CloseIcon,
  FolderOpen,
  Scale,
  MonetizationOn,
  AccountBalance,
  Article,
  Checkbox,
  Telegram,
  Loyalty,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePermissions } from '../../context/PermissionsContext';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, writeBatch, deleteDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { printerService } from '../../services/printerService';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { usePrint } from '../../context/PrintContext';
import { usePrinter } from '../../context/PrinterContext';
import { useTranslation } from 'react-i18next';
import { testTelegramConnection } from '../../api/telegram';
import { telegramService } from '../../services/telegramService';
import { useTelegram } from '../../context/TelegramContext';
import appConfig from '../../config/settings/appConfig';
import { useSnackbar } from 'notistack';
import { PrintingTabs } from './PrintingTabs';
import { Slide } from '@mui/material';
import { Send } from '@mui/icons-material';
import SoporteTecnicoModal from '../SoporteTecnicoModal';

// ================== INICIO CAMBIO: Importación dinámica de submodales ==================
const EmpresaConfigModal = lazy(() => import('./modals/EmpresaConfigModal'));
const TicketsConfigModal = lazy(() => import('./modals/TicketsConfigModal'));
const CorreoConfigModal = lazy(() => import('./modals/CorreoConfigModal'));
const AparienciaConfigModal = lazy(() => import('./modals/AparienciaConfigModal'));
const GeneralConfigModal = lazy(() => import('./modals/GeneralConfigModal'));
const IdiomaConfigModal = lazy(() => import('./modals/IdiomaConfigModal'));
const PreciosConfigModal = lazy(() => import('./modals/PreciosConfigModal'));
const FacturacionConfigModal = lazy(() => import('./modals/FacturacionConfigModal'));
const BancosConfigModal = lazy(() => import('./modals/BancosConfigModal'));
const PuntosConfigModal = lazy(() => import('./modals/PuntosConfigModal'));
const ImpresoraConfigModal = lazy(() => import('./modals/ImpresoraConfigModal'));
const BasculaConfigModal = lazy(() => import('./modals/BasculaConfigModal'));
const TelegramConfigModal = lazy(() => import('./modals/TelegramConfigModal'));
const NotificacionesConfigModal = lazy(() => import('./modals/NotificacionesConfigModal'));
const SeguridadConfigModal = lazy(() => import('./modals/SeguridadConfigModal'));
const RespaldosConfigModal = lazy(() => import('./modals/RespaldosConfigModal'));
const ConfiguracionNCF = lazy(() => import('./modals/ConfiguracionNCF'));
const ProtectorPantallaConfigModal = lazy(() => import('./modals/ProtectorPantallaConfigModal'));
const WhatsAppConfigModal = lazy(() => import('./modals/WhatsAppConfigModal'));
// ================== FIN CAMBIO ==================

// Componente de tarjeta de configuración
const SettingCard = ({ title, icon, children, color = 'primary', sx = {} }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0}
      sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: `0 0 0 1px ${alpha(theme.palette[color].main, 0.2)}`
        },
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: 'background.paper',
        ...sx
      }}
    >
      <CardContent 
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: { xs: 2, sm: 3 },
          '&:last-child': {
            pb: { xs: 2, sm: 3 }
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette[color].main, 0.08),
              color: theme.palette[color].main,
              width: 40,
              height: 40
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="h6" sx={{ 
            fontWeight: 500,
            color: 'text.primary',
            letterSpacing: '-0.02em'
          }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

const PrintPreview = ({ onClose, onPrint, printing }) => {
  const theme = useTheme();
  const { print, loading: printLoading } = usePrint();
  const { isConnected } = usePrinter();

  const handlePrint = async () => {
    try {
      if (!isConnected) {
        throw new Error('La impresora no está conectada');
      }

      // Obtener el contenido del ticket
      const content = document.querySelector('.print-preview-content');
      if (!content) {
        throw new Error('No se pudo encontrar el contenido para imprimir');
      }

      // Crear el objeto de datos para la impresión
      const printData = {
        type: 'test',
        content: {
          businessName: 'MI NEGOCIO',
          address: 'Dirección del Negocio',
          phone: 'Tel: (123) 456-7890',
          date: new Date().toLocaleDateString(),
          ticketNumber: '001',
          testMessage: 'Impresora configurada correctamente',
          footer: '¡Gracias por su preferencia!'
        }
      };

      // Usar el servicio de impresión
      await print('test', printData);
      onClose();
    } catch (error) {
      console.error('Error al imprimir:', error);
      setSnackbar({
        open: true,
        message: 'Error al imprimir: ' + error.message,
        severity: 'error'
      });
    }
  };
  
  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 400
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Vista Previa de Impresión
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Paper 
          elevation={0} 
          className="print-preview-content"
          sx={{ 
            p: 2, 
            border: '1px solid #ddd',
            minHeight: 300,
            width: '80mm',
            mx: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            MI NEGOCIO
          </Typography>
          <Typography sx={{ textAlign: 'center', fontSize: '11px' }}>
            Dirección del Negocio
          </Typography>
          <Typography sx={{ textAlign: 'center', fontSize: '11px' }}>
            Tel: (123) 456-7890
          </Typography>
          <Divider sx={{ width: '100%', my: 1 }} />
          <Typography sx={{ alignSelf: 'flex-start', fontSize: '11px' }}>
            Fecha: {new Date().toLocaleDateString()}
          </Typography>
          <Typography sx={{ alignSelf: 'flex-start', fontSize: '11px' }}>
            Ticket #: 001
          </Typography>
          <Divider sx={{ width: '100%', my: 1 }} />
          <Box sx={{ width: '100%', fontSize: '11px' }}>
            <Typography sx={{ fontWeight: 'bold' }}>PÁGINA DE PRUEBA</Typography>
            <Typography>Impresora configurada correctamente</Typography>
          </Box>
          <Divider sx={{ width: '100%', my: 1 }} />
          <Typography sx={{ textAlign: 'center', fontSize: '11px' }}>
            ¡Gracias por su preferencia!
          </Typography>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          startIcon={printLoading ? <CircularProgress size={20} color="inherit" /> : <LocalPrintshop />}
          onClick={handlePrint}
          disabled={!isConnected || printLoading}
        >
          {printLoading ? 'Imprimiendo...' : 'Imprimir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const BackupDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [backupHistory, setBackupHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (open) {
      loadBackupHistory();
    }
  }, [open]);

  const loadBackupHistory = async () => {
    setIsLoading(true);
    try {
      // Aquí implementarías la carga desde Firebase
      const backupsRef = collection(db, 'backups');
      const q = query(backupsRef, where('userId', '==', user.uid), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const backups = [];
      querySnapshot.forEach((doc) => {
        backups.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate()
        });
      });
      
      setBackupHistory(backups);
    } catch (error) {
      console.error('Error al cargar historial de respaldos:', error);
      showSnackbar('Error al cargar el historial de respaldos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setBackupInProgress(true);
    try {
      // Crear nuevo documento de respaldo en Firebase
      const backupRef = collection(db, 'backups');
      const newBackup = {
        userId: user.uid,
        date: Timestamp.now(),
        type: 'Manual',
        size: '0 MB', // Se actualizará después de procesar los datos
        status: 'En progreso'
      };

      const docRef = await addDoc(backupRef, newBackup);

      // Aquí iría la lógica para respaldar los datos
      // Por ejemplo, obtener todas las colecciones relevantes
      const collections = ['products', 'sales', 'customers', 'settings'];
      const backupData = {};

      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        backupData[collectionName] = [];
        querySnapshot.forEach((doc) => {
          backupData[collectionName].push({
            id: doc.id,
            ...doc.data()
          });
        });
      }

      // Calcular tamaño aproximado
      const backupSize = new Blob([JSON.stringify(backupData)]).size;
      const sizeMB = (backupSize / (1024 * 1024)).toFixed(1);

      // Actualizar el documento con el tamaño real y estado
      await updateDoc(doc(db, 'backups', docRef.id), {
        size: `${sizeMB} MB`,
        status: 'Completado',
        data: backupData // Guardar los datos respaldados
      });

      showSnackbar('Respaldo creado exitosamente', 'success');
      loadBackupHistory();
    } catch (error) {
      console.error('Error al crear respaldo:', error);
      showSnackbar('Error al crear el respaldo', 'error');
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleRestore = async (backupId) => {
    setConfirmDialog({
      open: true,
      title: 'Restaurar Respaldo',
      message: '¿Estás seguro de que deseas restaurar este respaldo? Esta acción reemplazará los datos actuales.',
      action: async () => {
        setRestoreInProgress(true);
        try {
          // Obtener los datos del respaldo
          const backupDoc = await getDoc(doc(db, 'backups', backupId));
          if (!backupDoc.exists()) {
            throw new Error('Respaldo no encontrado');
          }

          const backupData = backupDoc.data().data;

          // Restaurar cada colección
          for (const [collectionName, documents] of Object.entries(backupData)) {
            const collectionRef = collection(db, collectionName);
            
            // Eliminar documentos existentes
            const existingDocs = await getDocs(
              query(collectionRef, where('userId', '==', user.uid))
            );
            
            const batch = writeBatch(db);
            existingDocs.forEach((doc) => {
              batch.delete(doc.ref);
            });

            // Crear nuevos documentos desde el respaldo
            documents.forEach((document) => {
              const newDocRef = doc(collectionRef);
              batch.set(newDocRef, {
                ...document,
                userId: user.uid
              });
            });

            await batch.commit();
          }

          showSnackbar('Respaldo restaurado exitosamente', 'success');
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          console.error('Error al restaurar respaldo:', error);
          showSnackbar('Error al restaurar el respaldo', 'error');
        } finally {
          setRestoreInProgress(false);
        }
      }
    });
  };

  const handleDownload = async (backup) => {
    try {
      // Obtener los datos del respaldo
      const backupDoc = await getDoc(doc(db, 'backups', backup.id));
      if (!backupDoc.exists()) {
        throw new Error('Respaldo no encontrado');
      }

      const backupData = backupDoc.data().data;
      
      // Crear archivo JSON
      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      
      // Crear URL y link de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${format(backup.date, 'yyyy-MM-dd_HH-mm')}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSnackbar('Respaldo descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error al descargar respaldo:', error);
      showSnackbar('Error al descargar el respaldo', 'error');
    }
  };

  const handleDelete = async (backupId) => {
    setConfirmDialog({
      open: true,
      title: 'Eliminar Respaldo',
      message: '¿Estás seguro de que deseas eliminar este respaldo? Esta acción no se puede deshacer.',
      action: async () => {
        try {
          // Referencia al documento del backup
          const backupRef = doc(db, 'backups', backupId);
          
          // Eliminar el documento
          await deleteDoc(backupRef);
          
          // Actualizar la lista de backups
          await loadBackupHistory();
          
          // Mostrar mensaje de éxito
          showSnackbar('Respaldo eliminado exitosamente', 'success');
          
          // Cerrar el diálogo de confirmación
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (error) {
          console.error('Error al eliminar respaldo:', error);
          showSnackbar('Error al eliminar el respaldo: ' + error.message, 'error');
        }
      }
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudUpload />
            <Typography variant="h6">Gestión de Respaldos</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={3}>
            {/* Panel de acciones */}
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={handleCreateBackup}
                  disabled={backupInProgress}
                >
                  {backupInProgress ? 'Creando respaldo...' : 'Crear Respaldo Manual'}
                </Button>
              </Stack>
            </Paper>

            {/* Historial de respaldos */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Tamaño</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <LinearProgress />
                      </TableCell>
                    </TableRow>
                  ) : backupHistory.length > 0 ? (
                    backupHistory.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell>
                          {backup.date.toLocaleString()}
                        </TableCell>
                        <TableCell>{backup.type}</TableCell>
                        <TableCell>{backup.size}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={backup.status}
                            color={backup.status === 'Completado' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Restaurar respaldo">
                              <IconButton
                                size="small"
                                onClick={() => handleRestore(backup.id)}
                                disabled={restoreInProgress}
                              >
                                <Refresh fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Descargar respaldo">
                              <IconButton 
                                size="small"
                                onClick={() => handleDownload(backup)}
                              >
                                <CloudDownload fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar respaldo">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDelete(backup.id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay respaldos disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '& .MuiTypography-root': {
            fontSize: '1.1rem',
            fontWeight: 600
          }
        }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3,
          py: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Button 
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            sx={{ 
              minWidth: 100,
              height: 40
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => confirmDialog.action()}
            color="error"
            variant="contained"
            startIcon={<Check />}
            sx={{ 
              minWidth: 100,
              height: 40
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Componente de vista previa de tema
const ThemePreview = ({ primaryColor, secondaryColor, darkMode }) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: darkMode ? 'grey.900' : 'background.paper',
        transition: 'all 0.3s ease'
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            size="small"
            sx={{ bgcolor: primaryColor }}
          >
            Primario
          </Button>
          <Button 
            variant="contained" 
            size="small"
            sx={{ bgcolor: secondaryColor }}
          >
            Secundario
          </Button>
        </Box>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 1.5,
            bgcolor: darkMode ? 'grey.800' : 'grey.50'
          }}
        >
          <Typography variant="caption" sx={{ color: darkMode ? 'grey.300' : 'grey.700' }}>
            Vista previa del tema
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
};

function a11yProps(index, prefix = 'settings') {
  return {
    id: `${prefix}-tab-${index}`,
    'aria-controls': `${prefix}-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SettingsModal = ({ open, onClose, title, icon, children }) => {
  const theme = useTheme();
  
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Slide}
      TransitionProps={{ direction: "up" }}
    >
      <AppBar sx={{ position: 'relative', bgcolor: 'background.paper' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <Close />
          </IconButton>
          <Box sx={{ ml: 2, flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Box>
          <Button autoFocus color="primary" onClick={onClose}>
            Guardar
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Dialog>
  );
};

const TouchButton = ({ icon, label, color = 'primary', onClick }) => {
  return (
    <Button
      fullWidth
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        bgcolor: theme => alpha(theme.palette[color].main, 0.1),
        color: theme => theme.palette[color].main,
        border: '1px solid',
        borderColor: theme => alpha(theme.palette[color].main, 0.2),
        '&:hover': {
          bgcolor: theme => alpha(theme.palette[color].main, 0.15),
        }
      }}
    >
      {icon}
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
    </Button>
  );
};

export const Settings = () => {
  const { user } = useAuth();
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  const { reloadConfig } = useTelegram();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [ticketSubTab, setTicketSubTab] = useState(0);
  const [settings, setSettings] = useState({
    darkMode: darkMode,
    theme: {
      primaryColor: appConfig.branding.primaryColor,
      secondaryColor: appConfig.branding.secondaryColor
    },
    printer: {
      type: 'thermal',
      port: '',
      baudRate: 9600,
      paperSize: '80mm',
      copies: 1,
      header: '',
      footer: '',
      enabled: false,
      connection: 'usb',
      ipAddress: '',
      networkPort: '',
      usbVendorId: '',
      bluetoothName: '',
      status: 'inactive'
    },
    email: {
      smtpServer: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
      toEmail: ''
    },
    telegram: {
      botToken: '',
      chatId: '',
      notifications: {
        sales: true,
        lowStock: true,
        dailySummary: false
      },
      enabled: false
    },
    notifications: {
      sales: true,
      lowStock: true,
      newOrders: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30
    },
    backup: {
      autoBackup: false,
      backupFrequency: 'daily'
    },
    billing: {
      businessName: '',
      ruc: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      taxRegime: '',
      authNumber: '',
      authDate: '',
      fontSize: 'normal',
      logoAlignment: 'center',
      defaultIVA: 19,
      showQRCode: true,
      showBarcode: true,
      showLogo: true,
      invoiceFooter: '',
      preinvoiceFooter: ''
    },
    printing: {
      paperSize: 'A4',
      orientation: 'portrait'
    },
    generic: {
      businessType: 'ACCESORIOS',
      reportHeader: 'USAR INFORMACIÓN DE EMPRESA',
      backupPath: 'C:/USERS/VPC/DOCUMENTS',
      decimalPlaces: 4,
      cardCommission: 0.00,
      currency: 'DOP - PESO DOMINICANO',
      exchangeRate: {
        USD: 1.0000
      },
      autoBackup: true,
      loyaltyPoints: {
        enabled: false,
        rate: 0
      }
    },
    ticket: {
      printer: {
        width: '58 MM',
        fontSize: 7.5,
        type: 'Consolas'
      },
      content: {
        showLot: false,
        showColor: true,
        showExpiry: true,
        showSize: false,
        showBarcode: false,
        showCustomerAddress: false,
        showModel: false,
        printImageBarcode: true,
        showTaxesAndDiscounts: true,
        showRounding: true,
        useSecondaryPrinter: false,
        hideAkasiaData: false,
        showLargeTicketNumber: false
      },
      logo: {
        print: false,
        position: {
          x: 0,
          y: 0,
          height: 0,
          width: 0
        }
      },
      copies: 1,
      format: '24 hrs.'
    },
    akasiaCloud: {
      contract: '',
      username: '',
      password: '',
      autoSync: true,
      syncInterval: 2,
      recordsPerRequest: 6000
    },
    banking: {
      banks: [
        {
          id: 1,
          name: '',
          accountNumber: '',
          interBankCode: ''
        },
        {
          id: 2,
          name: '',
          accountNumber: '',
          interBankCode: ''
        },
        {
          id: 3,
          name: '',
          accountNumber: '',
          interBankCode: ''
        }
      ],
      notifyPaymentTo: ''
    },
    // Configuración de impresora
    printerConnection: '',
    printerIp: '',
    printerPort: '',
    // Configuración de tickets
    paperWidth: '80',
    fontSize: 12,
    showLot: false,
    showColor: false,
    showExpiry: false,
    showBarcode: false,
    copies: 1,
    timeFormat: '24',
    logoX: 0,
    logoY: 0,
    logoWidth: 200,
    logoHeight: 100,
    // Configuración de facturación
    invoiceSerial: '',
    nextInvoiceNumber: 1,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null
  });
  const [printerStatus, setPrinterStatus] = useState({
    isConnecting: false,
    isSearching: false,
    availableDevices: [],
    selectedDevice: null,
    error: null,
    bluetoothEnabled: false,
    bluetoothReady: false,
    networkStatus: {
      isConnected: false,
      ipAddress: '',
      port: '',
      error: null
    },
    usbStatus: {
      isConnected: false,
      deviceName: '',
      error: null
    }
  });
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [telegramTestStatus, setTelegramTestStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [telegramTestMessage, setTelegramTestMessage] = useState('');
  const [openSoporte, setOpenSoporte] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar configuración general
      const settingsRef = doc(db, 'settings', user.uid);
      const settingsDoc = await getDoc(settingsRef);
      
      // Cargar datos de facturación específicamente
      const billingRef = doc(db, 'billing', user.uid);
      const billingDoc = await getDoc(billingRef);
      
      // Cargar configuración de Telegram del usuario
      const telegramRef = doc(db, 'users', user.uid);
      const telegramDoc = await getDoc(telegramRef);
      let telegramData = {};
      if (telegramDoc.exists() && telegramDoc.data().telegram) {
        telegramData = telegramDoc.data().telegram;
      }
      
      if (settingsDoc.exists() || billingDoc.exists()) {
        const savedSettings = settingsDoc.exists() ? settingsDoc.data() : {};
        const billingData = billingDoc.exists() ? billingDoc.data() : {};

        // Combinar configuraciones con prioridad a los datos de facturación
        setSettings(prevSettings => ({
          ...prevSettings,
          ...savedSettings,
          billing: {
            ...prevSettings.billing,
            ...billingData
          },
          telegram: {
            ...prevSettings.telegram,
            ...telegramData
          }
        }));
        
        if (savedSettings.language !== currentLanguage) {
          changeLanguage(savedSettings.language);
        }
      } else {
        // Si no existen documentos, crear con valores por defecto
        await Promise.all([
          setDoc(settingsRef, settings),
          setDoc(billingRef, settings.billing)
        ]);
      }

      setSnackbar({
        open: true,
        message: 'Configuración cargada correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      setError('Error al cargar la configuración');
      setSnackbar({
        open: true,
        message: 'Error al cargar la configuración',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar cambios en la configuración de la impresora
  const handlePrinterChange = (field) => (event) => {
    setSettings(prev => ({
      ...prev,
      printer: {
        ...prev.printer,
        [field]: event.target.value
      }
    }));
  };

  // Función para manejar cambios en la configuración de Telegram
  const handleTelegramChange = (field) => (event) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings(prev => ({
        ...prev,
        telegram: {
          ...prev.telegram,
          [parent]: {
            ...prev.telegram[parent],
            [child]: event.target.value
          }
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        telegram: {
          ...prev.telegram,
          [field]: event.target.value
        }
      }));
    }
  };

  // Función para probar la conexión de Telegram
  const handleTestTelegram = async () => {
    try {
      setLoading(true);
      
      if (!settings.telegram.botToken || !settings.telegram.chatId) {
        throw new Error('Por favor ingresa el token del bot y el Chat ID');
      }

      await telegramService.testConnection(
        settings.telegram.botToken,
        settings.telegram.chatId
      );

      setSnackbar({
        open: true,
        message: 'Conexión con Telegram exitosa',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al probar conexión con Telegram:', error);
      setSnackbar({
        open: true,
        message: 'Error al probar conexión con Telegram: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para probar la impresora
  const handleTestPrinter = async () => {
    try {
      setPrinting(true);
      await printerService.testPrinter(settings.printer);
      enqueueSnackbar('Prueba de impresión enviada correctamente', { variant: 'success' });
    } catch (error) {
      console.error('Error al probar la impresora:', error);
      enqueueSnackbar('Error al probar la impresora: ' + error.message, { variant: 'error' });
    } finally {
      setPrinting(false);
    }
  };

  const handleSettingChange = (section, field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [`${section}${field.charAt(0).toUpperCase()}${field.slice(1)}`]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);

    try {
      // Preparar los datos de facturación, eliminando campos vacíos
      const billingData = Object.entries(settings.billing).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      // Guardar configuración general
      const settingsRef = doc(db, 'settings', user.uid);
      const settingsToSave = {
        ...settings,
        updatedAt: new Date()
      };
      delete settingsToSave.billing; // Remover datos de facturación del documento principal

      // Guardar datos de facturación en su propia colección
      const billingRef = doc(db, 'billing', user.uid);
      
      // Usar batch para garantizar que ambas operaciones sean atómicas
      const batch = writeBatch(db);
      batch.set(settingsRef, settingsToSave, { merge: true });
      batch.set(billingRef, {
        ...billingData,
        updatedAt: new Date()
      }, { merge: true });

      await batch.commit();

      setSnackbar({
        open: true,
        message: 'Configuración guardada correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setError('Error al guardar la configuración');
      setSnackbar({
        open: true,
        message: 'Error al guardar la configuración',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Función para validar los datos de facturación antes de guardar
  const validateBillingData = () => {
    const required = ['businessName', 'ruc', 'address', 'phone'];
    const missing = required.filter(field => !settings.billing[field]);
    
    if (missing.length > 0) {
      setError(`Los siguientes campos son requeridos: ${missing.join(', ')}`);
      return false;
    }
    return true;
  };

  // Modificar el handler del botón de guardar para incluir validación
  const handleSaveClick = async () => {
    if (!validateBillingData()) {
      setSnackbar({
        open: true,
        message: 'Por favor complete todos los campos requeridos',
        severity: 'warning'
      });
      return;
    }
    await handleSave();
  };

  // Función para verificar el estado de Bluetooth
  const checkBluetoothAvailability = async () => {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth no está disponible en este navegador');
      }

      const availability = await navigator.bluetooth.getAvailability();
      setPrinterStatus(prev => ({
        ...prev,
        bluetoothEnabled: availability,
        bluetoothReady: availability
      }));

      if (!availability) {
        throw new Error('Bluetooth no está activado en el dispositivo');
      }

      return availability;
    } catch (error) {
      setPrinterStatus(prev => ({
        ...prev,
        error: error.message,
        bluetoothEnabled: false,
        bluetoothReady: false
      }));
      return false;
    }
  };

  // Función para buscar dispositivos Bluetooth
  const searchBluetoothDevices = async () => {
    try {
      setPrinterStatus(prev => ({ ...prev, isSearching: true, error: null }));
      
      // Verificar disponibilidad de Bluetooth
      const isAvailable = await checkBluetoothAvailability();
      if (!isAvailable) {
        throw new Error('Bluetooth no está disponible');
      }

      // Solicitar dispositivo Bluetooth
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access']
      }).catch(error => {
        if (error.name === 'NotFoundError') {
          throw new Error('No se encontraron dispositivos Bluetooth');
        } else if (error.name === 'SecurityError') {
          throw new Error('Se requieren permisos de Bluetooth y Ubicación');
        } else if (error.name === 'NotAllowedError') {
          throw new Error('Selección de dispositivo cancelada');
        } else {
          throw new Error('Error al buscar dispositivos: ' + error.message);
        }
      });

      if (!device) {
        throw new Error('No se pudo conectar con el dispositivo');
      }

      // Actualizar estado con el dispositivo encontrado
      setPrinterStatus(prev => ({
        ...prev,
        isSearching: false,
        availableDevices: [{
          name: device.name || 'Dispositivo Desconocido',
          address: device.id,
          connected: device.gatt.connected
        }],
        selectedDevice: device
      }));

      return device;
    } catch (error) {
      setPrinterStatus(prev => ({
        ...prev,
        isSearching: false,
        error: error.message
      }));
      return null;
    }
  };

  // Función para conectar con impresora Bluetooth
  const connectBluetoothPrinter = async (device) => {
    try {
      setPrinterStatus(prev => ({ ...prev, isConnecting: true, error: null }));
      
      if (!device.gatt) {
        throw new Error('Dispositivo no compatible con GATT');
      }

      const server = await device.gatt.connect();
      if (!server) {
        throw new Error('No se pudo conectar al servidor GATT');
      }

      // Actualizar estado de conexión
      setPrinterStatus(prev => ({ 
        ...prev, 
        selectedDevice: device,
        isConnecting: false,
        error: null
      }));
      
      setSnackbar({
        open: true,
        message: 'Impresora conectada correctamente',
        severity: 'success'
      });
    } catch (err) {
      setPrinterStatus(prev => ({ 
        ...prev, 
        isConnecting: false,
        error: 'Error al conectar con la impresora: ' + err.message
      }));
    }
  };

  // Función para conectar impresora por red
  const connectNetworkPrinter = async () => {
    try {
      setPrinterStatus(prev => ({ 
        ...prev, 
        isConnecting: true,
        networkStatus: { ...prev.networkStatus, error: null }
      }));

      const { ipAddress, port } = settings.printer;
      
      if (!ipAddress || !port) {
        throw new Error('Por favor ingresa la dirección IP y el puerto de la impresora');
      }

      // Validar formato de IP
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(ipAddress)) {
        throw new Error('Formato de dirección IP inválido');
      }

      // Validar puerto
      const portNum = parseInt(port);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        throw new Error('Puerto inválido. Debe estar entre 1 y 65535');
      }

      // Intentar conexión (simulación)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPrinterStatus(prev => ({
        ...prev,
        isConnecting: false,
        networkStatus: {
          isConnected: true,
          ipAddress,
          port,
          error: null
        }
      }));

      setSnackbar({
        open: true,
        message: 'Impresora de red conectada correctamente',
        severity: 'success'
      });
    } catch (error) {
      setPrinterStatus(prev => ({
        ...prev,
        isConnecting: false,
        networkStatus: {
          ...prev.networkStatus,
          error: error.message
        }
      }));
    }
  };

  // Función para conectar impresora USB
  const connectUSBPrinter = async () => {
    try {
      setPrinterStatus(prev => ({ 
        ...prev, 
        isConnecting: true,
        usbStatus: { ...prev.usbStatus, error: null }
      }));

      // Verificar si el navegador soporta WebUSB
      if (!navigator.usb) {
        throw new Error('WebUSB no está disponible en este navegador');
      }

      // Solicitar acceso al dispositivo USB
      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x04b8 }, // Brother
          { vendorId: 0x04f9 }, // Epson
          { vendorId: 0x067b }  // Prolific
        ]
      });

      if (!device) {
        throw new Error('No se seleccionó ningún dispositivo USB');
      }

      // Conectar al dispositivo
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);

      setPrinterStatus(prev => ({
        ...prev,
        isConnecting: false,
        usbStatus: {
          isConnected: true,
          deviceName: device.productName || 'Impresora USB',
          error: null
        }
      }));

      setSnackbar({
        open: true,
        message: 'Impresora USB conectada correctamente',
        severity: 'success'
      });
    } catch (error) {
      setPrinterStatus(prev => ({
        ...prev,
        isConnecting: false,
        usbStatus: {
          ...prev.usbStatus,
          error: error.message
        }
      }));
    }
  };

  const handleBackupDialogOpen = () => {
    setBackupDialogOpen(true);
  };

  const handleBackupDialogClose = () => {
    setBackupDialogOpen(false);
  };

  // Función para imprimir página de prueba
  const printTestPage = async () => {
    try {
      setPrinting(true);
      
      // Obtener el contenido del ticket
      const content = document.querySelector('.print-preview-content');
      if (!content) {
        throw new Error('No se pudo encontrar el contenido para imprimir');
      }

      // Crear una ventana de impresión
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión');
      }

      // Escribir el contenido en la ventana de impresión
      printWindow.document.write(`
        <html>
          <head>
            <title>Impresión de Prueba</title>
            <style>
              body {
                font-family: monospace;
                font-size: 12px;
                width: 80mm;
                margin: 0 auto;
                padding: 10px;
              }
              .text-center { text-align: center; }
              .mt-2 { margin-top: 10px; }
              .mb-2 { margin-bottom: 10px; }
              .divider {
                border-top: 1px dashed #000;
                margin: 10px 0;
              }
            </style>
          </head>
          <body>
            ${content.innerHTML}
          </body>
        </html>
      `);

      // Esperar a que el contenido se cargue
      printWindow.document.close();
      printWindow.focus();

      // Imprimir
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setPrinting(false);
        setShowPrintPreview(false);
      }, 500);

    } catch (error) {
      console.error('Error al imprimir:', error);
      setPrinting(false);
      setSnackbar({
        open: true,
        message: 'Error al imprimir: ' + error.message,
        severity: 'error'
      });
    }
  };

  // Función para manejar cambios en la configuración genérica
  const handleGenericChange = (field) => (event) => {
    setSettings(prev => ({
      ...prev,
      generic: {
        ...prev.generic,
        [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
      }
    }));
  };

  // Función para manejar cambios en la configuración del ticket
  const handleTicketChange = (field, subfield) => (event) => {
    if (subfield) {
      if (field === 'logo.position') {
        // Manejo especial para la posición del logo
        const [parent, child] = field.split('.');
        setSettings(prev => ({
          ...prev,
          ticket: {
            ...prev.ticket,
            [parent]: {
              ...prev.ticket[parent],
              position: {
                ...prev.ticket[parent].position,
                [subfield]: event.target.value
              }
            }
          }
        }));
      } else {
        setSettings(prev => ({
          ...prev,
          ticket: {
            ...prev.ticket,
            [field]: {
              ...prev.ticket[field],
              [subfield]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
            }
          }
        }));
      }
    } else {
      setSettings(prev => ({
        ...prev,
        ticket: {
          ...prev.ticket,
          [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
        }
      }));
    }
  };

  // Función para manejar cambios en la configuración del correo
  const handleEmailChange = (field) => (event) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
      }
    }));
  };

  // Función para manejar cambios en la configuración de Akasia Cloud
  const handleAkasiaChange = (field) => (event) => {
    setSettings(prev => ({
      ...prev,
      akasiaCloud: {
        ...prev.akasiaCloud,
        [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
      }
    }));
  };

  // Función para manejar cambios en la configuración bancaria
  const handleBankChange = (bankId, field) => (event) => {
    if (bankId === 'notifyPaymentTo') {
      setSettings(prev => ({
        ...prev,
        banking: {
          ...prev.banking,
          notifyPaymentTo: event.target.value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        banking: {
          ...prev.banking,
          banks: prev.banking.banks.map(bank => 
            bank.id === bankId 
              ? { ...bank, [field]: event.target.value }
              : bank
          )
        }
      }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'settings', currentUser.uid), settings);
      enqueueSnackbar('Configuración guardada exitosamente', { variant: 'success' });
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      enqueueSnackbar('Error al guardar la configuración', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (modalName) => {
    setActiveModal(modalName);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  // ================== INICIO CAMBIO: Renderizado grid de botones ==================
  const configOptions = [
    { key: 'general', label: 'Configuración General', icon: <SettingsIcon fontSize="large" />, modal: GeneralConfigModal },
    { key: 'empresa', label: 'Datos Empresa', icon: <Store fontSize="large" />, modal: EmpresaConfigModal },
    { key: 'idioma', label: 'Idioma y Región', icon: <Language fontSize="large" />, modal: IdiomaConfigModal },
    { key: 'apariencia', label: 'Apariencia', icon: <ColorLens fontSize="large" />, modal: AparienciaConfigModal },
    { key: 'precios', label: 'Precios y Moneda', icon: <MonetizationOn fontSize="large" />, modal: PreciosConfigModal },
    { key: 'facturacion', label: 'Facturación', icon: <Article fontSize="large" />, modal: FacturacionConfigModal },
    { key: 'ncf', label: 'NCF', icon: <Article fontSize="large" />, modal: ConfiguracionNCF },
    { key: 'bancos', label: 'Datos Bancarios', icon: <AccountBalance fontSize="large" />, modal: BancosConfigModal },
    { key: 'puntos', label: 'Programa Puntos', icon: <Loyalty fontSize="large" />, modal: PuntosConfigModal },
    { key: 'impresora', label: 'Impresora', icon: <Print fontSize="large" />, modal: ImpresoraConfigModal },
    { key: 'tickets', label: 'Tickets', icon: <ReceiptLong fontSize="large" />, modal: TicketsConfigModal },
    { key: 'bascula', label: 'Báscula', icon: <Scale fontSize="large" />, modal: BasculaConfigModal },
    { key: 'correo', label: 'Correo', icon: <Email fontSize="large" />, modal: CorreoConfigModal },
    { key: 'telegram', label: 'Bot Telegram', icon: <Telegram fontSize="large" />, modal: TelegramConfigModal },
    { key: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon fontSize="large" />, modal: WhatsAppConfigModal },
    { key: 'notificaciones', label: 'Notificaciones', icon: <NotificationsActive fontSize="large" />, modal: NotificacionesConfigModal },
    { key: 'seguridad', label: 'Seguridad', icon: <SecurityIcon fontSize="large" />, modal: SeguridadConfigModal },
    { key: 'respaldos', label: 'Respaldos', icon: <Backup fontSize="large" />, modal: RespaldosConfigModal },
    { key: 'protector', label: 'Protector de Pantalla', icon: <Lock fontSize="large" />, modal: ProtectorPantallaConfigModal },
  ];
  // ================== FIN CAMBIO ==================

  // ================== INICIO CAMBIO: Renderizado del modal dinámico ==================
  const handleTelegramModalChange = (field) => (e) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings(prev => ({
        ...prev,
        telegram: {
          ...prev.telegram,
          [parent]: {
            ...prev.telegram[parent],
            [child]: e.target.checked
          }
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        telegram: {
          ...prev.telegram,
          [field]: e.target.value
        }
      }));
    }
  };

  const handleTelegramNotifChange = (notif) => (e) => {
    setSettings(prev => ({
      ...prev,
      telegram: {
        ...prev.telegram,
        notifications: {
          ...prev.telegram.notifications,
          [notif]: e.target.checked
        }
      }
    }));
  };

  const handleSaveTelegram = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { telegram: settings.telegram });
      setSnackbar({
        open: true,
        message: 'Configuración de Telegram guardada correctamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al guardar la configuración de Telegram',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegramModal = async () => {
    setTelegramTestStatus('loading');
    setTelegramTestMessage('');
    try {
      if (!settings.telegram.botToken || !settings.telegram.chatId) {
        throw new Error('Por favor ingresa el token del bot y el Chat ID');
      }
      await telegramService.testConnection(
        settings.telegram.botToken,
        settings.telegram.chatId
      );
      setTelegramTestStatus('success');
      setTelegramTestMessage('Conexión con Telegram exitosa');
    } catch (error) {
      setTelegramTestStatus('error');
      setTelegramTestMessage('Error al probar conexión con Telegram: ' + error.message);
    }
  };

  const renderModal = () => {
    if (!activeModal) return null;
    const option = configOptions.find(opt => opt.key === activeModal);
    if (!option) return null;
    const ModalComponent = option.modal;
    if (activeModal === 'telegram') {
      return (
        <Dialog open={!!activeModal} onClose={() => setActiveModal(null)} fullScreen={isMobile} maxWidth="sm" fullWidth>
          <Suspense fallback={<Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>}>
            <ModalComponent
              form={settings.telegram}
              onChange={handleTelegramModalChange}
              onNotifChange={handleTelegramNotifChange}
              onSave={handleSaveTelegram}
              onTest={handleTestTelegramModal}
              testStatus={telegramTestStatus}
              testMessage={telegramTestMessage}
              saving={saving}
              onClose={() => setActiveModal(null)}
            />
          </Suspense>
        </Dialog>
      );
    }
    if (activeModal === 'tickets') {
      return (
        <Dialog open={!!activeModal} onClose={() => setActiveModal(null)} fullScreen={isMobile} maxWidth="md" fullWidth>
          <Suspense fallback={<Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>}>
            <ModalComponent
              onClose={() => setActiveModal(null)}
              empresaData={{
                businessName: settings.billing.businessName,
                address: settings.billing.address,
                ruc: settings.billing.ruc,
                phone: settings.billing.phone,
                email: settings.billing.email
              }}
              plan={settings.plan || 'free'}
            />
          </Suspense>
        </Dialog>
      );
    }
    if (activeModal === 'whatsapp') {
      return (
        <Dialog open={!!activeModal} onClose={() => setActiveModal(null)} fullScreen={isMobile} maxWidth="sm" fullWidth>
          <Suspense fallback={<Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>}>
            <WhatsAppConfigModal
              onClose={() => setActiveModal(null)}
            />
          </Suspense>
        </Dialog>
      );
    }
    return (
      <Dialog open={!!activeModal} onClose={() => setActiveModal(null)} fullScreen={isMobile} maxWidth="sm" fullWidth>
        <Suspense fallback={<Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>}>
          <ModalComponent onClose={() => setActiveModal(null)} />
        </Suspense>
      </Dialog>
    );
  };
  // ================== FIN CAMBIO ==================

  // ================== INICIO CAMBIO: Renderizado del grid de botones ==================
  const configGroups = [
    {
      title: 'General',
      keys: ['general', 'idioma']
    },
    {
      title: 'Empresa',
      keys: ['empresa']
    },
    {
      title: 'Facturación',
      keys: ['facturacion', 'precios', 'bancos', 'ncf']
    },
    {
      title: 'Apariencia',
      keys: ['apariencia']
    },
    {
      title: 'Impresión',
      keys: ['impresora', 'tickets', 'bascula']
    },
    {
      title: 'Notificaciones',
      keys: ['notificaciones', 'telegram', 'correo', 'whatsapp']
    },
    {
      title: 'Seguridad y Respaldos',
      keys: ['seguridad', 'respaldos', 'puntos', 'protector']
    }
  ];
  // ================== FIN CAMBIO ==================

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Debes iniciar sesión para acceder a la configuración.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Skeleton 
                variant="rectangular" 
                height={200} 
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (permissionsLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hasPermission('settings', 'edit')) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No tienes permiso para modificar esta configuración.
        </Alert>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ p: 2, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Configuración
        </Typography>
        <Grid container spacing={4}>
          {configGroups.map((group, idx) => (
            <Grid item xs={12} key={group.title}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary', mb: 2, mt: idx === 0 ? 0 : 4, textAlign: 'center' }}>
                  {group.title}
                </Typography>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 900 }}>
                    {group.keys.map(key => {
                      const opt = configOptions.find(o => o.key === key);
                      if (!opt) return null;
                      return (
                        <Grid item xs={12} sm={6} md={4} key={opt.key}>
                          <Button
                            variant="outlined"
                            startIcon={opt.icon}
                            fullWidth
                            sx={{ p: 3, justifyContent: 'flex-start', fontSize: '1.1rem', fontWeight: 500 }}
                            onClick={() => setActiveModal(opt.key)}
                          >
                            {opt.label}
                          </Button>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Box>
              {idx < configGroups.length - 1 && (
                <Divider sx={{ my: 4 }} />
              )}
            </Grid>
          ))}
        </Grid>
        {renderModal()}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => setOpenSoporte(true)}
            sx={{ px: 5, py: 2, fontWeight: 600, fontSize: '1.1rem', boxShadow: 2 }}
          >
            Soporte técnico
          </Button>
        </Box>
        <SoporteTecnicoModal open={openSoporte} onClose={() => setOpenSoporte(false)} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Configuración
      </Typography>
      <Grid container spacing={4}>
        {configGroups.map((group, idx) => (
          <Grid item xs={12} key={group.title}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary', mb: 2, mt: idx === 0 ? 0 : 4, textAlign: 'center' }}>
                {group.title}
              </Typography>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 900 }}>
                  {group.keys.map(key => {
                    const opt = configOptions.find(o => o.key === key);
                    if (!opt) return null;
                    return (
                      <Grid item xs={12} sm={6} md={4} key={opt.key}>
                        <Button
                          variant="outlined"
                          startIcon={opt.icon}
                          fullWidth
                          sx={{ p: 3, justifyContent: 'flex-start', fontSize: '1.1rem', fontWeight: 500 }}
                          onClick={() => setActiveModal(opt.key)}
                        >
                          {opt.label}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Box>
            {idx < configGroups.length - 1 && (
              <Divider sx={{ my: 4 }} />
            )}
          </Grid>
        ))}
      </Grid>
      {renderModal()}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => setOpenSoporte(true)}
          sx={{ px: 5, py: 2, fontWeight: 600, fontSize: '1.1rem', boxShadow: 2 }}
        >
          Soporte técnico
        </Button>
      </Box>
      <SoporteTecnicoModal open={openSoporte} onClose={() => setOpenSoporte(false)} />
    </Box>
  );
}; 