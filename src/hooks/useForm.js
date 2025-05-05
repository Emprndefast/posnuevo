import { useState, useCallback } from 'react';
import validations from '../config/validations/validations';

const useForm = (initialValues = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    let error = '';
    
    // Validaciones generales
    if (validations.general.required(value)) {
      error = validations.general.required(value);
    }

    // Validaciones específicas según el campo
    switch (name) {
      case 'name':
        error = validations.products.name(value);
        break;
      case 'price':
        error = validations.products.price(value);
        break;
      case 'stock':
        error = validations.products.stock(value);
        break;
      case 'email':
        error = validations.customers.email(value);
        break;
      case 'phone':
        error = validations.customers.phone(value);
        break;
      case 'quantity':
        error = validations.sales.quantity(value);
        break;
      case 'username':
        error = validations.users.username(value);
        break;
      case 'password':
        error = validations.users.password(value);
        break;
      case 'confirmPassword':
        error = validations.users.confirmPassword(value, values.password);
        break;
      default:
        break;
    }

    return error;
  }, [values]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    const error = validateField(name, newValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateField]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateField]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const newErrors = {};
    Object.keys(values).forEach(key => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    // Si no hay errores, proceder con el envío
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Error al enviar el formulario:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validateField, onSubmit]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setErrors
  };
};

export default useForm; 