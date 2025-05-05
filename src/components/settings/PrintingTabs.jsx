import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider
} from '@mui/material';
import { LocalPrintshop, Receipt, Description } from '@mui/icons-material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`printing-tabpanel-${index}`}
      aria-labelledby={`printing-tab-${index}`}
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

function a11yProps(index) {
  return {
    id: `printing-tab-${index}`,
    'aria-controls': `printing-tabpanel-${index}`,
  };
}

export const PrintingTabs = ({ settings, onSettingChange, onSave }) => {
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);

  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
    setSubTab(0);
  };

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Pestañas principales */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={mainTab} onChange={handleMainTabChange} aria-label="configuración de impresión">
          <Tab icon={<LocalPrintshop />} label="Impresora" {...a11yProps(0)} />
          <Tab icon={<Receipt />} label="Tickets" {...a11yProps(1)} />
          <Tab icon={<Description />} label="Facturación" {...a11yProps(2)} />
        </Tabs>
      </Paper>

      {/* Contenido de Impresora */}
      <TabPanel value={mainTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Conexión</InputLabel>
              <Select
                value={settings.printerConnection || ''}
                onChange={(e) => onSettingChange('printer', 'connection')(e)}
                label="Tipo de Conexión"
              >
                <MenuItem value="usb">USB</MenuItem>
                <MenuItem value="network">Red</MenuItem>
                <MenuItem value="bluetooth">Bluetooth</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {settings.printerConnection === 'network' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Dirección IP"
                  value={settings.printerIp || ''}
                  onChange={(e) => onSettingChange('printer', 'ip')(e)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Puerto"
                  value={settings.printerPort || ''}
                  onChange={(e) => onSettingChange('printer', 'port')(e)}
                />
              </Grid>
            </>
          )}
        </Grid>
      </TabPanel>

      {/* Contenido de Tickets */}
      <TabPanel value={mainTab} index={1}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={subTab} onChange={handleSubTabChange} aria-label="configuración de tickets">
            <Tab label="Impresora Tickets" {...a11yProps(0)} />
            <Tab label="Contenido" {...a11yProps(1)} />
            <Tab label="Opciones adicionales" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={subTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Ancho de Papel</InputLabel>
                <Select
                  value={settings.paperWidth || ''}
                  onChange={(e) => onSettingChange('ticket', 'paperWidth')(e)}
                  label="Ancho de Papel"
                >
                  <MenuItem value="58">58MM</MenuItem>
                  <MenuItem value="80">80MM</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tamaño de Fuente"
                type="number"
                value={settings.fontSize || ''}
                onChange={(e) => onSettingChange('ticket', 'fontSize')(e)}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={subTab} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Elementos del Ticket
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.showLot || false}
                    onChange={(e) => onSettingChange('ticket', 'showLot')(e)}
                  />
                }
                label="Mostrar Lote"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.showColor || false}
                    onChange={(e) => onSettingChange('ticket', 'showColor')(e)}
                  />
                }
                label="Mostrar Color"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.showExpiry || false}
                    onChange={(e) => onSettingChange('ticket', 'showExpiry')(e)}
                  />
                }
                label="Mostrar Caducidad"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.showBarcode || false}
                    onChange={(e) => onSettingChange('ticket', 'showBarcode')(e)}
                  />
                }
                label="Mostrar Código de Barras"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={subTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número de Copias"
                type="number"
                value={settings.copies || ''}
                onChange={(e) => onSettingChange('ticket', 'copies')(e)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Formato de Hora</InputLabel>
                <Select
                  value={settings.timeFormat || ''}
                  onChange={(e) => onSettingChange('ticket', 'timeFormat')(e)}
                  label="Formato de Hora"
                >
                  <MenuItem value="12">12 horas</MenuItem>
                  <MenuItem value="24">24 horas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Configuración de Logo
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Posición X"
                type="number"
                value={settings.logoX || ''}
                onChange={(e) => onSettingChange('ticket', 'logoX')(e)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Posición Y"
                type="number"
                value={settings.logoY || ''}
                onChange={(e) => onSettingChange('ticket', 'logoY')(e)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Alto"
                type="number"
                value={settings.logoHeight || ''}
                onChange={(e) => onSettingChange('ticket', 'logoHeight')(e)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ancho"
                type="number"
                value={settings.logoWidth || ''}
                onChange={(e) => onSettingChange('ticket', 'logoWidth')(e)}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </TabPanel>

      {/* Contenido de Facturación */}
      <TabPanel value={mainTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Número de Serie"
              value={settings.invoiceSerial || ''}
              onChange={(e) => onSettingChange('invoice', 'serial')(e)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Próximo Número"
              type="number"
              value={settings.nextInvoiceNumber || ''}
              onChange={(e) => onSettingChange('invoice', 'nextNumber')(e)}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={onSave}>
          Guardar Cambios
        </Button>
      </Box>
    </Box>
  );
}; 