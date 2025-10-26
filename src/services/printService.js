// Firebase disabled - Using MongoDB backend now
// import { getAuth } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../firebase/config';
import { formatCurrency } from '../utils/format';
import { printerService } from './printerService';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

class PrintService {
  constructor() {
    // this.auth = getAuth(); // Firebase disabled
    this.auth = null; // Mock for now
    this.printServerUrl = process.env.REACT_APP_PRINT_SERVER_URL || 'http://localhost:3001/print';
  }

  async getPrinterConfig() {
    // TODO: Migrate to MongoDB backend
    console.warn('getPrinterConfig not implemented yet - Firebase disabled');
    return null;
    // try {
    //   const user = this.auth.currentUser;
    //   if (!user) throw new Error('Usuario no autenticado');

    //   const config = await printerService.getPrinterConfig(user.uid);
    //   if (!config) throw new Error('Configuración de impresora no encontrada');

    //   return config;
    // } catch (error) {
    //   console.error('Error al obtener configuración de impresora:', error);
    //   throw error;
    // }
  }

  async print(content, config) {
    try {
      switch (config.connection) {
        case 'usb':
          await printerService.printViaUSB(content, config);
          break;
        case 'network':
          await printerService.printViaNetwork(content, config);
          break;
        case 'bluetooth':
          await printerService.printViaBluetooth(content, config);
          break;
        default:
          throw new Error(`Tipo de conexión no soportado: ${config.connection}`);
      }
    } catch (error) {
      console.error('Error al imprimir:', error);
      throw error;
    }
  }

  async printSale(saleData) {
    // TODO: Migrate to MongoDB backend
    console.warn('printSale not implemented yet - Firebase disabled');
    return true;
    // try {
    //   const printerConfig = await this.getPrinterConfig();
      
    //   // Obtener datos del negocio
    //   const businessDoc = await getDoc(doc(db, 'business', saleData.businessId));
    //   if (!businessDoc.exists()) {
    //     throw new Error('No se encontró la información del negocio');
    //   }
    //   const businessData = businessDoc.data();

    //   // Imprimir el contenido
    //   await this.print(saleData.content, {
    //     ...printerConfig,
    //     documentType: saleData.type,
    //     businessInfo: businessData
    //   });

    //   return true;
    // } catch (error) {
    //   console.error('Error al imprimir venta:', error);
    //   throw error;
    // }
  }

  async printInvoice(data) {
    try {
      const { printer, copies, invoice, business } = data;
      
      // Aquí iría la lógica específica para imprimir facturas según el modelo de impresora
      console.log(`Imprimiendo factura en ${printer}`);
      
      // Simular tiempo de impresión
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error al imprimir factura:', error);
      throw new Error('No se pudo imprimir la factura');
    }
  }

  async printPreInvoice(data) {
    try {
      const { printer, copies, preInvoice, business } = data;
      
      // Aquí iría la lógica específica para imprimir pre-facturas según el modelo de impresora
      console.log(`Imprimiendo pre-factura en ${printer}`);
      
      // Simular tiempo de impresión
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error al imprimir pre-factura:', error);
      throw new Error('No se pudo imprimir la pre-factura');
    }
  }

  async printProductLabel(data) {
    try {
      const { printer, copies, product } = data;
      
      // Aquí iría la lógica específica para imprimir etiquetas según el modelo de impresora
      console.log(`Imprimiendo etiqueta en ${printer}`);
      
      // Simular tiempo de impresión
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error al imprimir etiqueta:', error);
      throw new Error('No se pudo imprimir la etiqueta');
    }
  }

  async printTestPage(data) {
    try {
      const { printer } = data;
      
      // Aquí iría la lógica específica para imprimir página de prueba según el modelo de impresora
      console.log(`Imprimiendo página de prueba en ${printer}`);
      
      // Simular tiempo de impresión
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error al imprimir página de prueba:', error);
      throw new Error('No se pudo imprimir la página de prueba');
    }
  }

  async sendToPrintServer(data) {
    try {
      const response = await fetch(this.printServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al enviar a la impresora');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en PrintService:', error);
      throw error;
    }
  }

  async logPrintJob(data) {
    // TODO: Migrate to MongoDB backend
    console.warn('logPrintJob not implemented yet - Firebase disabled');
    return true;
    // try {
    //   await addDoc(collection(db, 'print_logs'), {
    //     ...data,
    //     timestamp: serverTimestamp(),
    //     status: 'sent'
    //   });
    // } catch (error) {
    //   console.error('Error al registrar impresión:', error);
    // }
  }
}

// Mantener las funciones de generación de contenido
export { generateFiscalInvoice, generatePreInvoice } from './documentGenerators';

const printService = new PrintService();
export default printService; 