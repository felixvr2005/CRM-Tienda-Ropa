# 📧 ARQUITECTURA DE CORREOS - Sistema Completo

## 🔄 Flujo General de Correos

```
┌─────────────────────────────────────────────────────────────────┐
│                     USUARIO REALIZA ACCIÓN                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │                                         │
        ↓                                         ↓
    ┌─────────────────────┐         ┌──────────────────────┐
    │ Se suscribe a       │         │ Completa compra      │
    │ Newsletter          │         │ (Pago exitoso)       │
    └─────────────────────┘         └──────────────────────┘
        ↓                                     ↓
    Genera código                      Sistema crea
    descuento único                     Pedido automático
        ↓                                     ↓
    Guardar en BD              ┌─────────────────────────┐
    newsletter_subscribers     │ Procesa línea de items  │
        ↓                      │ Calcula totales         │
    API envía email            │ Genera número pedido    │
    con código                 └─────────────────────────┘
                                       ↓
                                 Enviar Email
                              (Confirmación)
```

---

## 1️⃣ EMAIL DE NEWSLETTER (Bienvenida + Descuento)

### 📤 Flujo Completo:

```
Usuario suscribe email
    ↓
API: POST /api/newsletter/subscribe
    ↓
1. Valida email (formato correcto)
    ├─ Si inválido → Responde error 400
    └─ Si válido → Continúa
    ↓
2. Genera código descuento
    ├─ Formato: WELCOME + 2 dígitos aleatorios
    ├─ Ejemplo: WELCOME42
    └─ Único por email (no repetir)
    ↓
3. Guarda en BD (Supabase)
    ├─ Tabla: newsletter_subscribers
    ├─ Campos: email, discount_code, subscribed_at, used
    └─ onConflict: Si ya existe, actualizar código
    ↓
4. Envía email con Gmail
    ├─ Desde: GMAIL_USER
    ├─ Para: Email del usuario
    ├─ Asunto: "¡Bienvenido! Tu código de descuento..."
    ├─ Template: HTML profesional con código destacado
    └─ Timeout: ~5-10 segundos
    ↓
5. Responde al cliente
    ├─ Status: 200 OK
    ├─ Mensaje: "Suscripción exitosa - Email enviado"
    └─ Incluye: código (para debuggear)
```

### 📝 Ejemplo de Email Enviado:

```html
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  ¡Bienvenido a Fashion Store!                        ║
║  Tu código de descuento especial te espera           ║
║                                                        ║
║  ────────────────────────────────────────────         ║
║                                                        ║
║  Hola,                                                ║
║                                                        ║
║  Gracias por suscribirte a nuestro newsletter.       ║
║                                                        ║
║  Como regalo especial, te ofrecemos un               ║
║  20% DE DESCUENTO en tu próxima compra               ║
║  usando el siguiente código:                         ║
║                                                        ║
║  ┌──────────────┐                                    ║
║  │  WELCOME42   │  ← Código único                    ║
║  └──────────────┘                                    ║
║                                                        ║
║  No tiene fecha de vencimiento.                      ║
║                                                        ║
║  [Botón] Explora nuestros productos                 ║
║                                                        ║
║  ────────────────────────────────────────────         ║
║                                                        ║
║  ¿Qué esperar de nosotros?                           ║
║  • Promociones exclusivas                            ║
║  • Nuevas colecciones                                ║
║  • Consejos de moda                                  ║
║  • Ofertas en cumpleaños                             ║
║                                                        ║
║  Fashion Store - Tu tienda de moda online            ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

### 🔧 Implementación Técnica:

**Archivo:** `src/pages/api/newsletter/subscribe.ts`

```typescript
// 1. Transporter de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,      // ← Tu email Gmail
    pass: process.env.GMAIL_APP_PASSWORD  // ← Contraseña app 16 caracteres
  }
});

// 2. Función para enviar email
async function sendNewsletterWelcomeEmail(email: string, discountCode: string) {
  // Construir HTML
  const htmlContent = `...HTML profesional...`;
  
  // Enviar
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,                    // Email del suscriptor
    subject: '¡Bienvenido! Tu código de descuento...',
    html: htmlContent
  });
}

