import React, { createContext, useContext, useState } from 'react';
import printService from '../services/printService';
import { usePrinter } from './PrinterContext';
import { useSnackbar } from 'notistack';

const PrintContext = createContext();

export const DOCUMENT_TYPES = {
  SALE: 'sale',
  PRE_INVOICE: 'pre-invoice',
  FISCAL_INVOICE: 'fiscal-invoice',
  LABEL: 'label',
  TEST: 'test',
  REPORT: 'report'
};

export const usePrint = () => {
  const context = useContext(PrintContext);
  if (!context) {
    throw new Error('usePrint debe ser usado dentro de un PrintProvider');
  }
  return context;
};

export const PrintProvider = ({ children }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState(null);
  const [lastPrintJob, setLastPrintJob] = useState(null);
  const { isConnected, printerConfig } = usePrinter();
  const { enqueueSnackbar } = useSnackbar();

  const validatePrinterConnection = () => {
    if (!isConnected) {
      const error = new Error('La impresora no está conectada');
      setError(error.message);
      enqueueSnackbar('La impresora no está conectada', { 
        variant: 'error',
        autoHideDuration: 3000 
      });
      throw error;
    }
  };

  const print = async (type, data) => {
    try {
      validatePrinterConnection();
      
      setIsPrinting(true);
      setError(null);

      const printData = {
        ...data,
        printer: printerConfig.model,
        copies: data.copies || 1,
        timestamp: new Date().toISOString()
      };

      switch (type) {
        case DOCUMENT_TYPES.SALE:
          await printService.printInvoice(printData);
          break;
        case DOCUMENT_TYPES.PRE_INVOICE:
          await printService.printPreInvoice(printData);
          break;
        case DOCUMENT_TYPES.FISCAL_INVOICE:
          await printService.printFiscalInvoice(printData);
          break;
        case DOCUMENT_TYPES.LABEL:
          await printService.printProductLabel(printData);
          break;
        case DOCUMENT_TYPES.REPORT:
          await printService.printReport(printData);
          break;
        case DOCUMENT_TYPES.TEST:
          await printService.printTestPage(printData);
          break;
        default:
          throw new Error(`Tipo de impresión no válido: ${type}`);
      }

      setLastPrintJob({ type, data: printData, timestamp: new Date() });
      enqueueSnackbar('Documento enviado a imprimir', { 
        variant: 'success',
        autoHideDuration: 2000 
      });
    } catch (err) {
      setError(err.message);
      enqueueSnackbar(`Error al imprimir: ${err.message}`, { 
        variant: 'error',
        autoHideDuration: 4000 
      });
      throw err;
    } finally {
      setIsPrinting(false);
    }
  };

  const retryLastPrint = async () => {
    if (!lastPrintJob) {
      enqueueSnackbar('No hay trabajo de impresión previo para reintentar', { 
        variant: 'warning',
        autoHideDuration: 3000 
      });
      return;
    }
    await print(lastPrintJob.type, lastPrintJob.data);
  };

  const value = {
    print,
    retryLastPrint,
    isPrinting,
    error,
    lastPrintJob,
    DOCUMENT_TYPES
  };

  return (
    <PrintContext.Provider value={value}>
      {children}
    </PrintContext.Provider>
  );
}; 