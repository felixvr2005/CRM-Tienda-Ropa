INSTRUCCIONES DE INSTALACIÓN Y CONFIGURACIÓN
============================================

## 🚀 INICIO RÁPIDO

### PASO 1: Instalar Dependencias

```bash
# Ejecutar el script de instalación
./install-email-deps.sh

# O manualmente:
npm install nodemailer
npm install -D @types/nodemailer
```

### PASO 2: Configurar Variables de Entorno

Crea o edita tu archivo `.env.local`:

```
# Gmail Configuration
GMAIL_USER=tu_correo@gmail.com
GMAIL_APP_PASSWORD=<REDACTED - GENERATE APP PASSWORD LOCALLY>

# Admin Configuration
ADMIN_EMAIL=admin@tu-tienda.com
SUPPORT_EMAIL=soporte@tu-tienda.com
COMPANY_NAME=Mi Tienda

# URLs
PUBLIC_URL=http://localhost:3000
```

**IMPORTANTE**: No incluya contraseñas reales en el repositorio. Genere una contraseña de aplicación en Google y configúrela en su `.env.local` o en el secret manager del proveedor de despliegue.

### PASO 3: Verificar Configuración

Accede a: `http://localhost:3000/api/health/email`

Deberías ver:
```json
{
  "status": "ok",
  "message": "✓ Sistema de emails configurado correctamente"
}
```

---

## 📧 ARCHIVOS GENERADOS

### Plantillas de Email
- `src/templates/email-customer.html` - Correo de confirmación para clientes
- `src/templates/email-admin.html` - Reporte para administradores

### Librerías de Funcionalidad
- `src/lib/email.ts` - Funciones para enviar correos
- `src/lib/reports.ts` - Sistema de generación de reportes

### APIs
- `src/pages/api/emails/order-confirmation.ts` - Enviar confirmación
- `src/pages/api/admin/report.ts` - Generar y enviar reportes
- `src/pages/api/admin/export.ts` - Descargar datos

### Panel de Admin
- `src/pages/admin/reports.astro` - Dashboard de reportes

---

## 🎯 CASOS DE USO

### 1. Enviar Confirmación de Pedido al Cliente

```javascript
// En tu ruta de checkout
import { sendCustomerEmail } from '@/lib/email';

await sendCustomerEmail('cliente@email.com', {
    customer_name: "Juan García",
    order_number: "ORD-001",
    order_date: "19 de enero de 2026",
    // ... más datos
});
```

### 2. Enviar Reporte al Administrador

```javascript
// Manual (botón en panel)
POST /api/admin/report
{
    "dateRange": "day",
    "adminEmail": "admin@tienda.com"
}

// O automático (cron job)
import { generateAdminEmailData, sendAdminEmail } from '@/lib/email';

const reportData = await generateAdminEmailData('day');
await sendAdminEmail(process.env.ADMIN_EMAIL, reportData);
```

### 3. Descargar Datos de Reportes

```javascript
// Generar CSV
GET /api/admin/export?dateRange=month&format=csv

// Generar JSON
GET /api/admin/export?dateRange=month&format=json
```

### 4. Acceder al Panel de Reportes

```
http://localhost:3000/admin/reports
```

---

## ⚙️ PERSONALIZACIÓN

### Cambiar Colores de Emails

Edita los gradientes en `src/templates/email-customer.html`:

```css
/* De azul-púrpura a verde-naranja */
background: linear-gradient(135deg, #00d084 0%, #ff6b35 100%);
```

### Agregar Nuevas Secciones

En cualquiera de las plantillas, agrega:

```html
<div class="section">
    <div class="section-title">🎁 Tu Nueva Sección</div>
    <!-- Contenido aquí -->
</div>
```

### Modificar Variables Dinámicas

En `src/lib/email.ts`, actualiza la interface `CustomerEmailData` o `AdminEmailData`:

```typescript
interface CustomData extends CustomerEmailData {
    mi_campo_nuevo: string;
    otro_campo: number;
}
```

---

## 🤖 AUTOMATIZAR ENVÍOS

### Opción 1: Node-Cron (Recomendado)

```bash
npm install node-cron
```

```typescript
// scripts/automated-reports.ts
import cron from 'node-cron';
import { generateAdminEmailData, sendAdminEmail } from '@/lib/email';

// Cada día a las 8:00 AM
cron.schedule('0 8 * * *', async () => {
    const reportData = await generateAdminEmailData('day');
    await sendAdminEmail(process.env.ADMIN_EMAIL, reportData);
});

// Cada lunes a las 9:00 AM (semana)
cron.schedule('0 9 * * 1', async () => {
    const reportData = await generateAdminEmailData('week');
    await sendAdminEmail(process.env.ADMIN_EMAIL, reportData);
});

// Primer día del mes a las 10:00 AM
cron.schedule('0 10 1 * *', async () => {
    const reportData = await generateAdminEmailData('month');
    await sendAdminEmail(process.env.ADMIN_EMAIL, reportData);
});
```

### Opción 2: GitHub Actions

