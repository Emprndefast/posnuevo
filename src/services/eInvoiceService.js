import { getFirestore, collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { usePermissions } from '../context/PermissionsContext';

class EInvoiceService {
  constructor() {
    this.db = getFirestore();
    this.auth = getAuth();
  }

  // Validar datos de factura
  validateInvoiceData(saleData, customerData) {
    const requiredFields = ['items', 'total', 'paymentMethod'];
    const requiredCustomerFields = ['name', 'cuit', 'ivaCondition', 'documentType'];

    for (const field of requiredFields) {
      if (!saleData[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    for (const field of requiredCustomerFields) {
      if (!customerData[field]) {
        throw new Error(`Campo de cliente requerido faltante: ${field}`);
      }
    }

    if (saleData.items.length === 0) {
      throw new Error('La factura debe contener al menos un item');
    }

    return true;
  }

  // Generar factura electrónica
  async generateInvoice(invoiceData) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      const invoiceRef = collection(this.db, 'invoices');
      const docRef = await addDoc(invoiceRef, {
        ...invoiceData,
        userId: user.uid,
        status: 'pending',
        createdAt: new Date(),
        invoiceNumber: await this.generateInvoiceNumber()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error al generar factura:', error);
      throw error;
    }
  }

  // Generar número de factura único
  async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `FAC-${year}${month}`;
    
    const invoicesRef = collection(this.db, 'invoices');
    const q = query(invoicesRef, where('invoiceNumber', '>=', prefix));
    const snapshot = await getDocs(q);
    
    const lastNumber = snapshot.docs.reduce((max, doc) => {
      const num = parseInt(doc.data().invoiceNumber.split('-')[2] || '0');
      return Math.max(max, num);
    }, 0);
    
    return `${prefix}-${String(lastNumber + 1).padStart(6, '0')}`;
  }

  // Obtener facturas
  async getInvoices(filters = {}) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      const invoicesRef = collection(this.db, 'invoices');
      let q = query(invoicesRef, where('userId', '==', user.uid));

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      throw error;
    }
  }

  // Actualizar estado de factura
  async updateInvoiceStatus(invoiceId, status) {
    try {
      const invoiceRef = doc(this.db, 'invoices', invoiceId);
      await updateDoc(invoiceRef, {
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error al actualizar estado de factura:', error);
      throw error;
    }
  }

  // Enviar factura a AFIP
  async sendToAFIP(invoiceId) {
    try {
      const invoiceRef = doc(this.db, 'invoices', invoiceId);
      const invoiceDoc = await getDoc(invoiceRef);

      if (!invoiceDoc.exists()) {
        throw new Error('Factura no encontrada');
      }

      const invoice = invoiceDoc.data();

      // Validar estado de la factura
      if (invoice.status !== 'generated') {
        throw new Error('La factura no está lista para enviar');
      }

      // Verificar permisos
      const { hasPermission } = usePermissions();
      if (!hasPermission('fiscal.eInvoices.send')) {
        throw new Error('No tiene permisos para enviar facturas a AFIP');
      }

      // Enviar a AFIP (simulación)
      const afipResponse = {
        cae: this.generateCAE(),
        caeExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        status: 'approved',
        afipResponse: {
          code: '200',
          message: 'Factura aprobada'
        }
      };

      // Actualizar factura con respuesta de AFIP
      await updateDoc(invoiceRef, {
        ...afipResponse,
        status: 'approved',
        sentToAFIP: new Date(),
        updatedAt: new Date()
      });

      return {
        ...invoice,
        ...afipResponse
      };
    } catch (error) {
      console.error('Error al enviar a AFIP:', error);
      throw error;
    }
  }

  // Obtener punto fiscal
  async getFiscalPoint() {
    try {
      const configRef = doc(this.db, 'config', 'fiscal');
      const configDoc = await getDoc(configRef);
      
      if (!configDoc.exists()) {
        throw new Error('Configuración fiscal no encontrada');
      }

      return configDoc.data().fiscalPoint;
    } catch (error) {
      console.error('Error al obtener punto fiscal:', error);
      throw error;
    }
  }

  // Obtener estado de una factura
  async getInvoiceStatus(invoiceId) {
    try {
      const invoiceRef = doc(this.db, 'invoices', invoiceId);
      const invoiceDoc = await getDoc(invoiceRef);

      if (!invoiceDoc.exists()) {
        throw new Error('Factura no encontrada');
      }

      return invoiceDoc.data();
    } catch (error) {
      console.error('Error al obtener estado:', error);
      throw error;
    }
  }

  // Generar CAE (simulación)
  generateCAE() {
    return `CAE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  // Generar XML de la factura
  generateXML(invoiceData) {
    // Implementación básica de generación de XML
    return `
      <?xml version="1.0" encoding="UTF-8"?>
      <FacturaElectronica>
        <Cabecera>
          <Numero>${invoiceData.invoiceNumber}</Numero>
          <Fecha>${invoiceData.timestamp}</Fecha>
        </Cabecera>
        <Cliente>
          <Nombre>${invoiceData.customer.name}</Nombre>
          <CUIT>${invoiceData.fiscalData.cuit}</CUIT>
        </Cliente>
        <Detalle>
          ${invoiceData.items.map(item => `
            <Item>
              <Descripcion>${item.description}</Descripcion>
              <Cantidad>${item.quantity}</Cantidad>
              <Precio>${item.price}</Precio>
            </Item>
          `).join('')}
        </Detalle>
        <Total>${invoiceData.total}</Total>
      </FacturaElectronica>
    `;
  }

  // Firmar XML con certificado digital
  signXML(xmlData) {
    // Implementación básica de firma digital
    return `${xmlData}<!-- Firma Digital -->`;
  }
}

export default new EInvoiceService(); 