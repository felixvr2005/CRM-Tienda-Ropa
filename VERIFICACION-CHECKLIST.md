# VERIFICACIÓN DE CHECKLIST FUNCIONALIDADES

## ✅ ARREGLADO HOY

### 1. **Problema: "NaN €" en totales de pedidos** 
- **Causa:** `total_amount` era null en base de datos
- **Solución:** 
  - ✅ Arreglé display para mostrar "0.00€" si es null
  - ✅ Creé script `scripts/fix-order-totals.ts` para recalcular totales históricos
  - ✅ Endpoint de checkout now guarda correctamente `total_amount`

---

## 📋 CHECKLIST A REVISAR

### 1. **Cambio de contraseña funcional**
- [ ] Verificar: `/cuenta` → "Mi Perfil" → opción cambiar contraseña
- [ ] Debe enviar email con link de confirmación
- [ ] Link debe ser válido y permiter cambiar contraseña

### 2. **POPUP newsletter/descuento**
- [ ] Verificar si existe modal popup
- [ ] Si NO existe → CREAR
- [ ] Debe mostrar al nuevo usuario o después de X segundos
- [ ] Opciones: Newsletter subscription + código descuento

### 3. **Códigos de descuentos funcionales**
- [ ] Ya existe en `/checkout` → input de cupón
- [ ] Cupones válidos (hardcodeados):
  - `WELCOME10` (10% desc)
  - `SAVE20` (20% desc, mín 50€)
  - `ENVIOGRATIS` (free shipping)
- [ ] Verificar si se aplican correctamente

### 4. **Gestión Post-Venta**

#### 4.1 Historial de Pedidos ✅ EXISTE
- [x] `/cuenta/pedidos` → muestra todos los pedidos
- [x] Estados: Pendiente, Confirmado, En proceso, Enviado, Entregado, Cancelado, Reembolsado
- [x] Colores visuales por estado

#### 4.2 Flujo de Cancelación (antes envío)
- [ ] Verificar si hay botón "Cancelar Pedido" en estado "Pendiente"/"Confirmado"
- [ ] Si NO existe → CREAR
- [ ] Al clickear: cambiar estado a CANCELLED + restaurar stock

#### 4.3 Flujo de Devolución (después entrega)
- [ ] Verificar si hay botón "Solicitar Devolución" en estado "Entregado"
- [ ] Si NO existe → CREAR
- [ ] Debe abrir Modal con:
  - Instrucciones de envío (dirección almacén)
  - Confirmación (email con etiqueta)
  - Disclaimer (reembolso en 5-7 días)

---

## 🎯 PRIORIDAD

**CRÍTICA:** 
1. Newsletter popup (NO existe)
2. Botón cancelar pedido (NO existe)
3. Modal devolución (NO existe)

**IMPORTANTE:**
1. Cambio de contraseña (verificar si funciona)
2. Códigos descuento (verificar si aplican)

---

## 🚀 PRÓXIMOS PASOS

1. Revisar `/cuenta` → cambio contraseña
2. Crear newsletter popup component
3. Crear botón cancelar en historial pedidos
4. Crear modal devolución en historial pedidos