Crea `.github/workflows/daily-report.yml`:

```yaml
name: Daily Report
on:
  schedule:
    - cron: '0 8 * * *'

jobs:
  send-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: npm install
      - run: npm run send-report
        env:
          GMAIL_USER: ${{ secrets.GMAIL_USER }}
          GMAIL_APP_PASSWORD: ${{ secrets.GMAIL_APP_PASSWORD }}
```

### Opción 3: Webhook Externo

```bash
# Llamar desde un servicio externo (Zapier, Make, etc.)
curl -X POST http://tu-sitio.com/api/admin/report \
  -H "Content-Type: application/json" \
  -d '{
    "dateRange": "day",
    "adminEmail": "admin@tienda.com"
  }'
```

---

## 📊 VARIABLES DISPONIBLES

### Para Clientes

| Variable | Descripción |
|----------|-------------|
| `{{customer_name}}` | Nombre del cliente |
| `{{order_number}}` | Número de pedido |
| `{{order_date}}` | Fecha del pedido |
| `{{total_amount}}` | Monto total pagado |
| `{{product_name}}` | Nombre del producto |
| `{{quantity}}` | Cantidad comprada |
| `{{unit_price}}` | Precio unitario |
| `{{discount_amount}}` | Descuento aplicado |
| `{{promo_code}}` | Código promocional |

### Para Administradores

| Variable | Descripción |
|----------|-------------|
| `{{total_orders}}` | Total de pedidos |
| `{{total_revenue}}` | Ingresos totales |
| `{{pending_shipments}}` | Envíos pendientes |
| `{{critical_alerts}}` | Alertas críticas |
| `{{net_profit}}` | Ganancia neta |
| `{{new_customers}}` | Clientes nuevos |
| `{{top_products}}` | Productos más vendidos |

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "No se pueden enviar emails"

**Solución:**
```bash
# Verificar configuración
curl http://localhost:3000/api/health/email

# Revisar .env.local
echo $GMAIL_USER
echo $GMAIL_APP_PASSWORD
```

### Error: "Contraseña de aplicación incorrecta"

**Solución:**
1. Ir a https://myaccount.google.com/apppasswords
2. Seleccionar "Mail" y "Windows"
3. Generar nueva contraseña
4. Copiar sin espacios a GMAIL_APP_PASSWORD

### Error: "No se generan reportes"

**Solución:**
```bash
# Verificar base de datos
# Asegurarse que hay datos en la tabla 'orders'
# Revisar permisos de RLS en Supabase
```

### Error: "Descarga no funciona"

**Solución:**
```bash
# Verificar permisos del navegador
# Probar en modo incógnito
# Revisar console del navegador para errores
```

---

## 📝 ARCHIVOS DE DOCUMENTACIÓN

Consulta estos archivos para más información:

1. **SETUP-CORREOS-REPORTES.md** - Guía completa y detallada
2. **EJEMPLOS-PRACTICOS-CORREOS.ts** - Ejemplos de código listos para usar
3. **Este archivo** - Instrucciones de instalación rápida

---

## ✅ CHECKLIST DE CONFIGURACIÓN

- [ ] Instalar dependencias (npm install nodemailer)
- [ ] Configurar .env.local con credenciales de Gmail
- [ ] Verificar conexión (GET /api/health/email)
- [ ] Crear cuenta de admin
- [ ] Acceder a /admin/reports
- [ ] Enviar reporte de prueba
- [ ] Verificar recepción del correo
- [ ] Descargar datos en CSV
- [ ] Configurar automatización (opcional)
- [ ] Personalizar colores/textos (opcional)

---

## 🎨 PERSONALIZACIÓN AVANZADA

### Cambiar Idioma de Emails

En las plantillas HTML, reemplaza el idioma español con el que desees.

### Agregar Logo de Empresa

En `src/templates/email-customer.html`, añade en el header:

```html
<img src="{{logo_url}}" alt="Logo" style="max-width: 200px;">
```

### Incluir Productos Recomendados

Ya incluido en la plantilla, personaliza en `recommendations`:

```typescript
recommendations: [
    {
        recommendation_title: "Tus Favoritos",
        recommendation_description: "Basado en tu historial de compras..."
    }
]
```

---

## 🚀 PRÓXIMOS PASOS

1. **Integrar con Stripe**: Enviar correos automáticos tras pagos
2. **Crear Dashboard Visual**: Gráficos de ventas en reportes
3. **Alertas Inteligentes**: Notificaciones por SMS/WhatsApp
4. **Reportes Programados**: Recibir reportes en horarios específicos
5. **API Pública**: Permitir integraciones de terceros

---

## 📞 SOPORTE

Si tienes problemas:

1. Consulta SETUP-CORREOS-REPORTES.md
2. Revisa EJEMPLOS-PRACTICOS-CORREOS.ts
3. Verifica la consola para mensajes de error
4. Prueba con /api/health/email

---

**Última actualización**: 19 de enero de 2026
**Versión**: 1.0
**Estado**: ✓ Listo para producción
