import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { format } from 'date-fns';

// Constantes para comandos ESC/POS
const ESC = '\x1B';
const GS = '\x1D';
const COMMANDS = {
  INIT: `${ESC}@`,
  ALIGN_CENTER: `${ESC}a\x01`,
  ALIGN_LEFT: `${ESC}a\x00`,
  ALIGN_RIGHT: `${ESC}a\x02`,
  BOLD_ON: `${ESC}E\x01`,
  BOLD_OFF: `${ESC}E\x00`,
  CUT: `${GS}V\x41\x00`,
  LINE_FEED: '\n',
};

class PrinterService {
  constructor() {
    this.connection = null;
    this.config = null;
  }

  // Buscar dispositivos Bluetooth disponibles
  async searchBluetoothDevices() {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth no está disponible en este dispositivo');
      }

      console.log('Solicitando dispositivo Bluetooth...');
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2']
      });

      console.log('Dispositivo encontrado:', device);
      return [{
        name: device.name || 'Dispositivo desconocido',
        address: device.id,
        device: device
      }];
    } catch (error) {
      console.error('Error buscando dispositivos Bluetooth:', error);
      throw new Error('Error al buscar dispositivos Bluetooth: ' + error.message);
    }
  }

  // Conectar con impresora Bluetooth
  async connectBluetoothPrinter(device) {
    try {
      console.log('Conectando a dispositivo Bluetooth:', device);
      const server = await device.device.gatt.connect();
      console.log('Servidor GATT conectado:', server);

      // Intentar diferentes servicios conocidos para impresoras térmicas
      let service;
      try {
        service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      } catch (e) {
        service = await server.getPrimaryService('e7810a71-73ae-499d-8c15-faa9aef0c3f2');
      }
      console.log('Servicio encontrado:', service);

      // Buscar característica de escritura
      const characteristics = await service.getCharacteristics();
      console.log('Características disponibles:', characteristics);
      
      const characteristic = characteristics.find(char => char.properties.write);
      if (!characteristic) {
        throw new Error('No se encontró una característica de escritura');
      }
      console.log('Característica de escritura encontrada:', characteristic);

      this.connection = {
        type: 'bluetooth',
        characteristic,
        device: device.device
      };

      this.config = {
        type: 'bluetooth',
        deviceName: device.name,
        address: device.address
      };

      return true;
    } catch (error) {
      console.error('Error conectando con impresora Bluetooth:', error);
      throw new Error('Error al conectar con la impresora Bluetooth: ' + error.message);
    }
  }

  // Imprimir datos
  async print(data) {
    if (!this.connection) {
      throw new Error('No hay una impresora conectada');
    }

    try {
      if (this.connection.type === 'bluetooth') {
        const encoder = new TextEncoder();
        const commands = COMMANDS.INIT + data + COMMANDS.CUT;
        const dataArray = encoder.encode(commands);
        
        console.log('Enviando datos a la impresora:', commands);
        await this.connection.characteristic.writeValue(dataArray);
        console.log('Datos enviados correctamente');
      }

      return true;
    } catch (error) {
      console.error('Error al imprimir:', error);
      throw new Error('Error al imprimir: ' + error.message);
    }
  }

  // Imprimir página de prueba
  async testPrint() {
    const testData = [
      COMMANDS.ALIGN_CENTER,
      'PRUEBA DE IMPRESION\n',
      '================\n',
      '\n',
      'POSENT\n',
      'Impresora configurada correctamente\n',
      '\n',
      new Date().toLocaleString(),
      '\n\n\n\n\n'
    ].join('');

    return this.print(testData);
  }

  // Imprimir ticket
  async printTicket(data, settings) {
    try {
      const {
        paperWidth,
        fontSize,
        showLot,
        showColor,
        showExpiry,
        showBarcode,
        copies,
        timeFormat,
        logoX,
        logoY,
        logoWidth,
        logoHeight
      } = settings;

      // Configurar el formato del ticket según las configuraciones
      const ticketConfig = {
        width: paperWidth === '80' ? 48 : 32, // Caracteres por línea según ancho de papel
        fontSize: fontSize || 12,
        copies: copies || 1,
        logo: {
          x: logoX || 0,
          y: logoY || 0,
          width: logoWidth || 200,
          height: logoHeight || 100
        }
      };

      // Generar el contenido del ticket
      let content = [];

      // Agregar logo si está configurado
      if (settings.logo) {
        content.push({
          type: 'image',
          path: settings.logo,
          position: ticketConfig.logo,
          width: ticketConfig.logo.width,
          height: ticketConfig.logo.height
        });
      }

      // Información del negocio
      content.push(
        { type: 'text', value: data.businessName, align: 'center', bold: true },
        { type: 'text', value: data.address, align: 'center' },
        { type: 'text', value: data.phone, align: 'center' },
        { type: 'separator' }
      );

      // Información de la venta
      content.push(
        { type: 'text', value: `Ticket #: ${data.ticketNumber}` },
        { 
          type: 'text', 
          value: `Fecha: ${format(
            new Date(), 
            timeFormat === '12' ? 'dd/MM/yyyy hh:mm a' : 'dd/MM/yyyy HH:mm'
          )}` 
        },
        { type: 'separator' }
      );

      // Productos
      content.push(
        { type: 'text', value: 'PRODUCTOS', align: 'center', bold: true },
        { type: 'separator' }
      );

      data.products.forEach(product => {
        const details = [];
        if (showLot && product.lot) details.push(`Lote: ${product.lot}`);
        if (showColor && product.color) details.push(`Color: ${product.color}`);
        if (showExpiry && product.expiry) details.push(`Cad: ${format(product.expiry, 'dd/MM/yyyy')}`);

        content.push(
          { type: 'text', value: product.name },
          { type: 'text', value: `${product.quantity} x ${product.price} = ${product.total}` }
        );

        if (details.length > 0) {
          content.push({ type: 'text', value: details.join(' | '), size: 'small' });
        }

        if (showBarcode && product.barcode) {
          content.push({ type: 'barcode', value: product.barcode });
        }
      });

      // Totales
      content.push(
        { type: 'separator' },
        { type: 'text', value: `Subtotal: ${data.subtotal}`, align: 'right' },
        { type: 'text', value: `IVA: ${data.tax}`, align: 'right' },
        { type: 'text', value: `Total: ${data.total}`, align: 'right', bold: true },
        { type: 'separator' },
        { type: 'text', value: 'Gracias por su compra', align: 'center' }
      );

      // Imprimir el ticket según el tipo de conexión
      const printer = await this.getPrinter(settings);
      for (let i = 0; i < ticketConfig.copies; i++) {
        await printer.print(content);
      }

      return true;
    } catch (error) {
      console.error('Error al imprimir ticket:', error);
      throw error;
    }
  }

  // Desconectar impresora
  async disconnect() {
    if (!this.connection) {
      return;
    }

    try {
      if (this.connection.type === 'bluetooth') {
        await this.connection.device.gatt.disconnect();
        console.log('Dispositivo Bluetooth desconectado');
      }

      this.connection = null;
      this.config = null;
    } catch (error) {
      console.error('Error al desconectar:', error);
      throw new Error('Error al desconectar la impresora: ' + error.message);
    }
  }

  // Obtener estado de la impresora
  getStatus() {
    return {
      connected: !!this.connection,
      type: this.connection?.type,
      config: this.config
    };
  }

  async getPrinterConfig(userId) {
    try {
      const docRef = doc(db, 'printerConfigs', userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const defaultConfig = {
          connection: 'usb',
          type: 'thermal',
          width: 80,
          characterSet: 'UTF-8',
          encoding: 'CP850',
          baudRate: 9600,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(docRef, defaultConfig);
        return defaultConfig;
      }

      return docSnap.data();
    } catch (error) {
      console.error('Error al obtener configuración de impresora:', error);
      throw error;
    }
  }

  async savePrinterConfig(userId, config) {
    try {
      const docRef = doc(db, 'printerConfigs', userId);
      await setDoc(docRef, {
        ...config,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error al guardar configuración de impresora:', error);
      throw error;
    }
  }

  async printViaUSB(document, config) {
    console.log('Imprimiendo vía USB:', { document, config });
    // Aquí iría la lógica real de impresión USB
    return true;
  }

  async printViaNetwork(document, config) {
    console.log('Imprimiendo vía Red:', { document, config });
    // Aquí iría la lógica real de impresión por red
    return true;
  }

  async printViaBluetooth(document, config) {
    console.log('Imprimiendo vía Bluetooth:', { document, config });
    // Aquí iría la lógica real de impresión Bluetooth
    return true;
  }

  async getPrinter(settings) {
    const { printerConnection, printerIp, printerPort } = settings;

    switch (printerConnection) {
      case 'network':
        return new NetworkPrinter(printerIp, printerPort);
      case 'usb':
        return new USBPrinter();
      case 'bluetooth':
        return new BluetoothPrinter(settings.deviceName);
      default:
        throw new Error('Tipo de conexión de impresora no válido');
    }
  }
}

export const printerService = new PrinterService(); 