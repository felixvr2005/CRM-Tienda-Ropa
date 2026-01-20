# 🎯 GUÍA DE PRUEBAS - Sistema de Descuentos y Analíticas

## 📍 URLs DE ACCESO

### 🏪 Sitio Principal
- **URL:** `http://localhost:3000`
- **Función:** Tienda normal, acceso a productos y modal newsletter

### 📧 Newsletter con Descuentos
- **Modal:** Aparece en homepage (esquina inferior o popup)
- **Acción:** Ingresa un email y suscríbete
- **Resultado:** Recibirás email con código de descuento 20% en 5-10 segundos

### 🛒 Carrito con Descuentos
- **URL:** `http://localhost:3000/carrito`
- **Función:** Ver carrito y aplicar descuentos
- **Prueba:**
  1. Añade productos a carrito
  2. Ingresa código de descuento (ej: WELCOME42)
  3. Verás el descuento aplicado automáticamente (20%)
  4. Total se recalcula

### 💳 Checkout
- **URL:** `http://localhost:3000/checkout`
- **Integración:** Stripe (modo test)
- **Credenciales Stripe Test:**
  - Tarjeta: `4242 4242 4242 4242`
  - Fecha: Cualquier fecha futura (ej: 12/25)
  - CVC: Cualquier 3 dígitos (ej: 123)

### 📊 Dashboard de Analíticas
- **URL:** `http://localhost:3000/admin/analytics`
- **Acceso:** Solo si eres admin logueado
- **Qué ver:**
  - KPI cards (pedidos, ingresos, ticket promedio, productos)
  - Gráfico líneas: Ingresos últimos 7 días
  - Gráfico barras: Pedidos y productos últimos 7 días
  - Tabla detallada por día

### 👤 Admin Dashboard
- **URL:** `http://localhost:3000/admin`
- **Acceso:** Login requerido
- **Opciones:** Ver pedidos, actualizar estado, envíos

### 📦 Panel de Pedidos
- **URL:** `http://localhost:3000/admin/pedidos`
- **Función:** Ver todos los pedidos
- **Acciones:** Actualizar estado, agregar número de seguimiento

---

## 🧪 PRUEBAS PASO A PASO

### ✅ Prueba 1: Suscripción Newsletter + Descuento

**Paso 1:** Ir a homepage
```
http://localhost:3000
```

**Paso 2:** Buscar modal de newsletter (abajo a la derecha o popup)
- Verás: "Suscríbete a nuestro newsletter"
- Ingresa un email: `prueba@example.com`
- Haz click en "Suscribirse"

**Paso 3:** Revisar email en 10 segundos
- Gmail debería enviar automáticamente
- Asunto: "¡Bienvenido! Tu código de descuento especial"
- En el email verás: Código tipo `WELCOME42`

**Paso 4:** Copiar código de descuento

---

### ✅ Prueba 2: Aplicar Descuento en Carrito

**Paso 1:** Ir a productos
```
http://localhost:3000/productos
```

**Paso 2:** Añadir 2-3 productos al carrito

**Paso 3:** Ir al carrito
```
http://localhost:3000/carrito
```

**Paso 4:** Buscar campo "Código de Descuento"
- Ingresa el código del email (ej: WELCOME42)
- Haz click "Aplicar Descuento"

**Resultado Esperado:**
- Verás: "✓ Código aplicado"
- Total original: €50.00
- Descuento (20%): -€10.00
- **Total final: €40.00**

---

### ✅ Prueba 3: Completar Compra con Descuento

**Paso 1:** Desde carrito, haz click "Ir a Checkout"

**Paso 2:** Se abre Stripe Checkout
- Ingresa email: `cliente@example.com`
- Ingresa tarjeta de prueba: `4242 4242 4242 4242`
- Fecha vencimiento: `12/25`
- CVC: `123`
- Ingresa datos de envío (cualquier dirección)

**Paso 3:** Haz click "Pagar"

**Paso 4:** Espera 2-3 segundos

**Resultado Esperado:**
- Serás redirigido a: `/checkout/success`
- Verás: "✓ Pago completado"
- Número de pedido: Ej: `000001`
- Se creará automáticamente el pedido en BD
- **Gmail enviará email de confirmación** con detalles del pedido

**Verificar Email de Confirmación:**
- Asunto: "Confirmación de Pedido #000001"
- Contenido: Detalles de productos, total, dirección de envío
- Incluye: Link para seguimiento del pedido

---

### ✅ Prueba 4: Ver Dashboard de Analíticas

**Paso 1:** Hacer login como admin
```
http://localhost:3000/admin/login
```

**Paso 2:** Usar credenciales admin:
- Email: `admin@example.com` (o tu email admin)
- Contraseña: Tu contraseña admin

**Paso 3:** Ir a analíticas
```
http://localhost:3000/admin/analytics
```

**Qué Verás:**

**Tarjetas KPI (arriba):**
```
┌─────────────────────────┬──────────────────────┐
│ Pedidos: 1              │ Ingresos: €40.00     │
│ Últimos 7 días          │ Total vendido        │
├─────────────────────────┼──────────────────────┤
│ Promedio/Pedido: €40.00 │ Productos: 2         │
│ Ticket promedio         │ Unidades vendidas    │
└─────────────────────────┴──────────────────────┘
```

