# POSENT - Sistema de Punto de Venta

Sistema de punto de venta con integración a Telegram para consultas remotas.

## Características

- Gestión de inventario
- Ventas y facturación
- Gestión de clientes
- Reportes y estadísticas
- Integración con bot de Telegram
- Interfaz moderna y responsive

## Integración con Telegram

El sistema POSENT se integra con un bot de Telegram que permite consultar información en tiempo real:

- Consulta de inventario
- Resumen de ventas
- Lista de clientes
- Productos con stock bajo

## Configuración

1. Clona este repositorio
2. Instala las dependencias:
   ```
   npm install
   ```
3. Crea un archivo `.env` con las siguientes variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/pos-nt
   JWT_SECRET=tu_super_secreto_seguro_para_jwt_tokens_2024
   NODE_ENV=development
   ```
4. Inicia el servidor:
   ```
   npm start
   ```

## Despliegue

### Opción 1: Render

1. Crea una cuenta en [Render](https://render.com)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno
4. Despliega la aplicación

### Opción 2: Railway

1. Crea una cuenta en [Railway](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno
4. Despliega la aplicación

### Opción 3: API REST local

Para ejecutar solo la API REST:

```
node server.js
```

## Estructura del proyecto

```
POS-NT-V1.1/
├── src/                    # Código fuente
│   ├── controllers/        # Controladores
│   │   ├── botController.js
│   │   └── posController.js
│   ├── models/             # Modelos de datos
│   ├── routes/             # Rutas
│   │   ├── botRoutes.js
│   │   └── posRoutes.js
│   ├── middleware/         # Middleware
│   ├── utils/              # Utilidades
│   └── db/                 # Configuración de base de datos
├── public/                 # Archivos estáticos
├── .env                    # Variables de entorno
├── package.json            # Dependencias
└── README.md               # Documentación
```

## API REST

### Endpoints principales

- `POST /api/pos` - Recibe mensajes del bot de Telegram
- `GET /api/inventario` - Obtiene el inventario completo
- `GET /api/ventas/resumen_hoy` - Obtiene el resumen de ventas del día
- `GET /api/clientes` - Obtiene la lista de clientes

## Licencia

ISC