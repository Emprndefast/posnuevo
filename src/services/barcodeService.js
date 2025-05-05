class BarcodeService {
  constructor() {
    this.reader = null;
    this.isReading = false;
    this.callbacks = new Set();
  }

  // Inicializar el lector
  async initialize() {
    try {
      // Verificar si el navegador soporta la API de dispositivos HID
      if (!navigator.hid) {
        throw new Error('Este navegador no soporta la API de dispositivos HID');
      }

      // Solicitar permisos para acceder a dispositivos HID
      const devices = await navigator.hid.requestDevice({
        filters: [
          { vendorId: 0x05e0 }, // Honeywell
          { vendorId: 0x05f9 }, // Symbol
          { vendorId: 0x0c2e }, // Datalogic
          { vendorId: 0x1a86 }, // Generic HID
        ]
      });

      if (devices.length === 0) {
        throw new Error('No se encontraron lectores de código de barras');
      }

      this.reader = devices[0];
      await this.reader.open();
      
      // Configurar el lector
      this.reader.addEventListener('inputreport', this.handleInputReport.bind(this));
      
      return true;
    } catch (error) {
      console.error('Error inicializando lector:', error);
      throw error;
    }
  }

  // Manejar eventos del lector
  handleInputReport(event) {
    if (!this.isReading) return;

    const data = new Uint8Array(event.data.buffer);
    const barcode = String.fromCharCode.apply(null, data);
    
    // Notificar a los suscriptores
    this.notifySubscribers(barcode);
  }

  // Iniciar lectura
  startReading() {
    this.isReading = true;
  }

  // Detener lectura
  stopReading() {
    this.isReading = false;
  }

  // Suscribir callback para recibir códigos
  subscribe(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  // Notificar a los suscriptores
  notifySubscribers(barcode) {
    this.callbacks.forEach(callback => callback(barcode));
  }

  // Cerrar conexión
  async close() {
    if (this.reader) {
      await this.reader.close();
      this.reader = null;
    }
  }
}

export default new BarcodeService(); 