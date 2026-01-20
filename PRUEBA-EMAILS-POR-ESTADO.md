# 🧪 GUÍA DE PRUEBA - EMAILS POR CADA ESTADO

**Objetivo:** Verificar que cada cambio de estado dispara un email correctamente

---

## ⚙️ Configuración Previa

1. **Servidor corriendo:**
   ```bash
   npm run dev
   # Debe estar en http://localhost:4322/
   ```

2. **Gmail abierto:**
   - Ir a: https://mail.google.com
   - Login en: felixvr2005@gmail.com
   - Tener la bandeja visible

3. **Consola del servidor visible:**
   - Ver logs en tiempo real

---

## 🧪 TEST 1: Pendiente → Confirmado ✅

**Duración:** 2 minutos

### Pasos:
```
1. Abre: http://localhost:4322/admin/pedidos
2. Elige un pedido (por ejemplo: #11550 o #000005)
3. Haz clic en el número del pedido
4. En el formulario de "Cambiar Estado":
   - Selecciona "Confirmado" del dropdown
   - Haz clic en "Actualizar estado"
5. Espera 2 segundos
```

### En la Consola del Servidor (debe ver):
```
✅ [2026-01-19T13:15:00.000Z] Enviando email de cambio de estado para pedido 11550
   Estado anterior: pending → Estado nuevo: confirmed
✅ Email enviado exitosamente a felixvr2005@gmail.com
```

### En Gmail (debe llegar):
- **Asunto:** `Tu pedido #11550 ahora está Confirmado ✅`
- **De:** felixvr2005@gmail.com
- **Contenido:**
  - "¡Hola [Nombre]!"
  - "Pendiente" → "Confirmado"
  - Número de pedido y total
  - Botón: "Ver Detalles del Pedido"

✅ **Resultado esperado:** Email llega en 2-5 segundos

---

## 🧪 TEST 2: Confirmado → En Procesamiento 🔄

**Duración:** 2 minutos

### Pasos:
```
1. Mismo pedido de arriba
2. Actualizar página (F5)
3. El estado ahora debería ser "Confirmado"
4. En el dropdown, selecciona "Procesando"
5. Haz clic en "Actualizar estado"
6. Espera 2 segundos
```

### En la Consola (debe ver):
```
✅ Estado anterior: confirmed → Estado nuevo: processing
✅ Email enviado exitosamente a felixvr2005@gmail.com
```

### En Gmail (debe llegar):
- **Asunto:** `Tu pedido #11550 ahora está En procesamiento 🔄`
- **Emoji:** 🔄 (engranaje)
- **Contenido:** "Confirmado" → "En procesamiento"

✅ **Resultado esperado:** Email llega en 2-5 segundos

---

## 🧪 TEST 3: En Procesamiento → Enviado 📦

**Duración:** 2 minutos

### Pasos:
```
1. Actualizar página
2. Estado ahora es "Procesando"
3. Selecciona "Enviado"
4. Haz clic en "Actualizar estado"
5. Espera 2 segundos
```

### En Gmail (debe llegar):
- **Asunto:** `Tu pedido #11550 ahora está Enviado 📦`
- **Emoji:** 📦 (caja)
- **Contenido:** "En procesamiento" → "Enviado"

✅ **Resultado esperado:** Email llega

---

## 🧪 TEST 4: Enviado → Entregado 🎉

**Duración:** 2 minutos

### Pasos:
```
1. Actualizar página
2. Estado ahora es "Enviado"
3. Selecciona "Entregado"
4. Haz clic en "Actualizar estado"
5. Espera 2 segundos
```

### En Gmail (debe llegar):
- **Asunto:** `¡Tu pedido #11550 ha sido Entregado! 🎉`
- **Emoji:** 🎉 (fuegos artificiales)
- **Contenido:** "Enviado" → "Entregado"

✅ **Resultado esperado:** Email especial celebrando entrega

---

## 🧪 TEST 5: Entregado → Cancelado ❌

**Duración:** 2 minutos

### Pasos:
```
1. Actualizar página
2. Estado ahora es "Entregado"
3. Selecciona "Cancelado"
4. Haz clic en "Actualizar estado"
5. Espera 2 segundos
```

### En Gmail (debe llegar):
- **Asunto:** `Tu pedido #11550 ha sido Cancelado ❌`
- **Emoji:** ❌ (cruz roja)
- **Contenido:** "Entregado" → "Cancelado"

✅ **Resultado esperado:** Email de cancelación

---

## 🧪 TEST 6: Cancelado → Reembolsado 💰

**Duración:** 2 minutos

### Pasos:
```
1. Actualizar página
2. Estado ahora es "Cancelado"
3. Selecciona "Reembolsado"
4. Haz clic en "Actualizar estado"
5. Espera 2 segundos
```

### En Gmail (debe llegar):
- **Asunto:** `Tu pedido #11550 ha sido Reembolsado 💰`
- **Emoji:** 💰 (dinero)
- **Contenido:** "Cancelado" → "Reembolsado"

✅ **Resultado esperado:** Email de reembolso

---

## ✅ CHECKLIST DE RESULTADOS

**Marca cuando completes cada test:**

- [ ] TEST 1: pending → confirmed ✅ (Email recibido)
- [ ] TEST 2: confirmed → processing 🔄 (Email recibido)
- [ ] TEST 3: processing → shipped 📦 (Email recibido)
- [ ] TEST 4: shipped → delivered 🎉 (Email recibido)
- [ ] TEST 5: delivered → cancelled ❌ (Email recibido)
- [ ] TEST 6: cancelled → refunded 💰 (Email recibido)

---

## 🚨 Si No Llega el Email

**Revisar en orden:**

1. **¿Aparece el log en consola?**
   ```
   ✅ Email enviado exitosamente
   ```
   - Sí → Problema en Gmail o SMTP
   - No → Problema en backend

2. **¿El estado realmente cambió?**
   ```
   Si vez: "⚠️ Estado no cambió, email no enviado"
   ```
   - Significa que pusiste el mismo estado dos veces

3. **¿Hay email de cliente?**
   ```
   Si vez: "⚠️ No hay email de cliente"
   ```
   - La orden no tiene customer_email en BD

4. **¿Credenciales SMTP correctas?**
   - `.env.local` debe tener:
   ```
   GMAIL_USER=felixvr2005@gmail.com
   GMAIL_PASSWORD=yglxkxkzrvcmciqq
   ```

5. **¿Server reloaded los cambios?**
   - Deberías ver en consola:
   ```
   [watch] src/pages/api/admin/orders/update-status.ts
   ```

---

## 📊 Tabla Rápida de Referencia

| Test | De | A | Emoji | Esperado |
|------|----|----|-------|----------|
| 1 | Pendiente | Confirmado | ✅ | Email llega |
| 2 | Confirmado | Procesando | 🔄 | Email llega |
| 3 | Procesando | Enviado | 📦 | Email llega |
| 4 | Enviado | Entregado | 🎉 | Email llega |
| 5 | Entregado | Cancelado | ❌ | Email llega |
| 6 | Cancelado | Reembolsado | 💰 | Email llega |

---

## 🎯 Conclusión

Si todos los tests pasan ✅, el sistema está **100% operacional**.

Si falla alguno, verifica los logs en consola y reporta el error específico.

---

*Guía de prueba: 19 de enero de 2026*  
*Sistema: Emails automáticos por estado*  
*Tiempo total de pruebas: ~15 minutos*
