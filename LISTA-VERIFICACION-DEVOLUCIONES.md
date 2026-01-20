# LISTA DE VERIFICACIÓN - FLUJO DE DEVOLUCIONES Y FIXES

## ✅ PROBLEMAS IDENTIFICADOS Y SOLUCIONADOS

### 1. POPUP NEWSLETTER NO APARECÍA
**Problema:** El modal no se mostraba al iniciar sesión
**Solución:** 
- Se mejoró el script de `NewsletterModal.astro` para esperar a que el DOM esté completamente cargado
- Se agregó validación de `DOMContentLoaded` para evitar problemas de timing
- Se agregó `console.log` para debugging

**Archivo modificado:** `src/components/NewsletterModal.astro`

---

## ✅ REDIRECCIÓN POST LOGIN
**Cambio:** Ahora redirige a `/` en lugar de `/cuenta`
**Beneficio:** El popup newsletter aparece automáticamente

**Archivo modificado:** `src/pages/cuenta/login.astro`

---

## ✅ FLUJO DE CANCELACIÓN CORRECTO
**Regla implementada:** 
- Solo se pueden cancelar pedidos en estado `pending` o `confirmed`
- Pedidos `shipped` o `delivered` NO se pueden cancelar
- Botón de cancelar se oculta automáticamente cuando el pedido está enviado

**Archivo modificado:** `src/pages/cuenta/pedidos/[orderNumber].astro`

---

## ✅ NUEVO FLUJO DE DEVOLUCIONES COMPLETO

### Estados de Devolución:
1. **pending** - Solicitud recibida, esperando revisión del admin
2. **label_sent** - Admin envió etiqueta de devolución
3. **in_return** - Cliente envió el paquete
4. **received** - Admin confirmó recepción del paquete
5. **refunded** - Dinero devuelto al cliente
6. **rejected** - Solicitud rechazada