// 3. Endpoint POST
export async function POST({ request }: any) {
  const { email } = await request.json();
  
  // Generar código
  const discountCode = `WELCOME${Math.floor(Math.random() * 90) + 10}`;
  
  // Guardar en BD
  await supabaseAdmin
    .from('newsletter_subscribers')
    .upsert({ email, discount_code: discountCode, subscribed_at: new Date() });
  
  // Enviar email
  await sendNewsletterWelcomeEmail(email, discountCode);
  
  // Responder
  return Response.json({ 
    message: 'Suscripción exitosa - Email enviado',
    code: discountCode 
  });
}
```

### ✅ Validaciones:
- ✓ Email tiene formato correcto
- ✓ No es email duplicado (se actualiza si existe)
- ✓ Gmail está configurado
- ✓ Código no está vacío

---

## 2️⃣ EMAIL DE CONFIRMACIÓN DE PEDIDO

### 📤 Flujo Completo:

```
Usuario completa pago en Stripe
    ↓
Stripe procesa pago exitosamente
    ↓
Usuario redirigido a /checkout/success?session_id=...
    ↓
SSR ejecuta en servidor
    ├─ GET session_id de URL
    └─ Verifica si ya procesado (prevenir duplicados)
    ↓
Stripe API: retrieve session
    ├─ Expande: line_items (detalles productos)
    ├─ Verifica: payment_status === 'paid'
    └─ Obtiene: items, email, dirección, monto total
    ↓
Crear pedido en BD
    ├─ Tabla: orders
    ├─ Campos: order_number, customer_id, items, total_amount, etc.
    ├─ Generar número secuencial (000001, 000002, etc.)
    └─ Status inicial: 'pending'
    ↓
Crear items del pedido
    ├─ Tabla: order_items (uno por producto)
    ├─ Campos: product_id, quantity, price, size, color, etc.
    └─ Guardar detalles de cada artículo
    ↓
ENVIAR EMAIL AL CLIENTE
    ├─ Función: sendCustomerEmail()
    ├─ Template: src/templates/email-customer.html
    ├─ Datos: Número pedido, productos, total, dirección
    ├─ Gmail: envía desde GMAIL_USER
    ├─ Para: email del cliente
    └─ Timeout: ~2-3 segundos
    ↓
Responder al usuario
    ├─ Mostrar: "Pedido completado"
    ├─ Número: #000001
    ├─ Mensaje: "Email de confirmación enviado"
    └─ Botón: "Ver estado del pedido"
```

### 📝 Ejemplo de Email Enviado:

```html
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  CONFIRMACIÓN DE PEDIDO #000001                          ║
║  Fashion Store                                           ║
║                                                           ║
║  ───────────────────────────────────────────             ║
║                                                           ║
║  Hola Juan García,                                       ║
║                                                           ║
║  Agradecemos tu compra. Tu pedido ha sido recibido      ║
║  y está siendo procesado.                               ║
║                                                           ║
║  NÚMERO DE PEDIDO: #000001                              ║
║  FECHA: 13 de Enero de 2026                             ║
║  ESTADO: Pendiente de envío                             ║
║                                                           ║
║  ───────────────────────────────────────────             ║
║                                                           ║
║  DETALLES DE TU COMPRA:                                 ║
║                                                           ║
║  • Vestido Negro Elegante                               ║
║    Cantidad: 1 | Talla: M | Color: Negro               ║
║    Precio: €49.99                                       ║
║                                                           ║
║  • Zapatillas Deportivas                                ║
║    Cantidad: 1 | Talla: 38 | Color: Blanco             ║
║    Precio: €79.99                                       ║
║                                                           ║
║  ───────────────────────────────────────────             ║
║                                                           ║
║  Subtotal: €129.98                                      ║
║  Descuento (20%): -€26.00                               ║
║  Envío: €5.95                                           ║
║  ────────────────────────                               ║
║  TOTAL: €109.93                                         ║
║                                                           ║
║  ───────────────────────────────────────────             ║
║                                                           ║
║  DIRECCIÓN DE ENVÍO:                                    ║
║  Juan García                                            ║
║  Calle Principal 123                                    ║
║  28001 Madrid, España                                   ║
║                                                           ║
║  ───────────────────────────────────────────             ║
║                                                           ║
║  [Botón] SEGUIR ESTADO DEL PEDIDO                      ║
║                                                           ║
║  ¿Preguntas? Contacta: soporte@tienda.com              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### 🔧 Implementación Técnica:

**Archivo:** `src/pages/checkout/success.astro`

