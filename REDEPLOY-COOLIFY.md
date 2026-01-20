# Redeploy en Coolify - Solución CSRF

## Problema
Error "Cross-site POST form submissions are forbidden" (403) en Coolify después de actualizar código.

## Solución
Los cambios necesarios ya están en GitHub:
- ✅ Convertir formularios POST a fetch API con JSON
- ✅ Configuración `security: checkOrigin: false` en astro.config.mjs

## Pasos para Redeploy:

### 1. En Coolify Dashboard:
1. Ve a tu aplicación "FashionStore"
2. Abre la sección **Deployments** o **Build & Deploy**
3. Haz clic en **"Rebuild from latest commit"** o **"Redeploy"**
4. Espera a que termine el build (5-10 minutos)

### 2. Alternativa - Forzar redeploy desde CLI:
```bash
# Si tienes Coolify CLI instalado
coolify deploy --force
```

### 3. Alternativa - Desde el webhook de GitHub:
Coolify puede estar configurado para hacer redeploy automático. Si no:
1. En Coolify: Ve a **Settings** → **Webhooks**
2. Verifica que el webhook de GitHub esté configurado
3. En GitHub: Abre el repositorio → **Settings** → **Webhooks**
4. Busca el webhook de Coolify y haz clic en **"Redeliver"**

### 4. Verificar después del redeploy:
- Abre https://fashionforcestore.victoriafp.online/admin/pedidos/[orderNumber]
- Intenta cambiar el estado de un pedido
- El botón debe hacer fetch sin errores 403

## Cambios en el código:

### astro.config.mjs:
```javascript
security: {
  checkOrigin: false
}
```

### src/pages/admin/pedidos/[orderNumber].astro:
- Convertir formulario POST a botones con fetch
- Handlers JavaScript para ambos botones

### Endpoints actualizados:
- `PUT /api/admin/orders/update-status` - Aceptar JSON
- `PUT /api/admin/orders/update-tracking` - Aceptar JSON

## Si sigue sin funcionar:

1. **Limpia la caché de Coolify:**
   - En Coolify: Settings → Clear Cache
   - Redeploy

2. **Verifica la versión de Astro:**
   ```bash
   npm list astro
   ```
   Debe ser v5.16.7 o superior para soportar `checkOrigin: false`

3. **Mira los logs en Coolify:**
   - En Coolify: View Logs
   - Busca errores relacionados con CSRF o POST

4. **Como último recurso:**
   Si el problema persiste, puede ser una configuración de Nginx/proxy en Coolify.
   Contacta a Coolify support o prueba deshabilitar completamente la proxy.
