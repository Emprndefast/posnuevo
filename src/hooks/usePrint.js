import { useState } from 'react';
import printService from '../services/printService';

const usePrint = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const print = async (type, data) => {
    setLoading(true);
    setError(null);

    try {
      switch (type) {
        case 'sale':
          await printService.printSale(data);
          break;
        case 'label':
          await printService.printLabel(data);
          break;
        case 'invoice':
          await printService.printInvoice(data);
          break;
        default:
          throw new Error('Tipo de impresión no válido');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    print,
    loading,
    error
  };
};

export default usePrint; 