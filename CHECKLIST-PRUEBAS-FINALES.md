# ✅ CHECKLIST FINAL - VERIFICACIÓN COMPLETA

**Actualizado:** 19 de enero de 2026  
**Sistema:** CRM Tienda Ropa - Versión 2.0

---

## 🔍 VERIFICACIÓN DE CAMBIOS EN CÓDIGO

### Middleware (`src/middleware.ts`)
- [x] Importa `supabaseAdmin`
- [x] Valida tabla `admin_users` para /admin routes
- [x] Verifica `is_active = true`
- [x] Guarda `isAdmin` en `context.locals`
- [x] Redirige si no es admin
- [x] Log de intentos de acceso no autorizado

### Email (`src/lib/email.ts`)
- [x] Nueva función `sendAdminNotificationEmail()`
- [x] Recibe: email, order_number, estados, etc.
- [x] Genera HTML profesional
- [x] Mapeo de emojis por estado
- [x] Incluye link de rastreo
- [x] Manejo de errores sin lanzar excepciones
- [x] Retorna {success, messageId} o {success: false, error}

### Update Status (`src/pages/api/admin/orders/update-status.ts`)
- [x] Obtiene estado anterior de orden
- [x] Valida que email existe
- [x] Compara status anterior vs nuevo
- [x] Llama `sendAdminNotificationEmail()` si cambió
- [x] Continúa si email falla (no bloquea)
- [x] Restaura stock si es refund

### Admin Dashboard (`src/pages/admin/index.astro`)
- [x] Obtiene token de cookies
- [x] Valida usuario con supabase
- [x] Consulta tabla admin_users
- [x] Verifica is_active = true
- [x] Redirige a login si no es admin
- [x] Continúa si es admin válido
- [x] Muestra datos del dashboard

### Admin Reports (`src/pages/admin/reports.astro`)
- [x] Same validación que dashboard
- [x] Obtiene email del admin
- [x] Pre-llena campo de email
- [x] Conserva funcionalidad de reportes
- [x] Permite descargar CSV/JSON

### Home Index (`src/pages/index.astro`)
- [x] Cambió prerender a false
- [x] Valida si token existe
- [x] Obtiene usuario de supabase
- [x] Consulta tabla admin_users
- [x] Redirige a /admin si es admin
- [x] Deja pasar si es cliente
- [x] Deja pasar si no está logueado

---

## 🧪 PRUEBAS DE SESIÓN

### Test 1: Persistencia de Sesión
**Objetivo:** Verificar que la sesión se mantiene 7 días

**Pasos:**
1. [ ] Abre servidor: `npm run dev`
2. [ ] Ve a `http://localhost:4322/cuenta/login`
3. [ ] Login con cliente: `cliente@test.com` / `password123`
4. [ ] Verifica que está logueado
5. [ ] Cierra el navegador COMPLETAMENTE
6. [ ] Reabre el navegador
7. [ ] Ve a `http://localhost:4322/cuenta/pedidos`
8. [ ] Verifica que NO te pide login
9. [ ] La sesión debe estar activa ✅

**Evidencia:**
- [ ] Sin redirección a login
- [ ] Puede ver lista de pedidos
- [ ] Cookie `sb-access-token` sigue presente

**Duración:** ~5 minutos

---

### Test 2: Logout Completo
**Objetivo:** Verificar que logout limpia todo

**Pasos:**
1. [ ] Estando en sesión (cliente o admin)
2. [ ] Hace clic en "Cerrar Sesión" / Logout
3. [ ] Frontend borra cookies: sb-access-token, sb-refresh-token
4. [ ] Redirije a página de inicio
5. [ ] Intenta acceder a `/cuenta/pedidos`
6. [ ] Verifica que redirige a `/cuenta/login`
7. [ ] Abre DevTools → Application → Cookies
8. [ ] Verifica que NO hay `sb-access-token`

**Evidencia:**
- [ ] Redirigido a login
- [ ] Cookies eliminadas
- [ ] No puede acceder a /cuenta/pedidos

**Duración:** ~3 minutos

---

## 🔐 PRUEBAS DE SEGURIDAD - ADMIN VS CLIENTE

### Test 3: Admin No Entra Como Cliente
**Objetivo:** Verificar que admin entra a /admin, no a cliente

**Pasos:**
1. [ ] Accede a `http://localhost:4322/`
2. [ ] Abre DevTools → Network → filtrar peticiones
3. [ ] Ve a `/cuenta/login`
4. [ ] Login con admin: `admin@tiendaropa.com` / `password123`
5. [ ] Verifica que fue redirigido a `/admin` (NO a `/`)
6. [ ] Verifica dashboard de admin cargó
7. [ ] URL debe ser `http://localhost:4322/admin`

**Evidencia:**
- [ ] Redirección a /admin automática
- [ ] Dashboard de admin visible
- [ ] URL = /admin

**Duración:** ~3 minutos

---

