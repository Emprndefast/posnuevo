# Manual de Instalación - POS NT

## Requisitos del Sistema

### Hardware Mínimo
- Procesador: Intel Core i3 o AMD equivalente
- Memoria RAM: 8GB
- Espacio en disco: 256GB SSD
- Resolución de pantalla: 1366x768

### Hardware Recomendado
- Procesador: Intel Core i5/i7 o AMD equivalente
- Memoria RAM: 16GB
- Espacio en disco: 512GB SSD
- Resolución de pantalla: 1920x1080

### Software Requerido
- Windows 10/11 Pro (64 bits)
- .NET Framework 4.8 o superior
- SQL Server Express 2019 o superior
- Navegador web moderno (Chrome, Firefox, Edge)
- Adobe Reader DC o similar para PDFs

## Proceso de Instalación

### 1. Preparación del Sistema

1. **Actualizar Windows**
   ```powershell
   # Ejecutar Windows Update
   wuauclt.exe /updatenow
   ```

2. **Instalar .NET Framework**
   - Descargar de: https://dotnet.microsoft.com/download/dotnet-framework
   - Ejecutar el instalador como administrador
   - Seguir el asistente de instalación

3. **Instalar SQL Server Express**
   - Descargar de: https://www.microsoft.com/sql-server/sql-server-downloads
   - Ejecutar como administrador
   - Seleccionar "Instalación básica"
   - Anotar las credenciales de sa

### 2. Instalación de POS NT

1. **Descargar el Instalador**
   - Acceder a: https://posnt.com/downloads
   - Seleccionar la última versión estable
   - Verificar el hash SHA-256 del archivo

2. **Ejecutar el Instalador**
   ```
   POS-NT-Setup-v1.0.exe /quiet /log install.log INSTALLDIR="C:\Program Files\POS-NT"
   ```

3. **Configuración Inicial**
   - Abrir el asistente de configuración
   - Ingresar datos de la empresa
   - Configurar la conexión a SQL Server
   - Crear usuario administrador

### 3. Configuración Post-Instalación

1. **Configurar Firewall**
   ```powershell
   # Agregar excepción para POS NT
   New-NetFirewallRule -DisplayName "POS NT" -Direction Inbound -Program "C:\Program Files\POS-NT\posnt.exe" -Action Allow
   ```

2. **Configurar Antivirus**
   - Agregar carpeta de instalación a exclusiones
   - Excluir puertos de comunicación
   - Permitir acceso a red local

3. **Configurar Impresoras**
   - Instalar drivers necesarios
   - Configurar impresora predeterminada
   - Probar impresión de tickets

## Instalación de Periféricos

### 1. Lector de Códigos de Barras

1. **Conexión USB**
   - Conectar el dispositivo
   - Esperar instalación de drivers
   - Verificar en Administrador de dispositivos

2. **Configuración en POS NT**
   - Abrir configuración de dispositivos
   - Seleccionar modelo de lector
   - Probar lectura de códigos

### 2. Impresora Térmica

1. **Instalación de Drivers**
   - Descargar drivers del fabricante
   - Instalar como administrador
   - Configurar puerto COM/USB

2. **Configuración en Sistema**
   - Establecer como impresora predeterminada
   - Ajustar tamaño de papel
   - Configurar márgenes

### 3. Cajón de Dinero

1. **Conexión**
   - Conectar a impresora térmica
   - Verificar voltaje (12V/24V)
   - Probar apertura manual

2. **Configuración**
   - Ajustar tiempo de apertura
   - Configurar señal RTS/DTR
   - Probar apertura desde POS

## Verificación de la Instalación

### 1. Lista de Verificación

- [ ] Sistema inicia correctamente
- [ ] Conexión a base de datos funcional
- [ ] Impresora térmica imprime
- [ ] Lector de códigos funciona
- [ ] Cajón de dinero abre
- [ ] Backups configurados
- [ ] Firewall configurado
- [ ] Antivirus con exclusiones

### 2. Pruebas Iniciales

1. **Prueba de Venta**
   - Crear nuevo producto
   - Realizar venta de prueba
   - Verificar impresión
   - Comprobar inventario

2. **Prueba de Backup**
   - Ejecutar backup manual
   - Verificar archivo generado
   - Probar restauración

## Solución de Problemas

### 1. Problemas Comunes

1. **Error de Conexión SQL**
   ```
   # Verificar servicio
   net start MSSQLSERVER
   
   # Verificar puerto
   netstat -an | findstr "1433"
   ```

2. **Error de Impresión**
   - Reiniciar cola de impresión
   - Verificar conexión USB/RED
   - Actualizar drivers

### 2. Logs de Instalación

- Ubicación: C:\Program Files\POS-NT\Logs
- Formato: install_YYYYMMDD.log
- Nivel: DEBUG

## Actualización del Sistema

### 1. Preparación

1. **Backup de Datos**
   ```sql
   BACKUP DATABASE POSNT TO DISK = 'C:\Backup\POSNT.bak'
   ```

2. **Verificar Espacio**
   - Mínimo 2GB libre
   - Limpiar archivos temporales
   - Verificar permisos

### 2. Proceso de Actualización

1. **Descargar Update**
   - Versión compatible
   - Verificar checksums
   - Backup automático

2. **Ejecutar Update**
   ```
   POS-NT-Update.exe /quiet /norestart
   ```

## Apéndice

### A. Comandos Útiles

```powershell
# Verificar servicios
Get-Service -Name "POSNT*"

# Limpiar caché
Remove-Item "C:\ProgramData\POS-NT\Cache\*"

# Reiniciar servicios
Restart-Service -Name "POSNTService"
```

### B. Archivos de Configuración

1. **config.json**
   ```json
   {
     "Database": {
       "Server": "localhost",
       "Database": "POSNT",
       "User": "sa",
       "Password": "****"
     },
     "Printing": {
       "DefaultPrinter": "EPSON-T20",
       "TicketWidth": 80,
       "AutoCut": true
     }
   }
   ```

### C. Contacto Soporte

- Soporte Técnico: soporte@posnt.com
- Teléfono: (800) 123-4567
- Portal: https://soporte.posnt.com 