**Gráficos:**
- Línea: Mostrará ingresos de hoy
- Barras: Mostrará 1 pedido y 2 productos hoy

**Tabla Detallada:**
| Fecha | Pedidos | Ingresos | Productos | Descuentos | Envío |
|-------|---------|----------|-----------|-----------|-------|
| Hoy   | 1       | €40.00   | 2         | €10.00    | €5.95 |

---

### ✅ Prueba 5: Múltiples Pedidos para Ver Gráficos

**Paso 1:** Repetir Prueba 3 (Completar Compra) 3-4 veces
- Usa emails diferentes: `cliente1@example.com`, `cliente2@example.com`, etc.
- Usa descuentos diferentes o sin descuento

**Paso 2:** Ir a Analytics
```
http://localhost:3000/admin/analytics
```

**Resultado Esperado:**
- KPIs actualizados: 3-4 pedidos, suma de ingresos
- Gráfico líneas: Línea creciente de ingresos
- Gráfico barras: Múltiples barras de pedidos/productos
- Tabla: Múltiples filas con datos de hoy

---

## 📋 CHECKLIST DE FUNCIONALIDADES

### Newsletter y Descuentos:
- [ ] Modal de newsletter aparece en homepage
- [ ] Email de bienvenida llega al suscribirse
- [ ] Email contiene código de descuento (WELCOME + números)
- [ ] Código se puede usar en carrito
- [ ] Descuento se aplica correctamente (20%)
- [ ] Total se recalcula con descuento
- [ ] Descuento se envía a Stripe correctamente
- [ ] No se puede usar el mismo código dos veces

### Pagos y Órdenes:
- [ ] Checkout de Stripe funciona
- [ ] Precios se calculan correctamente (con descuento)
- [ ] Tarjeta de prueba es aceptada
- [ ] Página de éxito se muestra
- [ ] Número de pedido se genera
- [ ] Email de confirmación llega

### Analytics:
- [ ] Dashboard carga `/admin/analytics`
- [ ] KPI cards muestran números correctos
- [ ] Gráfico de líneas muestra ingresos
- [ ] Gráfico de barras muestra pedidos/productos
- [ ] Tabla muestra detalles diarios
- [ ] Datos se actualizan después de nuevos pedidos

### Correos:
- [ ] Email newsletter llega (5-10 seg)
- [ ] Email confirmación pedido llega (2-3 seg)
- [ ] Formato HTML es profesional
- [ ] Código de descuento está visible
- [ ] Datos de pedido son correctos

---

## 🔧 TROUBLESHOOTING

### Emails no llegan
**Verificar:**
1. Variables de entorno (.env.local):
   ```
   GMAIL_USER=tu-email@gmail.com
   GMAIL_APP_PASSWORD=contraseña-16-caracteres
   ```
2. Revisar carpeta de spam en Gmail
3. Ver logs en terminal: `npm run dev`

### Dashboard no carga
**Verificar:**
1. Estás logueado como admin
2. La BD tiene datos (al menos 1 pedido)
3. URL es correcta: `http://localhost:3000/admin/analytics`
4. Revisar consola del navegador (F12)

### Descuento no se aplica
**Verificar:**
1. Código está correcto (sensible a mayúsculas)
2. No fue usado antes
3. Usuario está suscrito al newsletter
4. Revisar BD: tabla `newsletter_subscribers`

### Precios incorrectos
**Verificar:**
1. Precios en DB están en centavos (1275 = €12.75)
2. UI divide por 100
3. Stripe multiplica por 100
4. Descuentos se restan antes de enviar a Stripe

---

## 💡 COMANDOS ÚTILES

### Iniciar desarrollo:
```bash
npm run dev
```

### Ver logs en tiempo real:
```bash
# En otra terminal mientras npm run dev está corriendo
tail -f logs/app.log
```

### Revisar BD (Supabase):
```
1. Ir a https://app.supabase.com
2. Login con tu cuenta
3. Ir a tu proyecto
4. Ver tablas en left sidebar
5. Buscar: orders, newsletter_subscribers, order_items
```

### Ver email en Gmail:
```
1. Ir a https://mail.google.com
2. Buscar por remitente o asunto
3. Revisar spam si no aparece en Inbox
```

---

## 📞 SOPORTE RÁPIDO

Si algo no funciona:

1. **Revisa la terminal** de `npm run dev` - Los errores aparecen ahí
2. **Revisa F12 en navegador** - Console tab
3. **Revisa BD** - Supabase dashboard
4. **Revisa Gmail** - Carpeta spam
5. **Commit reciente:** `git log --oneline` muestra cambios implementados

---

## 🎉 ¡LISTO!

Todo está funcional. Solo necesitas:
1. Variables de entorno configuradas (Gmail)
2. `npm run dev` ejecutándose
3. Seguir los pasos de prueba anterior

¡Prueba todo y disfruta del sistema! 🚀

