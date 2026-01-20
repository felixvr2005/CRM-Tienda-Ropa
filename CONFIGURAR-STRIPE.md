# 🔧 Configurar Stripe para Pagos

## ¿Por qué sale error?

Las claves de Stripe en tu `.env.local` están vacías:
```
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...    ❌ Incompleta
STRIPE_SECRET_KEY=sk_test_...                ❌ Incompleta
```

## ✅ Solución en 5 minutos

### Paso 1: Ir al Dashboard de Stripe
Abre: https://dashboard.stripe.com/apikeys

### Paso 2: Copiar tus claves
Verás algo así:
```
Publishable key (test mode): pk_test_5nR7M4k8X9L2Q3W5Z...
Secret key (test mode):       sk_test_4pQ8R5T2X7L9M1K3J...
```

**Copia exactamente como aparecen**, incluyendo el prefijo `pk_test_` o `sk_test_`

### Paso 3: Actualizar .env.local
Reemplaza en `c:\Users\Felix\Desktop\CRM-Tienda Ropa\.env.local`:

```env
# ANTES ❌
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# DESPUÉS ✅
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_5nR7M4k8X9L2Q3W5Z...
STRIPE_SECRET_KEY=sk_test_4pQ8R5T2X7L9M1K3J...
```

### Paso 4: Guardar y recargar
1. Guarda el archivo
2. Reinicia el servidor (`npm run dev`)
3. Recarga el navegador

### Paso 5: ¡Listo!
Ahora el checkout debería funcionar sin errores.

---

## 🔐 Importante: No compartir estas claves

- **sk_test_** es PRIVADA - ¡NUNCA la compartas!
- **pk_test_** es pública - está bien que esté en código
- Si las expones, ve a Dashboard → Settings → API Keys y regenera

---

## 📱 Si no tienes cuenta Stripe

1. Ve a https://stripe.com
2. Click en "Registrarse"
3. Completa con tu email
4. Sigue los pasos
5. ¡Listo! Tendrás acceso a las claves de prueba

---

## ✔️ Verificación

Después de configurar, en el navegador verás:
- ✅ El botón de checkout funciona
- ✅ Se abre el formulario de Stripe
- ✅ Puedes hacer un pago de prueba

---

## 🧪 Datos de prueba Stripe

Para probar pagos sin usar tarjeta real:

**Tarjeta válida:**
```
Número: 4242 4242 4242 4242
Mes: Cualquiera (ej: 12)
Año: Futuro (ej: 2026)
CVC: Cualquiera (ej: 123)
```

**Tarjeta que será rechazada:**
```
Número: 4000 0000 0000 0002
Mes: Cualquiera
Año: Futuro
CVC: Cualquiera
```

---

## 💬 ¿Aún hay problemas?

Ejecuta en terminal:
```powershell
npm run dev
```

Y mira la consola para ver mensajes de error específicos.
