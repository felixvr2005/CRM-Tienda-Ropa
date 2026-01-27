// Documentación y Guía de Implementación - Sistema de Correos y Reportes
// ===================================================================

/**
 * GUÍA COMPLETA: SISTEMA DE CORREOS Y REPORTES
 * 
 * Este documento describe cómo implementar y usar el sistema de correos
 * profesionales para clientes y administradores, junto con el panel de reportes.
 */

// =======================
// 1. CONFIGURACIÓN INICIAL
// =======================

/*
PASO 1: Configurar variables de entorno en .env.local

```
# Gmail
GMAIL_USER=tu_correo@gmail.com
GMAIL_APP_PASSWORD=<REDACTED - GENERATE APP PASSWORD LOCALLY>

# Configuración General
ADMIN_EMAIL=admin@tu-tienda.com
COMPANY_NAME=Mi Tienda de Ropa
PUBLIC_URL=https://tu-sitio.com
```

IMPORTANTE:
- Use una contraseña de aplicación de Gmail (16 caracteres, sin espacios).
- No compartir ni commitear la contraseña: configúrela en su entorno local o en el secret manager del proveedor.
- Active "Verificación en 2 pasos" en Google y genere la contraseña en: https://myaccount.google.com/apppasswords
- Generar una nueva contraseña de aplicación en: https://myaccount.google.com/apppasswords
*/

// ====================================
// 2. ESTRUCTURA DE ARCHIVOS CREADOS
// ====================================

/*
src/
├── templates/
│   ├── email-customer.html          ← Plantilla para clientes
│   └── email-admin.html              ← Plantilla para administradores
├── lib/
│   ├── email.ts                      ← Servicios de envío de correos
│   └── reports.ts                    ← Sistema de generación de reportes
├── pages/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── report.ts             ← API para enviar reportes
│   │   │   └── export.ts             ← API para descargar datos
│   │   └── emails/
│   │       └── order-confirmation.ts ← API para confirmación de pedidos
│   └── admin/
│       └── reports.astro             ← Panel de administración de reportes
*/

// ====================================
// 3. USO: ENVIAR CORREO A CLIENTE
// ====================================

/*
EJEMPLO: Enviar confirmación de pedido a cliente

import { sendCustomerEmail } from '@/lib/email';
import type { CustomerEmailData } from '@/lib/email';

const customerData: CustomerEmailData = {
    customer_name: "Juan García",
    order_number: "ORD-2026-001234",
    order_date: "19 de enero de 2026",
    order_status: "Confirmado",
    payment_method: "Tarjeta de Crédito",
    products: [
        {
            product_name: "Camiseta Premium",
            product_sku: "CAM-001",
            quantity: 2,
            unit: "pzas",
            unit_price: 29.99,
            total_price: 59.98
        }
    ],
    subtotal: 59.98,
    tax_rate: 16,
    tax_amount: 9.60,
    shipping_cost: 10.00,
    total_amount: 79.58,
    active_offers: [
        {
            discount_percentage: 20,
            offer_title: "20% en Categor. Seleccionadas",
            offer_code: "VERANO20"
        }
    ],
    recommendations: [
        {
            recommendation_title: "Pantalones Complementarios",
            recommendation_description: "Según tu compra de camisetas, te recomendamos estos pantalones"
        }
    ],
    promo_code_available: true,
    promo_code: "CLIENTE2026",
    promo_description: "10% descuento en tu próxima compra",
    track_order_url: "https://tu-sitio.com/track/ORD-2026-001234",
    continue_shopping_url: "https://tu-sitio.com/shop",
    customer_address: "Calle Principal 123, Ciudad, País",
    support_email: "soporte@tu-tienda.com",
    facebook_url: "https://facebook.com/tu-tienda",
    instagram_url: "https://instagram.com/tu-tienda",
    twitter_url: "https://twitter.com/tu-tienda",
    company_name: "Mi Tienda",
    current_year: 2026
};

// Enviar correo
await sendCustomerEmail("cliente@example.com", customerData);
*/

// ====================================
// 4. USO: ENVIAR REPORTE A ADMIN
// ====================================

/*
EJEMPLO: Generar y enviar reporte diario a administrador

import { generateAdminEmailData, sendAdminEmail } from '@/lib/email';
import { sendAdminEmail } from '@/lib/email';

// Generar datos del reporte (día, semana, mes, año)
const reportData = await generateAdminEmailData('day');

// Enviar reporte
await sendAdminEmail("admin@tu-tienda.com", reportData);

PERÍODOS SOPORTADOS:
- 'day'    → Reporte diario
- 'week'   → Reporte semanal
- 'month'  → Reporte mensual
- 'year'   → Reporte anual
- 'custom' → Rango personalizado (requiere startDate y endDate)
*/

// ====================================
// 5. API ENDPOINTS
// ====================================

