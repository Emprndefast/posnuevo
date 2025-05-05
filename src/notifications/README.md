# Sistema de Notificaciones

Este módulo implementa un sistema completo de notificaciones para la aplicación POS-NT, permitiendo notificar a los usuarios sobre eventos importantes como ventas, nuevos productos, alertas de stock y recordatorios diarios.

## Características

- **Notificaciones de Escritorio**: Utiliza la Web Notifications API para mostrar notificaciones en tiempo real.
- **Notificaciones por Email**: Envía correos electrónicos a los usuarios cuando ocurren eventos importantes.
- **Configuración Personalizable**: Los usuarios pueden activar/desactivar las notificaciones según sus preferencias.
- **Recordatorio Diario**: Envía recordatorios diarios a usuarios en plan gratuito.

## Estructura de Archivos

- `NotificationSwitches.jsx`: Componente para gestionar los switches de notificaciones.
- `notificationService.js`: Servicio para hacer llamadas a la API de notificaciones.
- `useNotifications.js`: Hook personalizado para manejar las notificaciones.
- `NotificationExample.jsx`: Componente de ejemplo para mostrar cómo usar las notificaciones.
- `config/notifications.js`: Configuración para el sistema de notificaciones.

## Uso

### Configuración de Notificaciones

```jsx
import NotificationSwitches from './notifications/NotificationSwitches';

// En tu componente
<NotificationSwitches user={currentUser} />
```

### Uso del Hook de Notificaciones

```jsx
import { useNotifications } from './notifications/useNotifications';

// En tu componente
const { notifySale, notifyNewProduct, notifyStockAlert, sendDailyReminder } = useNotifications(settings, user);

// Ejemplo de uso
const handleSale = async () => {
  await notifySale({
    userId: user.id,
    saleData: {
      total: 150.50,
      items: 3
    }
  });
};
```

## Backend

El backend implementa las siguientes rutas:

- `POST /notifications/notify-sale`: Notifica una venta reciente.
- `POST /notifications/notify-new-product`: Notifica un nuevo producto agregado.
- `POST /notifications/notify-stock-alert`: Notifica stock bajo o agotado.
- `POST /notifications/daily-trial-reminder`: Envía recordatorio diario para usuarios en plan gratuito.

## Configuración

### Variables de Entorno (Backend)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
SMTP_FROM=tu_correo@gmail.com
```

### Variables de Entorno (Frontend)

```
REACT_APP_API_URL=http://localhost:3001/api
```

## Notas

- Las notificaciones de escritorio requieren permiso del usuario.
- El recordatorio diario se envía automáticamente a las 9:00 AM todos los días.
- Las notificaciones por email solo se envían si el usuario tiene activada esta opción. 