import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useValidation } from '../context/ValidationContext';

export const useSetupValidation = (type) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { validateUserData, validateBusinessData, validatePrinterData } = useValidation();
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateUser = async () => {
      setIsValidating(true);
      try {
        // Validar datos del usuario
        const userValidation = validateUserData({
          name: user?.displayName,
          email: user?.email,
          phone: user?.phoneNumber
        });

        if (!userValidation.isValid) {
          setValidationErrors(userValidation.errors);
          navigate('/modern-dashboard');
          return;
        }

        // Validar datos específicos según el tipo de asistente
        if (type === 'admin' || type === 'propietario') {
          const businessValidation = validateBusinessData({
            name: user?.businessData?.name,
            address: user?.businessData?.address,
            phone: user?.businessData?.phone,
            email: user?.businessData?.email
          });

          if (!businessValidation.isValid) {
            setValidationErrors(businessValidation.errors);
            navigate('/modern-dashboard');
            return;
          }

          const printerValidation = validatePrinterData({
            printerType: user?.printerConfig?.printerType,
            model: user?.printerConfig?.model,
            connection: user?.printerConfig?.connection,
            ipAddress: user?.printerConfig?.ipAddress,
            port: user?.printerConfig?.port
          });

          if (!printerValidation.isValid) {
            setValidationErrors(printerValidation.errors);
            navigate('/modern-dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error en la validación:', error);
        setValidationErrors(['Error al validar los datos']);
        navigate('/modern-dashboard');
      } finally {
        setIsValidating(false);
      }
    };

    validateUser();
  }, [user, type, navigate, validateUserData, validateBusinessData, validatePrinterData]);

  return {
    validationErrors,
    isValidating
  };
}; 