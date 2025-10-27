# 🔧 Solución: Error 405 en Login - URL Incorrecta

## 🐛 Problema
El login falla con error `405 Method Not Allowed` porque la URL del backend está incorrecta:
- **URL Incorrecta:** `https://posntrd.online/backend-posent-production.up.railway.app`
- **URL Correcta:** `https://backend-posent-production.up.railway.app/api`

## ✅ Solución

### 1. Configurar Variable de Entorno en Vercel

Ve a tu proyecto en Vercel:
1. Entra a **Settings** → **Environment Variables**
2. Busca o agrega la variable:
   - **Variable name:** `REACT_APP_API_URL`
   - **Value:** `https://backend-posent-production.up.railway.app/api`
   - **Environment:** Selecciona "Production" (y todas las que necesites)

**Importante:** La URL debe incluir `/api` al final porque todas las rutas del backend tienen ese prefijo.

### 2. Redesplegar la Aplicación

Después de agregar la variable:
1. Ve a la pestaña **"Deployments"**
2. Busca el deployment más reciente
3. Haz click en los **tres puntos** (⋯)
4. Selecciona **"Redeploy"**
5. Espera a que termine el despliegue

### 3. Verificar

Después del redespliegue:
1. Abre la consola del navegador (F12)
2. Intenta hacer login
3. Verifica que la URL de la petición sea:
   `https://backend-posent-production.up.railway.app/api/auth/login`
4. Debe funcionar sin error 405

## 🔍 Debug

Para verificar que la variable está configurada correctamente:
1. Abre la consola del navegador en producción
2. Ejecuta: `console.log(process.env.REACT_APP_API_URL)`
3. Debe mostrar: `https://backend-posent-production.up.railway.app/api`

## 📝 Notas Importantes

- Las variables de entorno en Vercel se compilan en el build
- Si cambias una variable, **DEBES redesplegar** para que tome efecto
- El archivo `.env` local solo afecta desarrollo local
- No hardcodear URLs en el código

## 🎯 URL Correcta del Backend

```
https://backend-posent-production.up.railway.app/api
```

## ✅ Checklist

- [ ] Variable `REACT_APP_API_URL` configurada en Vercel
- [ ] Valor correcto: `https://backend-posent-production.up.railway.app/api`
- [ ] Aplicación redesplegada
- [ ] Login funciona correctamente
- [ ] Sin errores 405 en consola