/*
POST /api/admin/report
- Enviar reporte a correo de administrador
- Body: { dateRange: "day|week|month|year|custom", adminEmail: "...", startDate?: "...", endDate?: "..." }
- Response: { success: true, messageId: "..." }

GET /api/admin/report
- Obtener datos del reporte sin enviar (preview)
- Query: ?dateRange=month&startDate=2026-01-01&endDate=2026-01-31
- Response: { report_period: "...", total_orders: 42, total_revenue: 5234.50, ... }

GET /api/admin/export
- Descargar datos en CSV, JSON o Excel
- Query: ?dateRange=month&format=csv
- Response: Archivo descargado (CSV, JSON)

POST /api/emails/order-confirmation
- Enviar correo de confirmación a cliente
- Body: { customerEmail: "...", orderData: {...} }
- Response: { success: true, messageId: "..." }
*/

// ====================================
// 6. USANDO EL PANEL DE REPORTES
// ====================================

/*
ACCESO: /admin/reports

CARACTERÍSTICAS:
1. Generar y Enviar Reportes
   - Selecciona período (día, semana, mes, año, personalizado)
   - Ingresa tu correo
   - Haz clic en "Enviar Reporte"
   - Recibirás el reporte por correo

2. Vista Previa
   - Haz clic en "Vista Previa"
   - Verás los datos del reporte en formato JSON
   - Útil para verificar datos antes de enviar

3. Descargar Datos
   - Selecciona período
   - Elige formato (CSV o JSON)
   - Haz clic en "Descargar Datos"
   - Se descargará automáticamente un archivo

4. Historial de Reportes
   - Los reportes recientes aparecerán aquí
   - Puedes resend-iarlos o descargarlos nuevamente
*/

// ====================================
// 7. VARIABLES DINÁMICAS EN PLANTILLAS
// ====================================

/*
PLANTILLA DE CLIENTE (email-customer.html):
- {{customer_name}}              Nombre del cliente
- {{order_number}}               Número de pedido
- {{order_date}}                 Fecha del pedido
- {{order_status}}               Estado del pedido
- {{payment_method}}             Método de pago
- {{product_name}}               Nombre del producto
- {{quantity}}                   Cantidad
- {{unit_price}}                 Precio unitario
- {{total_price}}                Precio total
- {{subtotal}}                   Subtotal
- {{tax_rate}}                   Porcentaje de impuesto
- {{tax_amount}}                 Monto de impuesto
- {{shipping_cost}}              Costo de envío
- {{total_amount}}               Total pagado
- {{discount_code}}              Código de descuento
- {{discount_amount}}            Monto de descuento
- {{promo_code}}                 Código promocional exclusivo
- {{track_order_url}}            URL para rastrear pedido
- {{continue_shopping_url}}      URL para seguir comprando

PLANTILLA DE ADMIN (email-admin.html):
- {{report_period}}              Tipo de reporte (Diario, Semanal, etc.)
- {{date_range}}                 Rango de fechas
- {{total_orders}}               Total de pedidos
- {{total_revenue}}              Ingresos totales
- {{pending_shipments}}          Envíos pendientes
- {{critical_alerts}}            Número de alertas críticas
- {{gross_revenue}}              Ingresos brutos
- {{net_profit}}                 Ganancia neta
- {{average_order_value}}        Ticket promedio
- {{new_customers}}              Clientes nuevos
*/

// ====================================
// 8. AUTOMATIZAR ENVÍO DE REPORTES
// ====================================

/*
OPCIÓN 1: Cron Job (Recomendado)

// En tu servidor o servicio de cron (ej: node-cron)
import cron from 'node-cron';
import { generateAdminEmailData, sendAdminEmail } from '@/lib/email';

// Enviar reporte diario a las 8:00 AM
cron.schedule('0 8 * * *', async () => {
    try {
        const reportData = await generateAdminEmailData('day');
        await sendAdminEmail(process.env.ADMIN_EMAIL!, reportData);
        console.log('✓ Reporte diario enviado');
    } catch (error) {
        console.error('✗ Error enviando reporte diario:', error);
    }
});

// Enviar reporte semanal cada lunes a las 9:00 AM
cron.schedule('0 9 * * 1', async () => {
    try {
        const reportData = await generateAdminEmailData('week');
        await sendAdminEmail(process.env.ADMIN_EMAIL!, reportData);
        console.log('✓ Reporte semanal enviado');
    } catch (error) {
        console.error('✗ Error enviando reporte semanal:', error);
    }
});

// Enviar reporte mensual el primer día del mes a las 10:00 AM
cron.schedule('0 10 1 * *', async () => {
    try {
        const reportData = await generateAdminEmailData('month');
        await sendAdminEmail(process.env.ADMIN_EMAIL!, reportData);
        console.log('✓ Reporte mensual enviado');
    } catch (error) {
        console.error('✗ Error enviando reporte mensual:', error);
    }
});

OPCIÓN 2: Webhooks/Disparadores
- Configura acciones que envíen reportes automáticamente
- Después de cada venta (correo a cliente)
- Cuando alcancen ciertos hitos de ventas
*/

