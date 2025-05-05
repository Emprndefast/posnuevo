// 📁 src/components/SetupWizard/SetupWizard.js
import React, { useState } from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Paper,
  Typography,
  useTheme,
  Button,
  MobileStepper,
  useMediaQuery,
  LinearProgress,
  Container
} from '@mui/material';
import {
  Store as StoreIcon,
  Print as PrintIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import StepBusinessInfo from './StepBusinessInfo';
import StepPreferences from './StepPreferences';
import StepMainUser from './StepMainUser';
import StepPrinterSetup from './StepPrinterSetup';
import StepFinish from './StepFinish';

const steps = [
  {
    label: 'Información del negocio',
    description: 'Configura los datos básicos de tu empresa',
    icon: <StoreIcon />,
  },
  {
    label: 'Preferencias del sistema',
    description: 'Personaliza la configuración según tus necesidades',
    icon: <SettingsIcon />,
  },
  {
    label: 'Configurar impresora',
    description: 'Conecta y configura tu impresora térmica',
    icon: <PrintIcon />,
  },
  {
    label: 'Usuario principal',
    description: 'Establece el usuario administrador',
    icon: <PersonIcon />,
  },
  {
    label: 'Finalización',
    description: '¡Todo listo para comenzar!',
    icon: <CheckCircleIcon />,
  }
];

export default function SetupWizard({ onFinish, uid }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [wizardData, setWizardData] = useState({
    business: {},
    preferences: {},
    printer: {},
    mainUser: {},
  });

  const handleNext = (data) => {
    const newProgress = ((activeStep + 1) / steps.length) * 100;
    setWizardData(prev => ({ ...prev, ...data }));
    setActiveStep(prev => prev + 1);
    setProgress(newProgress);
  };

  const handleBack = () => {
    const newProgress = ((activeStep - 1) / steps.length) * 100;
    setActiveStep(prev => prev - 1);
    setProgress(newProgress);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <StepBusinessInfo
            data={wizardData.business}
            onNext={data => handleNext({ business: data })}
          />
        );
      case 1:
        return (
          <StepPreferences
            data={wizardData.preferences}
            onNext={data => handleNext({ preferences: data })}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <StepPrinterSetup
            data={wizardData.printer}
            onNext={data => handleNext({ printer: data })}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <StepMainUser
            data={wizardData.mainUser}
            onNext={data => handleNext({ mainUser: data })}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <StepFinish
            allData={wizardData}
            uid={uid}
            onFinish={onFinish}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper 
        sx={{ 
          maxWidth: 800, 
          mx: 'auto', 
          mt: 4, 
          p: 3, 
          borderRadius: 2,
          boxShadow: theme.shadows[3]
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Bienvenido a POS NT
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configura tu sistema en unos pocos pasos
          </Typography>
        </Box>

        {!isMobile ? (
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{ mb: 4 }}
          >
            {steps.map(({ label, description, icon }) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      width: 40,
                      height: 40,
                      bgcolor: activeStep >= steps.indexOf({ label }) ? 'primary.main' : 'grey.300',
                      color: 'white',
                      borderRadius: '50%',
                      '& .MuiStepIcon-text': {
                        fill: 'white'
                      }
                    }
                  }}
                  icon={icon}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" align="center" gutterBottom>
              {steps[activeStep].label}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              {steps[activeStep].description}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ mt: 2, height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        <Box sx={{ mt: 4, minHeight: 400 }}>
          {renderStepContent()}
        </Box>

        {isMobile && (
          <MobileStepper
            variant="progress"
            steps={steps.length}
            position="static"
            activeStep={activeStep}
            sx={{ mt: 3, flexGrow: 1 }}
            nextButton={
              <Button size="small" disabled={activeStep === steps.length - 1}>
                Siguiente
              </Button>
            }
            backButton={
              <Button size="small" disabled={activeStep === 0}>
                Atrás
              </Button>
            }
          />
        )}
      </Paper>
    </Container>
  );
}
