import JsBarcode from 'jsbarcode';

export const generateBarcode = (code) => {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, code, {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true,
      fontSize: 14,
      margin: 10
    });
    
    // Convertir el canvas a base64
    const base64 = canvas.toDataURL('image/png').split(',')[1];
    return base64;
  } catch (error) {
    console.error('Error generando código de barras:', error);
    return null;
  }
}; 