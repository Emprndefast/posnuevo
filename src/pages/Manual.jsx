import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Tabs, 
  Tab, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button
} from '@mui/material';
import {
  ExpandMore,
  Book,
  Help,
  Settings,
  Build,
  Description,
  Info,
  Keyboard,
  Print,
  People,
  Inventory,
  Assessment,
  Security,
  CloudUpload,
  Email,
  Phone,
  Web,
  Computer,
  Storage,
  Sync,
  BugReport,
  Code,
  Cloud,
  Speed,
  Lock,
  Dashboard,
  ArrowBack,
  Bluetooth
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Manual = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState('introduccion');
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [manualContent, setManualContent] = useState(null);
  const [bluetoothDevices, setBluetoothDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Función para escanear dispositivos Bluetooth
  const scanBluetoothDevices = async () => {
    try {
      setIsScanning(true);
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth no está disponible en este navegador');
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access']
      });

      console.log('Dispositivo encontrado:', device.name);
      setBluetoothDevices(prev => [...prev, device]);
    } catch (error) {
      console.error('Error al escanear dispositivos:', error);
      // Mostrar mensaje de error al usuario
    } finally {
      setIsScanning(false);
    }
  };

  const renderManualBasico = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manual Básico de Usuario
      </Typography>
      <Typography paragraph>
        Bienvenido a POS NT, tu sistema punto de venta inteligente. Este manual te guiará a través de las operaciones básicas diarias que necesitarás realizar.
      </Typography>

      <Grid container spacing={3}>
        {/* Inicio de Sesión */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Inicio de Sesión"
              avatar={<Security />}
              action={
                <IconButton onClick={() => toggleSection('inicio')}>
                  {expandedSections['inicio'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['inicio']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Acceder al Sistema"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Hacer doble clic en el ícono de POS NT</Typography>
                          <Typography component="li">Ingresar usuario y contraseña</Typography>
                          <Typography component="li">Seleccionar turno (si aplica)</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Cambio de Usuario"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Clic en el ícono de usuario</Typography>
                          <Typography component="li">Seleccionar "Cerrar Sesión"</Typography>
                          <Typography component="li">Ingresar credenciales del nuevo usuario</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Ventas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Ventas"
              avatar={<Description />}
              action={
                <IconButton onClick={() => toggleSection('ventas')}>
                  {expandedSections['ventas'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['ventas']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Nueva Venta"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Clic en "Nueva Venta"</Typography>
                          <Typography component="li">Escanear productos o buscar manualmente</Typography>
                          <Typography component="li">Verificar cantidades</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Proceso de Pago"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">F12 o botón "Cobrar"</Typography>
                          <Typography component="li">Seleccionar método de pago</Typography>
                          <Typography component="li">Ingresar monto recibido</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Inventario */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Inventario"
              avatar={<Inventory />}
              action={
                <IconButton onClick={() => toggleSection('inventario')}>
                  {expandedSections['inventario'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['inventario']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Consulta de Stock"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Menú Inventario</Typography>
                          <Typography component="li">Ingresar código o nombre</Typography>
                          <Typography component="li">Filtrar por categoría</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Recepción de Mercancía"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Menú Inventario &gt; Entradas</Typography>
                          <Typography component="li">Seleccionar proveedor</Typography>
                          <Typography component="li">Escanear productos</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Clientes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Clientes"
              avatar={<People />}
              action={
                <IconButton onClick={() => toggleSection('clientes')}>
                  {expandedSections['clientes'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['clientes']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Registro de Cliente"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Menú Clientes &gt; Nuevo</Typography>
                          <Typography component="li">Datos básicos obligatorios</Typography>
                          <Typography component="li">Información de contacto</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Historial de Cliente"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Seleccionar cliente</Typography>
                          <Typography component="li">Filtrar por fecha</Typography>
                          <Typography component="li">Ver detalles de compras</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Atajos de Teclado */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Atajos de Teclado"
              avatar={<Keyboard />}
              action={
                <IconButton onClick={() => toggleSection('atajos')}>
                  {expandedSections['atajos'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['atajos']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Ventas"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">F1: Ayuda</Typography>
                          <Typography component="li">F2: Buscar producto</Typography>
                          <Typography component="li">F3: Buscar por categoría</Typography>
                          <Typography component="li">F4: Lista de precios</Typography>
                          <Typography component="li">F5: Refrescar pantalla</Typography>
                          <Typography component="li">F8: Reimprimir último ticket</Typography>
                          <Typography component="li">F12: Cobrar</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Navegación"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Ctrl + N: Nueva venta</Typography>
                          <Typography component="li">Ctrl + F: Buscar</Typography>
                          <Typography component="li">Ctrl + P: Imprimir</Typography>
                          <Typography component="li">Ctrl + S: Guardar</Typography>
                          <Typography component="li">Esc: Cancelar/Cerrar</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderManualAvanzado = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manual Avanzado
      </Typography>
      <Typography paragraph>
        Guía detallada para usuarios avanzados y administradores del sistema.
      </Typography>

      <Grid container spacing={3}>
        {/* Configuración Avanzada */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Configuración Avanzada"
              avatar={<Settings />}
              action={
                <IconButton onClick={() => toggleSection('configuracion')}>
                  {expandedSections['configuracion'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['configuracion']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Personalización de la Interfaz"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Modificación de colores</Typography>
                          <Typography component="li">Ajuste de fuentes</Typography>
                          <Typography component="li">Diseño de layouts</Typography>
                          <Typography component="li">Personalización de iconos</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Configuración de Pantallas"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Múltiples monitores</Typography>
                          <Typography component="li">Resolución por pantalla</Typography>
                          <Typography component="li">Modo táctil</Typography>
                          <Typography component="li">Modo quiosco</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Gestión Avanzada de Inventario */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Gestión Avanzada de Inventario"
              avatar={<Storage />}
              action={
                <IconButton onClick={() => toggleSection('inventario-avanzado')}>
                  {expandedSections['inventario-avanzado'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['inventario-avanzado']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Control de Lotes"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Seguimiento por número de lote</Typography>
                          <Typography component="li">Fechas de caducidad</Typography>
                          <Typography component="li">Trazabilidad completa</Typography>
                          <Typography component="li">Alertas personalizadas</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Múltiples Almacenes"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Gestión por ubicación</Typography>
                          <Typography component="li">Transferencias entre almacenes</Typography>
                          <Typography component="li">Stock mínimo por almacén</Typography>
                          <Typography component="li">Rutas de distribución</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Sistema de Ventas Avanzado */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Sistema de Ventas Avanzado"
              avatar={<Dashboard />}
              action={
                <IconButton onClick={() => toggleSection('ventas-avanzado')}>
                  {expandedSections['ventas-avanzado'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['ventas-avanzado']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Gestión de Precios"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Múltiples listas de precios</Typography>
                          <Typography component="li">Precios por volumen</Typography>
                          <Typography component="li">Descuentos automáticos</Typography>
                          <Typography component="li">Promociones programadas</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Facturación Electrónica"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Configuración del PAC</Typography>
                          <Typography component="li">Timbrado automático</Typography>
                          <Typography component="li">Cancelación de facturas</Typography>
                          <Typography component="li">Notas de crédito</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Gestión de Usuarios Avanzada */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Gestión de Usuarios Avanzada"
              avatar={<Lock />}
              action={
                <IconButton onClick={() => toggleSection('usuarios-avanzado')}>
                  {expandedSections['usuarios-avanzado'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['usuarios-avanzado']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Roles y Permisos"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Creación de roles personalizados</Typography>
                          <Typography component="li">Permisos granulares</Typography>
                          <Typography component="li">Restricciones por módulo</Typography>
                          <Typography component="li">Auditoría de acciones</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Configuración de Seguridad"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Políticas de contraseñas</Typography>
                          <Typography component="li">Autenticación de dos factores</Typography>
                          <Typography component="li">Registro de actividades</Typography>
                          <Typography component="li">Bloqueo por intentos fallidos</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderSolucionProblemas = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Solución de Problemas
      </Typography>
      <Typography paragraph>
        Guía para resolver problemas comunes y errores del sistema.
      </Typography>

      <Grid container spacing={3}>
        {/* Problemas de Inicio de Sesión */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Problemas de Inicio de Sesión"
              avatar={<Security />}
              action={
                <IconButton onClick={() => toggleSection('login-problemas')}>
                  {expandedSections['login-problemas'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['login-problemas']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Error: Usuario o contraseña incorrectos"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Verificar que el Bloq Mayús no esté activado</Typography>
                          <Typography component="li">Intentar restablecer la contraseña</Typography>
                          <Typography component="li">Si persiste, contactar al administrador</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Error: No se puede conectar al servidor"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Verificar la conexión a internet</Typography>
                          <Typography component="li">Comprobar que el servidor esté en línea</Typography>
                          <Typography component="li">Revisar la configuración del firewall</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Problemas con la Impresora */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Problemas con la Impresora"
              avatar={<Print />}
              action={
                <IconButton onClick={() => toggleSection('impresora-problemas')}>
                  {expandedSections['impresora-problemas'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['impresora-problemas']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="La impresora no responde"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Verificar que esté encendida y conectada</Typography>
                          <Typography component="li">Comprobar el estado del papel</Typography>
                          <Typography component="li">Reiniciar la impresora</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Impresión cortada o borrosa"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Limpiar el cabezal de impresión</Typography>
                          <Typography component="li">Verificar la calidad del papel térmico</Typography>
                          <Typography component="li">Ajustar la configuración de densidad</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Problemas de Rendimiento */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Problemas de Rendimiento"
              avatar={<Speed />}
              action={
                <IconButton onClick={() => toggleSection('rendimiento-problemas')}>
                  {expandedSections['rendimiento-problemas'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['rendimiento-problemas']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Sistema lento"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Verificar uso de recursos</Typography>
                          <Typography component="li">Limpiar caché</Typography>
                          <Typography component="li">Optimizar base de datos</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Reportes tardan en cargar"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Verificar índices de la base de datos</Typography>
                          <Typography component="li">Optimizar consultas</Typography>
                          <Typography component="li">Utilizar cache para reportes frecuentes</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Contacto Soporte Técnico */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Contacto Soporte Técnico"
              avatar={<Help />}
              action={
                <IconButton onClick={() => toggleSection('soporte')}>
                  {expandedSections['soporte'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['soporte']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Niveles de Soporte"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Nivel 1: soporte@posnt.com</Typography>
                          <Typography component="li">Nivel 2: soporte.tech@posnt.com</Typography>
                          <Typography component="li">Nivel 3: emergencias@posnt.com</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Información Requerida"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">ID de Usuario</Typography>
                          <Typography component="li">Versión del sistema</Typography>
                          <Typography component="li">Descripción detallada del problema</Typography>
                          <Typography component="li">Capturas de pantalla si aplica</Typography>
                          <Typography component="li">Logs relevantes</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Configuración de Impresora Bluetooth */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Configuración de Impresora Bluetooth"
              avatar={<Print />}
              action={
                <IconButton onClick={() => toggleSection('bluetooth-config')}>
                  {expandedSections['bluetooth-config'] ? <ExpandMore /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections['bluetooth-config']} timeout="auto" unmountOnExit>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Configuración en iPhone"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Abrir Configuración &gt; Bluetooth</Typography>
                          <Typography component="li">Activar Bluetooth</Typography>
                          <Typography component="li">Esperar a que aparezca la impresora</Typography>
                          <Typography component="li">Seleccionar la impresora para emparejar</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Configuración en Safari"
                      secondary={
                        <Box component="ul" sx={{ ml: 2 }}>
                          <Typography component="li">Abrir la aplicación POS NT</Typography>
                          <Typography component="li">Ir a Configuración &gt; Impresoras</Typography>
                          <Typography component="li">Hacer clic en &quot;Buscar Impresoras&quot;</Typography>
                          <Typography component="li">Seleccionar la impresora de la lista</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={scanBluetoothDevices}
                        disabled={isScanning}
                        startIcon={<Bluetooth />}
                        sx={{ width: '100%' }}
                      >
                        {isScanning ? 'Buscando dispositivos...' : 'Buscar Impresoras Bluetooth'}
                      </Button>
                    </Box>
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Botón de retroceso */}
      <Box sx={{ 
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          variant="outlined"
          sx={{
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              borderColor: theme.palette.text.primary
            },
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          Volver al Sistema
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Manual de Usuario
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          >
            <Tab 
              icon={<Book />} 
              label="Manual Básico" 
              sx={{ 
                color: selectedTab === 0 ? theme.palette.primary.main : 'text.secondary',
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              }}
            />
            <Tab 
              icon={<Settings />} 
              label="Manual Avanzado"
              sx={{ 
                color: selectedTab === 1 ? theme.palette.primary.main : 'text.secondary',
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              }}
            />
            <Tab 
              icon={<Help />} 
              label="Solución de Problemas"
              sx={{ 
                color: selectedTab === 2 ? theme.palette.primary.main : 'text.secondary',
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              }}
            />
          </Tabs>
        </Box>

        {selectedTab === 0 && renderManualBasico()}
        {selectedTab === 1 && renderManualAvanzado()}
        {selectedTab === 2 && renderSolucionProblemas()}
      </Paper>
    </Container>
  );
};

export default Manual; 