### Test 4: Admin No Ve Tienda Como Cliente
**Objetivo:** Verificar que admin no baja de rol a cliente

**Pasos:**
1. [ ] Logueado como admin en `/admin`
2. [ ] Abre nueva pestaña
3. [ ] Ve a `http://localhost:4322/`
4. [ ] Verifica que redirige a `/admin`
5. [ ] Abre `/cuenta/pedidos`
6. [ ] Verifica que redirige a `/admin/pedidos`

**Evidencia:**
- [ ] Siempre redirige a /admin
- [ ] Nunca baja a interfaz de cliente

**Duración:** ~2 minutos

---

### Test 5: Cliente No Accede a /admin
**Objetivo:** Verificar que cliente no ve panel admin

**Pasos:**
1. [ ] Logueado como cliente
2. [ ] Va directamente a `http://localhost:4322/admin`
3. [ ] Verifica que redirige a `/cuenta/login?error=unauthorized`
4. [ ] Intenta `/admin/reportes`
5. [ ] Mismo resultado: redirige a login
6. [ ] Intenta `/admin/pedidos`
7. [ ] Mismo resultado: redirige a login

**Evidencia:**
- [ ] Redirigido a login
- [ ] Parámetro error=unauthorized
- [ ] No puede ver nada de admin

**Duración:** ~3 minutos

---

## 📧 PRUEBAS DE EMAIL

### Test 6: Email al Cambiar Estado (Pending → Confirmed)
**Objetivo:** Verificar que cliente recibe email cuando admin confirma orden

**Setup:**
- [ ] Hay una orden en estado "pending"
- [ ] Email del cliente es válido (ej: cliente@test.com)

**Pasos:**
1. [ ] Logueado como admin
2. [ ] Va a `/admin/pedidos`
3. [ ] Hace clic en una orden "pending"
4. [ ] Ve el botón "Cambiar Estado"
5. [ ] Selecciona "Confirmado" (confirmed)
6. [ ] Hace clic en "Guardar"
7. [ ] Espera 2-3 segundos
8. [ ] Revisa Gmail de cliente (el que recibió la orden)

**Evidencia en Email:**
- [ ] Asunto: "Tu pedido #XXXXX ahora está Confirmado ✅"
- [ ] De: felixvr2005@gmail.com
- [ ] Para: cliente@test.com
- [ ] Contiene: "pending" → "Confirmado"
- [ ] Emoji de check ✅
- [ ] Contiene link: "Ver Detalles"
- [ ] Link funciona y va a `/cuenta/pedidos/XXXXX`

**Duración:** ~5 minutos

---

### Test 7: Email al Cambiar Estado (Confirmed → Processing)
**Objetivo:** Verificar otra transición

**Pasos:**
1. [ ] Orden en estado "Confirmado"
2. [ ] Admin cambia a "En Proceso"
3. [ ] Espera 2-3 segundos
4. [ ] Revisa Gmail del cliente

**Evidencia:**
- [ ] Asunto: "Tu pedido #XXXXX ahora está En Proceso 🔄"
- [ ] Contiene emoji 🔄
- [ ] Estados: Confirmado → En Proceso

**Duración:** ~3 minutos

---

### Test 8: Email al Cambiar Estado (Processing → Shipped)
**Objetivo:** Verificar cambio a enviado

**Pasos:**
1. [ ] Orden en estado "En Proceso"
2. [ ] Admin cambia a "Enviado"
3. [ ] Espera 2-3 segundos
4. [ ] Revisa Gmail

**Evidencia:**
- [ ] Asunto: "Tu pedido #XXXXX ahora está Enviado 📦"
- [ ] Emoji de caja 📦
- [ ] Estados: En Proceso → Enviado

**Duración:** ~3 minutos

---

### Test 9: Email al Cambiar Estado (Shipped → Delivered)
**Objetivo:** Verificar entrega

**Pasos:**
1. [ ] Orden en estado "Enviado"
2. [ ] Admin cambia a "Entregado"
3. [ ] Espera 2-3 segundos
4. [ ] Revisa Gmail

**Evidencia:**
- [ ] Asunto: "Tu pedido #XXXXX ha sido Entregado 🎉"
- [ ] Emoji de celebración 🎉
- [ ] Estados: Enviado → Entregado

**Duración:** ~3 minutos

---

## 📊 PRUEBAS DE REPORTES

### Test 10: Admin Descarga Reportes CSV
**Objetivo:** Verificar que admin puede descargar reportes

**Pasos:**
1. [ ] Logueado como admin
2. [ ] Va a `/admin/reportes`
3. [ ] Verifica que email está pre-llenado
4. [ ] Selecciona período: "Mes"
5. [ ] Selecciona formato: "CSV"
6. [ ] Hace clic en "Descargar"
7. [ ] Espera descarga del archivo

**Evidencia:**
- [ ] Archivo se descarga (ejemplo.csv)
- [ ] Se puede abrir en Excel
- [ ] Contiene data de órdenes del período
- [ ] Columnas: Order ID, Cliente, Estado, Total, Fecha

