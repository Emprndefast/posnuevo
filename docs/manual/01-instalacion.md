# Manual de Instalación - POS NT

## Requisitos del Sistema

### Hardware Mínimo
- Procesador: Intel Core i3 o equivalente
- RAM: 8GB
- Almacenamiento: 256GB SSD
- Red: Ethernet 100Mbps

### Software Requerido
- Windows 10/11 Pro 64-bit
- SQL Server 2019 Express o superior
- Node.js 18.x LTS
- Google Chrome / Microsoft Edge (última versión)

## Proceso de Instalación

### 1. Preparación del Sistema

#### Configuración de Windows
1. Instalar las últimas actualizaciones de Windows
2. Deshabilitar el modo de suspensión:
```powershell
powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
```

#### Configuración de Firewall
1. Abrir puertos necesarios:
```powershell
New-NetFirewallRule -DisplayName "POS NT - SQL" -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "POS NT - API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "POS NT - Web" -Direction Inbound -LocalPort 80,443 -Protocol TCP -Action Allow
```

### 2. Instalación de SQL Server

1. Descargar SQL Server Express desde el sitio oficial de Microsoft
2. Ejecutar el instalador con la siguiente configuración:
```powershell
Setup.exe /QS /ACTION=Install /FEATURES=SQLEngine /INSTANCENAME=POSNT /SQLSYSADMINACCOUNTS="BUILTIN\Administrators" /SECURITYMODE=SQL /SAPWD="TuContraseñaSegura123!"
```

3. Verificar la instalación:
```sql
SELECT @@VERSION
```

### 3. Instalación de Node.js

1. Descargar Node.js 18.x LTS
2. Instalar con opciones por defecto
3. Verificar la instalación:
```powershell
node --version
npm --version
```

### 4. Instalación de POS NT

#### Clonar Repositorio
```powershell
git clone https://github.com/posnt/posnt.git
cd posnt
```

#### Instalar Dependencias
```powershell
npm install
```

#### Configurar Variables de Entorno
1. Crear archivo `.env`:
```plaintext
DB_HOST=localhost
DB_NAME=POSNT
DB_USER=sa
DB_PASSWORD=TuContraseñaSegura123!
PORT=3000
NODE_ENV=production
```

#### Inicializar Base de Datos
```powershell
npm run db:init
```

### 5. Configuración del Sistema

#### Configurar Base de Datos
1. Ejecutar script de inicialización:
```sql
USE [POSNT]
GO

-- Crear usuario administrador
INSERT INTO Usuarios (nombre, email, password, rol)
VALUES ('Admin', 'admin@posnt.com', 'contraseña_hasheada', 'ADMIN');

-- Configurar parámetros iniciales
INSERT INTO Configuracion (clave, valor)
VALUES 
('NOMBRE_NEGOCIO', 'Mi Negocio'),
('MONEDA', 'USD'),
('ZONA_HORARIA', 'America/New_York');
```

#### Configurar Impresora
1. Instalar drivers de impresora térmica
2. Configurar en el sistema:
```javascript
{
  "printer": {
    "type": "thermal",
    "model": "EPSON_TM_T20",
    "port": "USB001",
    "width": 80,
    "characterSet": "PC437"
  }
}
```

### 6. Iniciar el Sistema

#### Iniciar Servicios
1. Iniciar SQL Server:
```powershell
Start-Service MSSQLSERVER
```

2. Iniciar API:
```powershell
npm run start:prod
```

#### Verificar Instalación
1. Abrir navegador: http://localhost:3000
2. Iniciar sesión con credenciales de administrador:
   - Usuario: admin@posnt.com
   - Contraseña: (la configurada en el paso 5)

### 7. Post-Instalación

#### Configuración de Respaldos
1. Crear directorio para respaldos:
```powershell
mkdir C:\backup\posnt
```

2. Configurar tarea programada:
```powershell
$action = New-ScheduledTaskAction -Execute "SQLCMD" -Argument "-E -Q `"BACKUP DATABASE [POSNT] TO DISK='C:\backup\posnt\daily.bak' WITH INIT`""
$trigger = New-ScheduledTaskTrigger -Daily -At 3AM
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "POSNT-Backup" -Description "Respaldo diario de POSNT"
```

#### Configuración de Seguridad
1. Habilitar HTTPS:
```powershell
New-SelfSignedCertificate -DnsName "posnt.local" -CertStoreLocation "cert:\LocalMachine\My"
```

2. Configurar firewall adicional:
```powershell
New-NetFirewallRule -DisplayName "POS NT - HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

### 8. Solución de Problemas Comunes

#### Verificar Servicios
```powershell
Get-Service MSSQLSERVER
Get-Process node
```

#### Logs del Sistema
1. SQL Server:
```powershell
Get-Content "C:\Program Files\Microsoft SQL Server\MSSQL15.POSNT\MSSQL\Log\ERRORLOG"
```

2. Aplicación:
```powershell
Get-Content ".\logs\app.log"
```

### 9. Actualización del Sistema

#### Backup Previo
```sql
BACKUP DATABASE [POSNT] TO DISK = 'C:\backup\posnt\pre_update.bak' WITH INIT
```

#### Actualizar Código
```powershell
git pull origin main
npm install
npm run db:migrate
```

### 10. Soporte y Recursos

#### Documentación
- Manual de Usuario: `/docs/manual/usuario.pdf`
- API Reference: `/docs/api/reference.md`
- Guía de Troubleshooting: `/docs/manual/troubleshooting.md`

#### Contacto Soporte
- Email: soporte@posnt.com
- Tel: (555) 123-4567
- Portal: https://soporte.posnt.com 