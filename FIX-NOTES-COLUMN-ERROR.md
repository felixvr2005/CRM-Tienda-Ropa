# 🔧 FIX - Error "Could not find the 'notes' column"

**Problema:** "Could not find the 'notes' column of 'orders' in the schema cache"

**Causa:** El archivo `src/pages/api/webhooks/stripe.ts` estaba intentando insertar en una columna `notes` que NO existe en la tabla `orders`

**Solución Aplicada:**

1. ✅ REMOVIDA línea con `notes: ...` 
2. ✅ CORREGIDO nombre de campo `stripe_session_id` → `stripe_checkout_session_id`
3. ✅ CORREGIDO nombre de campo `stripe_payment_intent` → `stripe_payment_intent_id`
4. ✅ CORREGIDO nombre de campo `discount` → `discount_amount`

---

## 📝 Cambios en `src/pages/api/webhooks/stripe.ts`

### Antes (❌ FALLABA):
```typescript
.insert({
  order_number: orderNumber,
  customer_id: customerId,
  customer_email: email,
  customer_name: shippingAddress?.name || '',
  customer_phone: phone,
  status: 'confirmed',
  payment_status: 'paid',
  payment_method: 'stripe',
  stripe_session_id: session.id,              // ❌ NOMBRE INCORRECTO
  stripe_payment_intent: session.payment_intent as string, // ❌ NOMBRE INCORRECTO
  subtotal: subtotal,
  shipping_cost: shippingCost,
  discount: 0,                                 // ❌ NOMBRE INCORRECTO
  total_amount: totalAmount,
  shipping_address: shippingAddress,
  shipping_method: shippingMethod,
  notes: `Pago confirmado via Stripe...`     // ❌ COLUMNA NO EXISTE
})
```

### Después (✅ CORRECTO):
```typescript
.insert({
  order_number: orderNumber,
  customer_id: customerId,
  customer_email: email,
  customer_name: shippingAddress?.name || '',
  customer_phone: phone,
  status: 'confirmed',
  payment_status: 'paid',
  payment_method: 'stripe',
  stripe_checkout_session_id: session.id,     // ✅ CORRECTO
  stripe_payment_intent_id: session.payment_intent as string, // ✅ CORRECTO
  subtotal: subtotal,
  shipping_cost: shippingCost,
  discount_amount: 0,                          // ✅ CORRECTO
  total_amount: totalAmount,
  shipping_address: shippingAddress,
  shipping_method: shippingMethod              // ✅ SIN 'notes'
})
```

---

## 📊 Comparación de Campos

| Campo Anterior | Campo Correcto | Tipo |
|---|---|---|
| `stripe_session_id` | `stripe_checkout_session_id` | String |
| `stripe_payment_intent` | `stripe_payment_intent_id` | String |
| `discount` | `discount_amount` | Decimal |
| `notes` | ❌ REMOVIDO | N/A |

---

## ✅ Estado Actual

- ✅ Webhook de Stripe ahora crea órdenes correctamente
- ✅ No hay error de "notes column not found"
- ✅ Los campos se mapean correctamente

---

## 📧 Sobre los Correos de Cambio de Estado

El código de `update-status.ts` está correcto:
- ✅ Obtiene estado anterior
- ✅ Actualiza a nuevo estado
- ✅ Envía email con cambio de estado
- ✅ No bloquea si falla email

**Nota:** Los correos se enviarán si el estado cambió realmente (`orderBefore?.status !== status`)

---

*Fix implementado: 19 de enero de 2026*
