# Manual de Configuración Avanzada - POS NT

## Configuración del Sistema

### 1. Base de Datos

1. **Conexión SQL Server**
```sql
-- Verificar conexión
SELECT @@VERSION
-- Crear nuevo usuario
CREATE LOGIN posnt_user WITH PASSWORD = 'password'
CREATE USER posnt_user FOR LOGIN posnt_user
-- Asignar permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO posnt_user
```

2. **Respaldo y Recuperación**
```powershell
# Backup automático
sqlcmd -S .\SQLEXPRESS -Q "BACKUP DATABASE [POSNT] TO DISK='C:\backup\posnt_%date:~-4,4%%date:~-10,2%%date:~-7,2%.bak'"

# Restaurar backup
sqlcmd -S .\SQLEXPRESS -Q "RESTORE DATABASE [POSNT] FROM DISK='C:\backup\posnt_backup.bak' WITH REPLACE"
```

### 2. Configuración de Red

1. **Puertos Requeridos**
- SQL Server: 1433
- API REST: 3000
- Impresión en red: 9100
- Socket tiempo real: 8080

2. **Reglas de Firewall**
```powershell
# Permitir SQL Server
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow

# Permitir API
New-NetFirewallRule -DisplayName "POS NT API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

## Administración

### 1. Gestión de Usuarios

1. **Roles y Permisos**
- Administrador
- Supervisor
- Cajero
- Inventario
- Reportes

2. **Asignación de Permisos**
```sql
-- Crear rol
INSERT INTO Roles (nombre, descripcion) VALUES ('Supervisor', 'Control de operaciones')

-- Asignar permisos
INSERT INTO RolPermisos (rol_id, permiso_id) VALUES (1, 1)
```

### 2. Configuración de Impresoras

1. **Impresora Térmica**
```javascript
const config = {
  type: 'epson',
  interface: 'printer',
  width: 42,
  characterSet: 'CHARCODE_LATINO',
  removeSpecialCharacters: false,
  lineCharacter: '-'
}
```

2. **Impresora de Red**
```javascript
const networkPrinter = {
  ip: '192.168.1.100',
  port: 9100,
  timeout: 3000
}
```

## Personalización

### 1. Interfaz de Usuario

1. **Temas**
```json
{
  "theme": {
    "primary": "#1976d2",
    "secondary": "#dc004e",
    "background": "#ffffff",
    "surface": "#f5f5f5",
    "error": "#f44336"
  }
}
```

2. **Layouts**
```javascript
const layoutConfig = {
  sidebar: {
    width: 240,
    collapsed: false
  },
  header: {
    height: 64,
    fixed: true
  }
}
```

### 2. Reportes Personalizados

1. **SQL Personalizado**
```sql
-- Reporte de ventas por hora
CREATE PROCEDURE sp_VentasHora
    @fecha DATE
AS
BEGIN
    SELECT 
        DATEPART(HOUR, fecha_venta) as hora,
        COUNT(*) as total_ventas,
        SUM(total) as monto_total
    FROM Ventas
    WHERE CAST(fecha_venta AS DATE) = @fecha
    GROUP BY DATEPART(HOUR, fecha_venta)
    ORDER BY hora
