import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import NetProfitReport from '../components/reports/NetProfitReport';
import SalesByBranchReport from '../components/reports/SalesByBranchReport';
import SalesByUserReport from '../components/reports/SalesByUserReport';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StoreIcon from '@mui/icons-material/Store';
import PersonIcon from '@mui/icons-material/Person';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Reportes = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        Reportes Financieros Avanzados
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<AssessmentIcon />} iconPosition="start" label="Ganancia Neta" />
          <Tab icon={<StoreIcon />} iconPosition="start" label="Ventas por Sucursal" />
          <Tab icon={<PersonIcon />} iconPosition="start" label="Ventas por Usuario" />
        </Tabs>
      </Paper>

      <TabPanel value={value} index={0}>
        <NetProfitReport />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SalesByBranchReport />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <SalesByUserReport />
      </TabPanel>
    </Box>
  );
};

export default Reportes;