// ====================================
// 9. PERSONALIZACIÓN DE PLANTILLAS
// ====================================

/*
Para modificar los estilos y colores de los correos:

1. Edita src/templates/email-customer.html
   - Cambiar colores gradientes: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
   - Modificar fuentes en <style>
   - Ajustar tamaños y espaciados

2. Edita src/templates/email-admin.html
   - Similar a arriba
   - Personalizar según preferencias de branding

3. Mantén la estructura de variables {{variable}}
   - Esto asegura que funcionen con el sistema de templating
*/

// ====================================
// 10. SOLUCIÓN DE PROBLEMAS
// ====================================

/*
PROBLEMA: "Error verificando conexión de email"
SOLUCIÓN:
- Verifica GMAIL_USER y GMAIL_APP_PASSWORD en .env.local
- Asegúrate que la contraseña tiene 16 caracteres (sin espacios)
- Verifica que el correo tiene 2FA habilitado
- Genera una nueva contraseña de aplicación

PROBLEMA: "No se envían los correos"
SOLUCIÓN:
- Revisa la consola del servidor para errores específicos
- Verifica que las rutas API estén correctas
- Comprueba que Supabase está configurado correctamente
- Verifica permisos de RLS en tablas de Supabase

PROBLEMA: "Las variables no se reemplazan en el correo"
SOLUCIÓN:
- Asegúrate de usar el formato {{variable}} exacto
- Verifica que los nombres coincidan con los del objeto de datos
- Para arrays, usa {{#array}} ... {{/array}}
- Para condicionales, usa {{#boolean}} ... {{/boolean}}

PROBLEMA: "Descarga no funciona"
SOLUCIÓN:
- Verifica que el navegador permita descargas
- Comprueba el formato seleccionado (csv o json)
- Revisa la consola para errores de red
*/

// ====================================
// 11. EJEMPLOS DE INTEGRACIÓN
// ====================================

/*
EJEMPLO: Enviar correo cuando se completa un pedido

// En tu componente o ruta de pedido
import { sendCustomerEmail } from '@/lib/email';

async function handleOrderCompletion(orderId: string) {
    // Obtener datos del pedido desde BD
    const orderData = await fetchOrderData(orderId);
    
    // Preparar datos para email
    const emailData = {
        customer_name: orderData.customer.name,
        order_number: orderData.order_number,
        // ... más datos
    };
    
    // Enviar correo
    await sendCustomerEmail(orderData.customer.email, emailData);
}

EJEMPLO: Enviar reporte semanal personalizado

// En una ruta API
export const POST: APIRoute = async ({ request }) => {
    const { startDate, endDate, adminEmail } = await request.json();
    
    const reportData = await generateAdminEmailData(
        'custom',
        new Date(startDate),
        new Date(endDate)
    );
    
    await sendAdminEmail(adminEmail, reportData);
    
    return new Response(JSON.stringify({ success: true }));
};
*/

// ====================================
// 12. TESTING Y VALIDACIÓN
// ====================================

/*
Verificar la configuración:

1. Prueba de conexión SMTP:
   - Accede a http://tu-sitio/api/admin/test-email
   - Debe responder: { success: true }

2. Prueba de preview de reporte:
   - GET /api/admin/report?dateRange=day
   - Debe devolver JSON con estructura de reporte

3. Prueba de descarga:
   - GET /api/admin/export?dateRange=month&format=csv
   - Debe iniciar descarga automáticamente

4. Prueba de panel de reportes:
   - Accede a /admin/reports
   - Prueba cada función del formulario
*/

// ====================================
// 13. CONSIDERACIONES DE SEGURIDAD
// ====================================

/*
✓ HACER:
- Almacenar GMAIL_APP_PASSWORD en variables de entorno
- Validar emails antes de enviar
- Usar contraseñas de aplicación (no contraseñas de cuenta)
- Verificar permisos de usuario antes de generar reportes
- Usar HTTPS en producción

✗ NO HACER:
- Hardcodear credenciales en el código
- Enviar correos sin validar datos
- Usar credenciales de cuenta de Gmail directamente
- Exponer datos sensibles en reportes públicos
- Enviar información de clientes a correos no autorizados
*/

// ====================================
// 14. PRÓXIMAS MEJORAS
// ====================================

/*
Características que pueden agregarse:
- Exportación a Excel con formatos avanzados
- Gráficos visuales en reportes por email
- Notificaciones en tiempo real
- Reportes multiusuario con roles específicos
- Programación automática de reportes
- Alertas inteligentes basadas en umbr ales
- Análisis predictivo de ventas
- Integración con herramientas de CRM
*/

export const SETUP_GUIDE = {
    title: "Guía Completa de Configuración",
    version: "1.0",
    lastUpdated: "2026-01-19",
    features: [
        "Plantillas de correo profesionales",
        "Sistema de reportes automatizado",
        "Panel de administración intuitivo",
        "Descarga de datos en múltiples formatos",
        "Alertas y notificaciones",
    ],
};