```typescript
import { sendCustomerEmail } from '@lib/email';

// Cuando pago es exitoso (payment_status === 'paid'):

// Preparar datos del email
const emailData: CustomerEmailData = {
  customer_name: shippingAddress?.name,
  order_number: orderNumber,
  order_date: new Date().toLocaleDateString('es-ES'),
  order_status: 'Pendiente',
  payment_method: 'Tarjeta de Crédito (Stripe)',
  products: items.map((item: any) => ({
    product_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity
  })),
  subtotal: subtotal,
  shipping_cost: shippingCost,
  discount_amount: discountAmount,
  total_amount: totalAmount,
  track_order_url: `${Astro.site}/cuenta/pedidos/${orderNumber}`,
  // ... más campos
};

// Enviar email
const emailResult = await sendCustomerEmail(email, emailData);
console.log(`✅ Email enviado: ${emailResult.messageId}`);
```

**Archivo:** `src/lib/email.ts`

```typescript
export const sendCustomerEmail = async (
  customerEmail: string,
  data: CustomerEmailData
) => {
  const transporter = createEmailTransport(); // Gmail configured
  const template = loadTemplate('email-customer'); // HTML template
  const html = renderTemplate(template, data);    // Replace variables

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: customerEmail,
    subject: `Confirmación de Pedido #${data.order_number}`,
    html,
    replyTo: data.support_email,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
};
```

### ✅ Validaciones:
- ✓ Pago está confirmado (payment_status === 'paid')
- ✓ Email del cliente no vacío
- ✓ Productos tienen información completa
- ✓ Totales se calculan correctamente
- ✓ No se envía email duplicado (verifica si ya existe pedido)

---

## 3️⃣ EMAIL DE ACTUALIZACIÓN DE ESTADO DE PEDIDO

### 📤 Flujo Completo:

```
Admin actualiza estado en panel (/admin/pedidos/[orderNumber])
    ↓
Usuario hace click en botón "Actualizar Estado"
    ↓
Envía fetch request a /api/admin/orders/update-status
    ├─ Datos: { orderNumber, newStatus }
    └─ Content-Type: application/json
    ↓
API procesa:
    ├─ Busca pedido en BD
    ├─ Valida nuevo estado (pending, processing, shipped, delivered, returned, refunded)
    ├─ Actualiza status en tabla orders
    └─ Obtiene email del cliente
    ↓
ENVIAR EMAIL AL CLIENTE
    ├─ Template: Específico para nuevo estado
    ├─ Ejemplos:
    │  ├─ shipped: "Tu pedido está en camino"
    │  ├─ delivered: "Tu pedido ha sido entregado"
    │  └─ refunded: "Tu reembolso ha sido procesado"
    ├─ Gmail: envía desde GMAIL_USER
    ├─ Para: email del cliente guardado
    └─ Timeout: ~2-3 segundos
    ↓
Responder al admin
    ├─ Status: 200 OK
    ├─ Mensaje: "Pedido actualizado + Email enviado"
    └─ Actualizar UI en tiempo real
```

### 📝 Ejemplo de Email (Estado: SHIPPED):

```html
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ¡TU PEDIDO ESTÁ EN CAMINO! 📦                           ║
║  Pedido #000001                                          ║
║                                                           ║
║  ───────────────────────────────────────────             ║
║                                                           ║
║  Hola Juan García,                                       ║
║                                                           ║
║  ¡Buenas noticias! Tu pedido ha sido enviado y está    ║
║  en camino hacia tu domicilio.                          ║
║                                                           ║
║  NÚMERO DE SEGUIMIENTO:                                 ║
║  ES1234567890                                           ║
║                                                           ║
║  📍 RASTREAR ENVÍO:                                     ║
║  https://track.correos.es/ES1234567890                 ║
║                                                           ║
║  ───────────────────────────────────────────             ║
║                                                           ║
║  TIEMPO ESTIMADO DE ENTREGA:                            ║
║  2-3 días laborales                                      ║
║                                                           ║
║  DIRECCIÓN DE ENTREGA:                                  ║
║  Juan García                                            ║
║  Calle Principal 123                                    ║
║  28001 Madrid, España                                   ║
║                                                           ║
║  ───────────────────────────────────────────             ║
║                                                           ║
║  [Botón] VER DETALLES DEL ENVÍO                        ║
║  [Botón] RASTREAR PAQUETE                              ║
║                                                           ║
║  ¿Dudas? Contacta: soporte@tienda.com                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### 🔧 Implementación Técnica:

**Archivo:** `src/pages/api/admin/orders/update-status.ts`

