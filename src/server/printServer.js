const express = require('express');
const cors = require('cors');
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de impresoras
const printers = {
  default: {
    type: PrinterTypes.EPSON,
    interface: 'tcp://192.168.1.100',
    options: {
      timeout: 3000
    }
  },
  label: {
    type: PrinterTypes.STAR,
    interface: 'tcp://192.168.1.101',
    options: {
      timeout: 3000
    }
  }
};

// Inicializar impresora
async function initPrinter(printerConfig) {
  const printer = new ThermalPrinter({
    type: printerConfig.type,
    interface: printerConfig.interface,
    options: printerConfig.options,
    characterSet: CharacterSet.PC852_LATIN2
  });

  try {
    await printer.isPrinterConnected();
    return printer;
  } catch (error) {
    console.error('Error al conectar con la impresora:', error);
    throw new Error('No se pudo conectar con la impresora');
  }
}

// Ruta para imprimir
app.post('/print', async (req, res) => {
  try {
    const { type, content, printer: printerName = 'default', copies = 1 } = req.body;

    // Obtener configuración de la impresora
    const printerConfig = printers[printerName];
    if (!printerConfig) {
      throw new Error('Impresora no configurada');
    }

    // Inicializar impresora
    const printer = await initPrinter(printerConfig);

    // Imprimir el contenido
    for (let i = 0; i < copies; i++) {
      printer.clear();
      printer.println(content);
      
      // Configuraciones específicas según el tipo de documento
      if (type === 'invoice' || type === 'pre-invoice') {
        printer.cut();
      } else if (type === 'label') {
        printer.pdf417(content); // Para códigos de barras 2D
        printer.beep(); // Señal sonora para etiquetas
      }

      await printer.execute();
    }

    res.json({ success: true, message: 'Documento enviado a imprimir' });
  } catch (error) {
    console.error('Error al imprimir:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al imprimir' 
    });
  }
});

// Ruta para verificar estado de la impresora
app.get('/printer/:name/status', async (req, res) => {
  try {
    const printerConfig = printers[req.params.name];
    if (!printerConfig) {
      throw new Error('Impresora no configurada');
    }

    const printer = await initPrinter(printerConfig);
    const status = await printer.isPrinterConnected();

    res.json({ 
      success: true, 
      connected: status,
      name: req.params.name 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de impresión ejecutándose en el puerto ${PORT}`);
}); 