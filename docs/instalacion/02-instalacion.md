# Guía de Instalación

## Índice
1. [Preparación del Entorno](#preparación-del-entorno)
2. [Instalación del Sistema](#instalación-del-sistema)
3. [Configuración de Firebase](#configuración-de-firebase)
4. [Configuración del Sistema](#configuración-del-sistema)
5. [Verificación de la Instalación](#verificación-de-la-instalación)

## Preparación del Entorno

### 1. Instalar Node.js
1. Visitar [nodejs.org](https://nodejs.org)
2. Descargar la versión LTS (16.x o superior)
3. Ejecutar el instalador
4. Verificar la instalación:
   ```bash
   node --version
   npm --version
   ```

### 2. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/POS-NT.git
cd POS-NT
```

## Instalación del Sistema

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
1. Crear archivo `.env` en la raíz del proyecto
2. Copiar el contenido de `.env.example`
3. Completar las variables:
   ```env
   REACT_APP_FIREBASE_API_KEY=tu_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=tu_dominio
   REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=tu_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   REACT_APP_FIREBASE_APP_ID=tu_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=tu_measurement_id
   ```

## Configuración de Firebase

### 1. Crear Proyecto en Firebase
1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Crear nuevo proyecto
3. Habilitar Authentication
4. Crear base de datos en Firestore
5. Configurar reglas de seguridad

### 2. Configurar Autenticación
1. Habilitar autenticación por email/contraseña
2. Configurar dominios autorizados
3. Configurar proveedores de autenticación adicionales (opcional)

### 3. Configurar Base de Datos
1. Crear colecciones iniciales:
   - users
   - products
   - sales
   - inventory
   - settings
2. Configurar índices necesarios
3. Configurar reglas de seguridad

## Configuración del Sistema

### 1. Iniciar el Sistema
```bash
npm start
```

### 2. Crear Usuario Administrador
1. Acceder a http://localhost:3000
2. Registrar primer usuario
3. Asignar rol de administrador en Firebase

### 3. Configuración Inicial
1. Configurar datos de la empresa
2. Configurar parámetros fiscales
3. Configurar impresoras
4. Crear categorías de productos

## Verificación de la Instalación

### 1. Verificar Funcionalidades Básicas
- [ ] Inicio de sesión
- [ ] Registro de usuarios
- [ ] Creación de productos
- [ ] Realización de ventas
- [ ] Generación de reportes

### 2. Verificar Integración con Hardware
- [ ] Impresora de tickets
- [ ] Lector de códigos de barras
- [ ] Cajón de dinero

### 3. Verificar Backup y Restauración
- [ ] Realizar backup inicial
- [ ] Verificar proceso de restauración

## Solución de Problemas Comunes

### Error: "Firebase no está definido"
- Verificar variables de entorno
- Reiniciar el servidor de desarrollo

### Error: "Puerto en uso"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Error: "No se pueden instalar dependencias"
```bash
# Limpiar caché de npm
npm cache clean --force
# Eliminar node_modules
rm -rf node_modules
# Reinstalar
npm install
```

## Próximos Pasos

1. [Configuración de usuarios y roles](../configuracion/02-usuarios.md)
2. [Configuración fiscal](../configuracion/03-fiscal.md)
3. [Personalización del sistema](../configuracion/04-personalizacion.md)

## Soporte

Si encuentras problemas durante la instalación:
1. Consulta la [sección de FAQ](../soporte/01-faq.md)
2. Revisa los [problemas comunes](../soporte/02-troubleshooting.md)
3. Contacta con [soporte técnico](../soporte/03-contacto.md) 