```typescript
export async function POST({ request }: any) {
  const { orderNumber, newStatus } = await request.json();
  
  // 1. Actualizar BD
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .update({ status: newStatus })
    .eq('order_number', orderNumber)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  
  // 2. Preparar email personalizado por estado
  let subject = '';
  let template = '';
  
  if (newStatus === 'shipped') {
    subject = '¡Tu pedido está en camino!';
    template = 'email-shipped';
  } else if (newStatus === 'delivered') {
    subject = '¡Tu pedido ha sido entregado!';
    template = 'email-delivered';
  }
  
  // 3. Enviar email
  const transporter = createEmailTransport();
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: order.customer_email,
    subject: subject,
    html: `...template HTML...`
  });
  
  return Response.json({ success: true });
}
```

---

## 🔐 Configuración de Gmail

### Pasos para Obtener Credenciales:

1. **Cuenta Gmail:**
   - Crear o usar: tu@gmail.com
   - Habilitar autenticación 2FA

2. **Generar App Password:**
   ```
   1. Ir a: https://myaccount.google.com/apppasswords
   2. Seleccionar: Mail / Windows Computer (o Android Phone)
   3. Generar contraseña (16 caracteres)
   4. Copiar contraseña generada
   ```

3. **Variables de Entorno (.env.local):**
   ```bash
   GMAIL_USER=tu-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  # 16 caracteres generados
   ```

### Verificar Configuración:

```bash
# Test desde terminal
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error:', error);
  } else {
    console.log('✅ Gmail configurado correctamente');
  }
});
"
```

---

## 📊 Base de Datos - Tabla newsletter_subscribers

### Estructura:
```sql
CREATE TABLE newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  discount_code VARCHAR(50) UNIQUE,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Datos de Ejemplo:
```
email                | discount_code | used | used_at
─────────────────────┼───────────────┼──────┼─────────────────────
prueba@example.com   | WELCOME42     | true | 2026-01-13 10:30
cliente@gmail.com    | WELCOME87     | false| NULL
user@yahoo.com       | WELCOME21     | false| NULL
```

---

## 🔄 Sincronización de Descuentos

```
Newsletter Signup
    ↓
Código guardado en: newsletter_subscribers.discount_code
    ↓
Usuario aplica en carrito
    ↓
API /coupons/validate busca código en BD
    ↓
Verifica:
  ├─ Email suscrito (existe en newsletter_subscribers)
  ├─ Código coincide (discount_code)
  ├─ No fue usado (used = FALSE)
  └─ Descuento: 20% (fijo en newsletter)
    ↓
Si válido:
  ├─ Calcula descuento: total * 0.20
  ├─ Muestra en carrito
  └─ Marca como "aplicado" (no en BD aún)
    ↓
En checkout:
  ├─ Envía discountAmount a Stripe
  ├─ Stripe crea cupón temporal
  └─ Aplica en monto final
    ↓
Después de pago exitoso:
  ├─ Marca en BD: used = TRUE, used_at = NOW()
  ├─ Guarda en order: discount_code, discount_amount
  └─ No se puede reutilizar (next time: "Código ya usado")
```

---

## ✅ CHECKLIST DE CORREOS

### Newsletter:
- [ ] API `/api/newsletter/subscribe` funciona
- [ ] Código se genera único (WELCOME + dígitos)
- [ ] Código se guarda en BD
- [ ] Email se envía a Gmail (5-10 seg)
- [ ] Template HTML se ve profesional
- [ ] Código está destacado en email
- [ ] No hay errores en logs

### Confirmación de Pedido:
- [ ] API `/checkout/success` procesa pago
- [ ] Pedido se crea en BD
- [ ] Email se envía a cliente (2-3 seg)
- [ ] Email contiene todos los detalles
- [ ] Número de pedido es correcto
- [ ] Totales son correctos (con descuento)
- [ ] Dirección de envío es correcta

### Actualización de Estado:
- [ ] Admin puede cambiar estado en `/admin/pedidos/[orderNumber]`
- [ ] Botones usan fetch (no form POST)
- [ ] API `/api/admin/orders/update-status` funciona
- [ ] Email se envía al cambiar estado
- [ ] Email menciona nuevo estado
- [ ] Cliente recibe notificación (2-3 seg)

---

## 🎉 Todo Integrado

La arquitectura de correos está completamente integrada en el sistema:

1. **Newsletter** → Genera descuentos → Envía emails
2. **Carrito** → Valida descuentos → Aplica descuento
3. **Checkout** → Procesa pago → Crea pedido → **Envía confirmación**
4. **Admin Panel** → Actualiza estado → **Notifica al cliente**

**Todo automatizado y funcional.** ✨

