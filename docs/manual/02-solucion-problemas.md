# Manual de Solución de Problemas - POS NT

## Problemas Comunes y Soluciones

### 1. Problemas de Inicio de Sesión

#### Error: "Usuario o contraseña incorrectos"
1. Verificar que el Bloq Mayús no esté activado
2. Intentar restablecer la contraseña
3. Si persiste, contactar al administrador para verificar el estado de la cuenta

#### Error: "No se puede conectar al servidor"
1. Verificar la conexión a internet
2. Comprobar que el servidor esté en línea
3. Revisar la configuración del firewall
4. Ejecutar el diagnóstico de red:
```powershell
Test-NetConnection -ComputerName servidor -Port 1433
```

### 2. Problemas con la Impresora

#### La impresora no responde
1. Verificar que esté encendida y conectada
2. Comprobar el estado del papel
3. Reiniciar la impresora
4. Ejecutar el diagnóstico:
```javascript
const diagnostico = await printer.checkStatus();
console.log(diagnostico);
```

#### Impresión cortada o borrosa
1. Limpiar el cabezal de impresión
2. Verificar la calidad del papel térmico
3. Ajustar la configuración de densidad:
```javascript
await printer.setDensity(180);
```

### 3. Problemas de Ventas

#### Error al procesar venta
1. Verificar el stock disponible
2. Comprobar la conexión con el servidor
3. Revisar el log de errores:
```sql
SELECT TOP 10 *
FROM ErrorLog
WHERE modulo = 'Ventas'
ORDER BY fecha DESC
```

#### Descuentos no se aplican
1. Verificar la configuración de promociones
2. Comprobar la fecha de vigencia
3. Validar los permisos del usuario
```sql
SELECT p.*
FROM Permisos p
JOIN UsuarioPermisos up ON p.id = up.permiso_id
WHERE up.usuario_id = @usuario_id
AND p.codigo = 'APLICAR_DESCUENTO'
```

### 4. Problemas de Inventario

#### Stock no coincide
1. Realizar conteo físico
2. Revisar el historial de movimientos:
```sql
SELECT *
FROM MovimientosInventario
WHERE producto_id = @producto_id
ORDER BY fecha DESC
```
3. Ajustar el inventario si es necesario

#### Productos no aparecen
1. Verificar el estado del producto (activo/inactivo)
2. Comprobar la categorización
3. Buscar en la base de datos:
```sql
SELECT *
FROM Productos
WHERE codigo = @codigo
OR nombre LIKE '%' + @nombre + '%'
```

### 5. Problemas de Rendimiento

#### Sistema lento
1. Verificar uso de recursos:
```powershell
Get-Process PosNT | Select-Object CPU, WorkingSet, HandleCount
```

2. Limpiar caché:
```javascript
await cache.clear();
```

3. Optimizar base de datos:
```sql
EXEC sp_updatestats;
DBCC FREEPROCCACHE;
```

#### Reportes tardan en cargar
1. Verificar índices de la base de datos
2. Optimizar consultas
3. Utilizar cache para reportes frecuentes:
```javascript
const reporteCache = await cache.get('reporte_diario');
if (!reporteCache) {
    const reporte = await generarReporte();
    await cache.set('reporte_diario', reporte, 3600);
}
```

### 6. Problemas de Red

#### Pérdida de conexión
1. Verificar estado de la red:
```powershell
Test-Connection servidor -Count 4
```

2. Comprobar configuración:
```powershell
ipconfig /all
```

3. Reiniciar servicios de red:
```powershell
Restart-Service -Name "MSSQLSERVER"
```

#### Sincronización fallida
1. Verificar el estado del servicio de sincronización
2. Comprobar los logs:
```javascript
const syncLogs = await getSyncLogs();
console.log(syncLogs.filter(log => log.status === 'error'));
```

### 7. Problemas de Base de Datos

#### Error de conexión
1. Verificar credenciales
2. Comprobar estado del servidor:
```sql
SELECT @@SERVERNAME AS ServerName,
       SERVERPROPERTY('Edition') AS Edition,
       SERVERPROPERTY('ProductVersion') AS Version
```

#### Bloqueos de tablas
1. Identificar bloqueos:
```sql
EXEC sp_who2
```

2. Matar procesos problemáticos:
```sql
KILL @spid
```

### 8. Problemas de Interfaz

#### Elementos no visibles
1. Limpiar caché del navegador
2. Verificar resolución de pantalla
3. Comprobar permisos de visualización:
```javascript
const userPermissions = await getUserPermissions();
console.log(userPermissions);
```

#### Errores de JavaScript
1. Revisar consola del navegador
2. Verificar versión de navegador
3. Limpiar caché local:
```javascript
localStorage.clear();
sessionStorage.clear();
```

### 9. Recuperación de Datos

#### Respaldo fallido
1. Verificar espacio en disco
2. Comprobar permisos de escritura
3. Ejecutar respaldo manual:
```sql
BACKUP DATABASE [POSNT]
TO DISK = 'C:\backup\posnt_emergency.bak'
WITH INIT, STATS = 10
```

#### Restauración fallida
1. Verificar integridad del backup
2. Comprobar espacio disponible
3. Ejecutar restauración:
```sql
RESTORE DATABASE [POSNT]
FROM DISK = 'C:\backup\posnt_backup.bak'
WITH REPLACE, STATS = 10
```

### 10. Contacto Soporte Técnico

#### Niveles de Soporte
1. **Nivel 1**: Soporte básico
   - Email: soporte@posnt.com
   - Tel: (555) 123-4567
   - Horario: 24/7

2. **Nivel 2**: Soporte técnico especializado
   - Email: soporte.tech@posnt.com
   - Tel: (555) 123-4568
   - Horario: Lun-Vie 9:00-18:00

3. **Nivel 3**: Soporte crítico
   - Email: emergencias@posnt.com
   - Tel: (555) 123-4569
   - Disponibilidad: 24/7 para emergencias

#### Información Requerida
Al contactar soporte, tener lista la siguiente información:
1. ID de Usuario
2. Versión del sistema
3. Descripción detallada del problema
4. Capturas de pantalla si aplica
5. Logs relevantes 