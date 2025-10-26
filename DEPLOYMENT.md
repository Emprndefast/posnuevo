# Guía de Despliegue - POSENT Frontend

## Problema Actual

El login está fallando en producción con error `405 Method Not Allowed` porque:
1. El frontend en Vercel está compilado con una URL antigua del backend
2. El build de producción está usando `https://posntrd.online/backend-posent-production.up.railway.app/auth/login`
3. La ruta correcta debería ser: `https://backend-posent-production.up.railway.app/api/auth/login`

## Solución

### 1. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ve a Settings → Environment Variables y configura:

```
REACT_APP_API_URL=https://backend-posent-production.up.railway.app/api
```

### 2. Recompilar y Redesplegar

Después de configurar la variable de entorno:

1. Ve a la pestaña "Deployments"
2. Haz click en los tres puntos (⋯) del deployment más reciente
3. Selecciona "Redeploy"

### 3. Verificar

Después del redespliegue, verifica que:
- El frontend llama a la URL correcta
- El endpoint `/api/auth/login` responde correctamente
- El login funciona sin errores 405

## Notas

- El archivo `.env` local solo afecta desarrollo local
- Para producción, las variables se configuran en la plataforma de hosting (Vercel)
- No hardcodear URLs en el código, siempre usar `process.env.REACT_APP_API_URL`