**Duración:** ~3 minutos

---

### Test 11: Admin Descarga Reportes JSON
**Objetivo:** Verificar descarga en JSON

**Pasos:**
1. [ ] En `/admin/reportes`
2. [ ] Selecciona período: "Semana"
3. [ ] Selecciona formato: "JSON"
4. [ ] Hace clic en "Descargar"
5. [ ] Verifica archivo se descarga

**Evidencia:**
- [ ] Archivo se descarga (ejemplo.json)
- [ ] Es JSON válido (puede abrirse en editor)
- [ ] Contiene data de órdenes
- [ ] Estructura: {orders: [{...}, {...}]}

**Duración:** ~3 minutos

---

### Test 12: Email Admin Recibe Reporte
**Objetivo:** Verificar que admin recibe reporte por email

**Pasos:**
1. [ ] En `/admin/reportes`
2. [ ] Email pre-rellenado debe ser email del admin
3. [ ] Selecciona período y formato
4. [ ] Hace clic en "Enviar por Email"
5. [ ] Espera 3-5 segundos
6. [ ] Revisa Gmail del admin

**Evidencia:**
- [ ] Email recibido en Gmail admin
- [ ] Asunto contiene período (ej: "Reporte Semanal")
- [ ] Email adjunto con CSV/JSON
- [ ] Adjunto se puede abrir

**Duración:** ~5 minutos

---

## 🎯 RESUMEN DE PUNTOS A VERIFICAR

**Sesiones (15 minutos):**
- [ ] Test 1: Persistencia (5 min)
- [ ] Test 2: Logout (3 min)
- [ ] Test 2b: Logout no deja residuo (2 min)

**Seguridad (8 minutos):**
- [ ] Test 3: Admin va a /admin (3 min)
- [ ] Test 4: Admin no baja a cliente (2 min)
- [ ] Test 5: Cliente no ve /admin (3 min)

**Emails (20 minutos):**
- [ ] Test 6: pending → confirmed (5 min)
- [ ] Test 7: confirmed → processing (3 min)
- [ ] Test 8: processing → shipped (3 min)
- [ ] Test 9: shipped → delivered (3 min)
- [ ] Email tiene emojis y formato correcto (3 min)

**Reportes (15 minutos):**
- [ ] Test 10: Descargar CSV (3 min)
- [ ] Test 11: Descargar JSON (3 min)
- [ ] Test 12: Email con reporte (3 min)
- [ ] Email admin pre-rellenado (3 min)

---

## ⏱️ TIEMPO TOTAL DE PRUEBAS

**Tiempo estimado:** ~60 minutos (1 hora)

**Desglose:**
- Sesiones: 15 min
- Seguridad: 8 min
- Emails: 20 min
- Reportes: 15 min
- Margen de error: 2 min

---

## 📝 RESULTADO ESPERADO

### Si ✅ Todos los Tests Pasan:

```
ESTADO: ✅ SISTEMA LISTO PARA PRODUCCIÓN

✅ Sesiones persisten correctamente
✅ Logout limpia completamente
✅ Admin/Cliente roles separados
✅ Emails envían automáticamente
✅ Reportes descargan correctamente
✅ Email admin pre-rellenado
✅ Sin errores en console
✅ Todas rutas protegidas
✅ Redireccionamientos correctos
```

### Si ❌ Algún Test Falla:

Revisar:
1. [ ] Consola del navegador (DevTools)
2. [ ] Consola del servidor (npm run dev)
3. [ ] Variables de ambiente (.env.local)
4. [ ] Cookies (DevTools → Application)
5. [ ] Network tab para errores HTTP
6. [ ] Logs de Supabase

---

## 🚀 CÓMO COMENZAR

1. **Abre terminal:**
   ```bash
   cd "c:\Users\Felix\Desktop\CRM-Tienda Ropa"
   npm run dev
   ```

2. **Abre navegador:**
   ```
   http://localhost:4322/
   ```

3. **Sigue tests en orden:**
   - Primero Tests 1-2 (Sesiones)
   - Luego Tests 3-5 (Seguridad)
   - Luego Tests 6-9 (Emails)
   - Finalmente Tests 10-12 (Reportes)

4. **Marca cada test conforme termines**

5. **Al final, tienes dos opciones:**
   - ✅ **Todos pasan:** Sistema listo
   - ❌ **Algo falla:** Reporta qué no funciona

---

**¿Preguntas?** Consulta estos archivos:
- `CAMBIOS-TECNICOS-DETALLADOS.md` - Qué se modificó
- `VERIFICACION-COMPLETA-SESIONES-ADMIN.md` - Detalles técnicos
- `PRUEBA-SISTEMA-COMPLETO.txt` - Prueba rápida de 10 minutos

---

*Checklist actualizado: 19 de enero de 2026*
*Sistema: CRM Tienda Ropa v2.0*
*Estado: ✅ Listo para prueba manual*