END
```

2. **Exportación**
```javascript
const exportConfig = {
  formats: ['xlsx', 'pdf', 'csv'],
  defaultPath: 'C:/Reports',
  autoGenerate: {
    daily: true,
    weekly: true,
    monthly: true
  }
}
```

## Integración

### 1. API REST

1. **Endpoints**
```javascript
const apiConfig = {
  base: 'http://localhost:3000',
  timeout: 5000,
  endpoints: {
    products: '/api/v1/products',
    sales: '/api/v1/sales',
    customers: '/api/v1/customers'
  }
}
```

2. **Autenticación**
```javascript
const authConfig = {
  type: 'JWT',
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  refreshToken: true
}
```

### 2. Webhooks

1. **Configuración**
```javascript
const webhookConfig = {
  events: ['sale.created', 'stock.low', 'error.critical'],
  url: 'https://api.empresa.com/webhook',
  headers: {
    'Authorization': 'Bearer ${TOKEN}'
  }
}
```

2. **Retry Logic**
```javascript
const retryConfig = {
  attempts: 3,
  delay: 1000,
  backoff: 2,
  timeout: 5000
}
```

## Monitoreo

### 1. Logs

1. **Configuración**
```javascript
const logConfig = {
  level: 'info',
  format: 'json',
  filename: './logs/posnt-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
}
```

2. **Alertas**
```javascript
const alertConfig = {
  email: {
    enabled: true,
    to: ['admin@empresa.com'],
    levels: ['error', 'critical']
  },
  slack: {
    enabled: true,
    webhook: 'https://hooks.slack.com/services/xxx',
    channel: '#pos-alerts'
  }
}
```

### 2. Métricas

1. **Performance**
```javascript
const metricsConfig = {
  collect: {
    memory: true,
    cpu: true,
    requests: true,
    sqlQueries: true
  },
  interval: 60000
}
```

2. **Dashboard**
```javascript
const dashboardConfig = {
  url: 'http://localhost:3001/dashboard',
  refresh: 300000,
  widgets: [
    'system-health',
    'active-users',
    'sales-realtime',
    'errors-last-24h'
  ]
}
```

## Seguridad

### 1. Encriptación

1. **Configuración**
```javascript
const securityConfig = {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16
  },
  hash: {
    algorithm: 'argon2id',
    memoryCost: 4096,
    timeCost: 3,
    parallelism: 1
  }
}
```

2. **Claves**
```javascript
const keyConfig = {
  rotation: {
    enabled: true,
    interval: '30d'
  },
  storage: {
    type: 'vault',
    path: 'secrets/pos-nt/'
  }
}
```

### 2. Auditoría

1. **Eventos**
```sql
CREATE TABLE AuditLog (
    id INT IDENTITY(1,1),
    usuario VARCHAR(50),
    accion VARCHAR(100),
    tabla VARCHAR(50),
    registro_id INT,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    fecha DATETIME DEFAULT GETDATE()
)
```

2. **Reportes**
```sql
-- Reporte de cambios críticos
CREATE PROCEDURE sp_AuditoriaCambiosCriticos
    @fecha_inicio DATETIME,
    @fecha_fin DATETIME
AS
BEGIN
    SELECT 
        usuario,
        accion,
        tabla,
        fecha
    FROM AuditLog
    WHERE 
        fecha BETWEEN @fecha_inicio AND @fecha_fin
        AND accion IN ('DELETE', 'UPDATE')
        AND tabla IN ('Usuarios', 'Configuracion', 'Productos')
    ORDER BY fecha DESC
END
```

## Mantenimiento

### 1. Limpieza

1. **Datos Antiguos**
```sql
-- Eliminar ventas antiguas
CREATE PROCEDURE sp_LimpiarVentasAntiguas
    @meses INT
AS
BEGIN
    DELETE FROM Ventas 
    WHERE fecha_venta < DATEADD(MONTH, -@meses, GETDATE())
END
```

2. **Logs**
```powershell
# Limpiar logs antiguos
Get-ChildItem "C:\logs" -Filter "*.log" |
Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
Remove-Item
```

### 2. Optimización

1. **Índices**
```sql
-- Reindexar tablas principales
CREATE PROCEDURE sp_OptimizarIndices
AS
BEGIN
    ALTER INDEX ALL ON Productos REBUILD
    ALTER INDEX ALL ON Ventas REBUILD
    ALTER INDEX ALL ON Clientes REBUILD
END
```

2. **Cache**
```javascript
const cacheConfig = {
  redis: {
    host: 'localhost',
    port: 6379,
    password: process.env.REDIS_PASSWORD
  },
  ttl: {
    products: 3600,
    customers: 7200,
    reports: 300
  }
}
``` 