export const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(value);
};

export const formatNumber = (value) => {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatQuantity = (quantity) => {
  return quantity.toString().padStart(3, '0');
}; 