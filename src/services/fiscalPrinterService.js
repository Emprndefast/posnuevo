import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { usePermissions } from '../context/PermissionsContext';
import api from '../api/api';

export const fiscalPrinterService = {
  // Validar configuración de impresora
  validatePrinterConfig: (printerConfig) => {
    const requiredFields = ['id', 'model', 'port', 'brand'];

    for (const field of requiredFields) {
      if (!printerConfig[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    if (!['Hasar', 'Epson', 'Bematech', 'Other'].includes(printerConfig.brand)) {
      throw new Error('Marca de impresora no válida');
    }

    return true;
  },

  // Configuración de la impresora fiscal
  configurePrinter: async (printerConfig) => {
    try {
      // Validar configuración
      fiscalPrinterService.validatePrinterConfig(printerConfig);

      // Verificar permisos
      const { hasPermission } = usePermissions();
      if (!hasPermission('fiscal.printers.configure')) {
        throw new Error('No tiene permisos para configurar impresoras fiscales');
      }

      const printerRef = doc(db, 'fiscalPrinters', printerConfig.id);
      const printerDoc = await getDoc(printerRef);

      if (printerDoc.exists()) {
        throw new Error('Ya existe una impresora con ese ID');
      }

      await updateDoc(printerRef, {
        ...printerConfig,
        lastConfiguration: new Date(),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error al configurar impresora:', error);
      throw error;
    }
  },

  // Imprimir ticket fiscal
  printFiscalTicket: async (saleData, printerId) => {
    try {
      // Verificar permisos
      const { hasPermission } = usePermissions();
      if (!hasPermission('fiscal.printers.print')) {
        throw new Error('No tiene permisos para imprimir tickets fiscales');
      }

      const printerRef = doc(db, 'fiscalPrinters', printerId);
      const printerDoc = await getDoc(printerRef);

      if (!printerDoc.exists()) {
        throw new Error('Impresora no encontrada');
      }

      const printer = printerDoc.data();

      // Validar estado de la impresora
      if (printer.status !== 'active') {
        throw new Error('Impresora no está activa');
      }

      // Validar datos de venta
      if (!saleData.items || saleData.items.length === 0) {
        throw new Error('La venta debe contener al menos un item');
      }

      // Preparar datos del ticket
      const ticketData = {
        ...saleData,
        printerId,
        timestamp: new Date(),
        fiscalNumber: await fiscalPrinterService.generateFiscalNumber(),
        printerStatus: printer.status,
        businessData: await fiscalPrinterService.getBusinessData()
      };

      // Registrar ticket en base de datos
      await updateDoc(printerRef, {
        lastPrint: new Date(),
        ticketsPrinted: (printer.ticketsPrinted || 0) + 1,
        updatedAt: new Date()
      });

      // Registrar ticket en colección de tickets
      await addDoc(collection(db, 'fiscalTickets'), {
        ...ticketData,
        printerConfig: printer
      });

      return ticketData;
    } catch (error) {
      console.error('Error al imprimir ticket:', error);
      throw error;
    }
  },

  // Obtener datos del negocio
  getBusinessData: async () => {
    try {
      const response = await api.get('/settings/business');
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Configuración del negocio no encontrada');
    } catch (error) {
      console.error('Error al obtener datos del negocio:', error);
      throw error;
    }
  },

  // Obtener estado de la impresora
  getPrinterStatus: async (printerId) => {
    try {
      const printerRef = doc(db, 'fiscalPrinters', printerId);
      const printerDoc = await getDoc(printerRef);

      if (!printerDoc.exists()) {
        throw new Error('Impresora no encontrada');
      }

      return printerDoc.data();
    } catch (error) {
      console.error('Error al obtener estado:', error);
      throw error;
    }
  },

  // Generar número fiscal único
  generateFiscalNumber: async () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `F${timestamp}${random}`;
  },

  // Imprimir reporte Z
  printZReport: async (printerId) => {
    try {
      const printerRef = doc(db, 'fiscalPrinters', printerId);
      const printerDoc = await getDoc(printerRef);

      if (!printerDoc.exists()) {
        throw new Error('Impresora no encontrada');
      }

      const reportData = {
        printerId,
        timestamp: new Date(),
        type: 'Z',
        status: 'completed'
      };

      // Actualizar contadores de la impresora
      await updateDoc(printerRef, {
        lastZReport: new Date(),
        zReportsPrinted: (printerDoc.data().zReportsPrinted || 0) + 1
      });

      return reportData;
    } catch (error) {
      console.error('Error al imprimir reporte Z:', error);
      throw error;
    }
  },

  // Imprimir reporte X
  printXReport: async (printerId) => {
    try {
      const printerRef = doc(db, 'fiscalPrinters', printerId);
      const printerDoc = await getDoc(printerRef);

      if (!printerDoc.exists()) {
        throw new Error('Impresora no encontrada');
      }

      const reportData = {
        printerId,
        timestamp: new Date(),
        type: 'X',
        status: 'completed'
      };

      // Actualizar contadores de la impresora
      await updateDoc(printerRef, {
        lastXReport: new Date(),
        xReportsPrinted: (printerDoc.data().xReportsPrinted || 0) + 1
      });

      return reportData;
    } catch (error) {
      console.error('Error al imprimir reporte X:', error);
      throw error;
    }
  }
}; 