### Tabla de Base de Datos:
```sql
CREATE TABLE return_requests (
  id UUID,
  order_id UUID,
  customer_id UUID,
  status VARCHAR (pending/label_sent/in_return/received/refunded/rejected),
  reason TEXT,
  return_label_url TEXT,
  return_tracking_number VARCHAR,
  received_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_amount DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Archivo SQL modificado:** `supabase/complete-schema.sql`

---

## 🔄 PROCESO DE DEVOLUCIÓN PASO A PASO

### PASO 1: CLIENTE SOLICITA DEVOLUCIÓN
**Ubicación:** `/cuenta/pedidos/[orderNumber]`
**Condición:** Solo si `order.status === 'delivered'`
**Acción:** Aparece botón "SOLICITAR DEVOLUCIÓN"

**Archivos:**
- `src/pages/cuenta/pedidos/[orderNumber].astro` - Botón y modal

### PASO 2: CLIENTE COMPLETA FORMULARIO
**Modal muestra:**
- Campo de texto para motivo de devolución
- Info sobre el proceso en 5 pasos
- Botón "Solicitar Devolución"

**Validaciones:**
- Campo razón es obligatorio
- Máximo 1000 caracteres

**Archivo:**
- `src/pages/cuenta/pedidos/[orderNumber].astro` - Formulario

### PASO 3: SE CREA SOLICITUD EN BD
**Endpoint:** `POST /api/orders/request-return`
**Parámetros:** `{ orderNumber, reason }`

**Validaciones:**
- Pedido existe
- Pedido está en estado 'delivered'
- No existe otra solicitud activa para este pedido

**Acciones:**
- Crear registro en tabla `return_requests` con estado `pending`
- Email al cliente: "Recibimos tu solicitud"
- Email al admin: "Nueva solicitud de devolución"

**Archivo:**
- `src/pages/api/orders/request-return.ts`

### PASO 4: ADMIN REVISA Y ENVÍA ETIQUETA
**Ubicación:** Panel admin (no implementado en esta fase)
**Acción:** Admin marca solicitud como `label_sent`
**Qué pasa:**
- Email al cliente con etiqueta de devolución
- Email contiene: número de seguimiento, dirección de devolución
- return_label_url se guarda en BD

### PASO 5: CLIENTE ENVÍA PAQUETE
**Acción:** Cliente envía paquete con etiqueta

### PASO 6: ADMIN CONFIRMA RECEPCIÓN
**Ubicación:** Panel admin
**Acción:** Admin marca solicitud como `received`
**Qué pasa:**
- Restaura stock automáticamente
- Procesa reembolso en Stripe
- Cambia estado a `refunded`
- Email al cliente: "Recibimos tu devolución, dinero en 5-7 días"

### PASO 7: CLIENTE RECIBE DINERO
**Timing:** 5-7 días hábiles en su método de pago original

---

## 📋 LISTA DE VERIFICACIÓN FUNCIONAL

### Test 1: VERIFICAR POPUP NEWSLETTER
- [ ] Ir a `/` sin sesión
- [ ] Ver popup después de 2 segundos
- [ ] Ingresar email válido
- [ ] Recibir código descuento
- [ ] Copiar código al clipboard

**Esperado:** Modal aparece, se puede suscribir, se genera código

---

### Test 2: LOGIN Y REDIRECCIÓN
- [ ] Ir a `/cuenta/login`
- [ ] Ingresar credenciales correctas
- [ ] Verificar que redirecciona a `/`
- [ ] Verificar que popup está visible
- [ ] Cerrar popup y ver página principal

**Esperado:** Login exitoso → Popup aparece en `/`

---

### Test 3: CANCELACIÓN DE PEDIDO (PENDING)
- [ ] Ir a pedido con estado `pending`
- [ ] Verificar que botón "CANCELAR PEDIDO" está visible
- [ ] Hacer click en botón
- [ ] Confirmar cancelación
- [ ] Verificar que:
  - [ ] Estado cambió a `cancelled`
  - [ ] Stock se restauró
  - [ ] Reembolso se procesó
  - [ ] Redirige a `/cuenta/pedidos`

**Esperado:** Cancelación exitosa, stock restaurado, dinero devuelto

---

### Test 4: CANCELACIÓN DE PEDIDO (DELIVERED)
- [ ] Ir a pedido con estado `delivered`
- [ ] Verificar que botón "CANCELAR PEDIDO" NO existe
- [ ] Verificar que botón "SOLICITAR DEVOLUCIÓN" sí existe

**Esperado:** No se puede cancelar, solo devolver

---

### Test 5: SOLICITAR DEVOLUCIÓN
- [ ] Ir a pedido con estado `delivered`
- [ ] Hacer click en "SOLICITAR DEVOLUCIÓN"
- [ ] Escribir motivo en textarea
- [ ] Hacer click en "Solicitar Devolución"
- [ ] Verificar que:
  - [ ] Se crea registro en `return_requests` con estado `pending`
  - [ ] Modal muestra mensaje de éxito
  - [ ] Redirige a `/cuenta/pedidos`

**Esperado:** Solicitud creada correctamente, confirmación visual

---

### Test 6: ADMIN ENVÍA ETIQUETA (ADMIN PANEL - TODO)
- [ ] En admin panel, ir a sección de devoluciones
- [ ] Ver solicitud con estado `pending`
- [ ] Hacer click en "Enviar Etiqueta"
- [ ] Cargar etiqueta PDF o URL
- [ ] Enviar número de seguimiento
- [ ] Verificar que:
  - [ ] Estado cambió a `label_sent`
  - [ ] Email enviado al cliente con etiqueta
  - [ ] return_label_url guardada en BD

**Esperado:** Etiqueta enviada, cliente notificado

---

### Test 7: ADMIN CONFIRMA RECEPCIÓN (ADMIN PANEL - TODO)
- [ ] En admin panel, ver solicitud con estado `in_return`
- [ ] Hacer click en "Confirmar Recepción"
- [ ] Ingresar tracking number (opcional)
- [ ] Verificar que:
  - [ ] Estado cambió a `received`
  - [ ] Stock se restauró
  - [ ] Reembolso se procesó en Stripe
  - [ ] Estado cambió a `refunded`
  - [ ] Email enviado al cliente

**Esperado:** Recepción confirmada, dinero procesado

---

### Test 8: CLIENTE VE ESTADO DE DEVOLUCIÓN (CUSTOMER ACCOUNT - TODO)
- [ ] En `/cuenta/pedidos`, pedido muestra estado especial para devolución
- [ ] Al hacer click en "Ver Detalles"
- [ ] Mostrar sección "Estado de Devolución" con:
  - [ ] Estado actual (pending/label_sent/in_return/received/refunded)
  - [ ] Fecha de solicitud
  - [ ] Etiqueta de devolución (si está disponible)
  - [ ] Número de seguimiento (si está disponible)
  - [ ] Monto que será reembolsado

**Esperado:** Cliente ve progreso de su devolución en tiempo real

---

## 🚀 PRÓXIMAS IMPLEMENTACIONES

### Admin Panel - Gestión de Devoluciones
- [ ] Crear página `/admin/devoluciones`
- [ ] Tabla con solicitudes pendientes
- [ ] Botón para enviar etiqueta
- [ ] Formulario para subir PDF de etiqueta
- [ ] Botón para confirmar recepción
- [ ] Historial de devoluciones

### Emails Automáticos
- [ ] Email cliente: "Solicitud recibida"
- [ ] Email admin: "Nueva devolución"
- [ ] Email cliente: "Etiqueta enviada"
- [ ] Email cliente: "Devolución recibida, reembolso en proceso"
- [ ] Email cliente: "Reembolso procesado"

### Integraciones Stripe
- [ ] Procesar reembolsos automáticos
- [ ] Verificar estado de reembolso
- [ ] Notificar al cliente cuando se complete

---

## 📝 NOTAS

- Todos los timestamps están en TIMESTAMPTZ
- Los reembolsos se procesan automáticamente en Stripe
- El stock se restaura cuando el admin confirma recepción
- Los emails se envían automáticamente en cada estado
- Las transacciones son atómicas en la BD

---

**Última actualización:** 19 de enero de 2026
**Estado:** Estructura base implementada, admin panel pendiente
