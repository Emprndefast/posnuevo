# API para Bot POS-NT

## Autenticación

Todas las peticiones deben incluir el token JWT en el header:
```
Authorization: Bearer <token>
```

## Endpoints

### Inventario

#### Obtener Inventario Completo
```
GET /api/inventario
```
Permiso requerido: `read:inventory`

Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "nombre": "string",
      "codigo": "string",
      "precio": "number",
      "stock": "number",
      "categoria": "string"
    }
  ]
}
```

#### Obtener Productos con Stock Bajo
```
GET /api/inventario/stock_bajo
```
Permiso requerido: `read:inventory`

Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "nombre": "string",
      "stock_actual": "number",
      "stock_minimo": "number",
      "dias_restantes": "number"
    }
  ]
}
```

### Ventas

#### Resumen de Ventas del Día
```
GET /api/ventas/resumen_hoy
```
Permiso requerido: `read:sales`

Respuesta:
```json
{
  "success": true,
  "data": {
    "total_ventas": "number",
    "monto_total": "number",
    "promedio_ticket": "number",
    "ventas_por_hora": [
      {
        "hora": "number",
        "cantidad": "number",
        "monto": "number"
      }
    ]
  }
}
```

#### Productos Más Vendidos
```
GET /api/ventas/top_productos
```
Permiso requerido: `read:sales`

Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "producto_id": "string",
      "nombre": "string",
      "cantidad_vendida": "number",
      "monto_total": "number"
    }
  ]
}
```

### Clientes

#### Obtener Lista de Clientes
```
GET /api/clientes
```
Permiso requerido: `read:customers`

Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "nombre": "string",
      "email": "string",
      "telefono": "string",
      "ultima_compra": "date"
    }
  ]
}
```

### Notificaciones

#### Notificar Stock Bajo
```
POST /api/notificaciones/stock_bajo
```
Permiso requerido: `notify:stock`

Body:
```json
{
  "producto_id": "string",
  "stock_actual": "number",
  "stock_minimo": "number"
}
```

#### Notificar Venta Realizada
```
POST /api/notificaciones/venta_realizada
```
Permiso requerido: `notify:sales`

Body:
```json
{
  "venta_id": "string",
  "monto": "number",
  "productos": [
    {
      "id": "string",
      "cantidad": "number",
      "precio": "number"
    }
  ]
}
```

### Estadísticas

#### Estadísticas en Tiempo Real
```
GET /api/estadisticas/tiempo_real
```
Permiso requerido: `read:reports`

Respuesta:
```json
{
  "success": true,
  "data": {
    "ventas_hoy": "number",
    "clientes_activos": "number",
    "productos_stock_bajo": "number",
    "tickets_pendientes": "number"
  }
}
```

## Códigos de Error

- `400`: Error en la petición
- `401`: No autorizado (token no proporcionado)
- `403`: Prohibido (permisos insuficientes)
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## Ejemplos de Uso

### Python
```python
import requests

API_URL = "http://localhost:3001/api"
TOKEN = "tu_token_jwt"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Obtener inventario
response = requests.get(f"{API_URL}/inventario", headers=headers)
inventario = response.json()

# Notificar stock bajo
data = {
    "producto_id": "123",
    "stock_actual": 5,
    "stock_minimo": 10
}
response = requests.post(f"{API_URL}/notificaciones/stock_bajo", 
                        headers=headers, 
                        json=data)
```

### Node.js
```javascript
const axios = require('axios');

const API_URL = "http://localhost:3001/api";
const TOKEN = "tu_token_jwt";

const headers = {
    "Authorization": `Bearer ${TOKEN}`,
    "Content-Type": "application/json"
};

// Obtener ventas del día
async function getVentasHoy() {
    try {
        const response = await axios.get(`${API_URL}/ventas/resumen_hoy`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error:', error.response.data);
    }
}
``` 