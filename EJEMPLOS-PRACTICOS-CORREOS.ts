/**
 * EJEMPLOS PRÁCTICOS - Sistema de Correos y Reportes
 * Implementación lista para usar
 */

// ============================================================================
// EJEMPLO 1: Integración en una ruta de checkout/confirmación de pedido
// ============================================================================

// pages/api/checkout/confirm.ts
import type { APIRoute } from 'astro';
import { sendCustomerEmail } from '../../lib/email';
import type { CustomerEmailData } from '../../lib/email';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { orderId } = await request.json();

        // Obtener datos completos del pedido
        const { data: order, error } = await supabase
            .from('orders')
            .select(
                `
                id,
                order_number,
                user_id,
                total_amount,
                status,
                created_at,
                payment_method,
                discount_code,
                discount_amount,
                shipping_cost,
                tax_rate,
                users (name, email, address),
                order_items (
                    quantity,
                    unit_price,
                    products (name, sku)
                )
            `
            )
            .eq('id', orderId)
            .single();

        if (error || !order) {
            return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), {
                status: 404,
            });
        }

        // Preparar datos para el email
        const products = order.order_items.map((item: any) => ({
            product_name: item.products.name,
            product_sku: item.products.sku,
            quantity: item.quantity,
            unit: 'pzas',
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price,
        }));

        const subtotal = products.reduce((sum: number, p: any) => sum + p.total_price, 0);
        const taxAmount = (subtotal * (order.tax_rate || 16)) / 100;

        const emailData: CustomerEmailData = {
            customer_name: order.users.name,
            order_number: order.order_number,
            order_date: new Date(order.created_at).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            order_status: 'Confirmado',
            payment_method: order.payment_method || 'Tarjeta de Crédito',
            products,
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax_rate: order.tax_rate || 16,
            tax_amount: parseFloat(taxAmount.toFixed(2)),
            shipping_cost: order.shipping_cost || 0,
            discount_applied: !!order.discount_code,
            discount_code: order.discount_code,
            discount_amount: order.discount_amount || 0,
            total_amount: order.total_amount,
            active_offers: [
                {
                    discount_percentage: 15,
                    offer_title: '15% en Jeans',
                    offer_code: 'JEANS15',
                },
                {
                    discount_percentage: 20,
                    offer_title: '20% en Camisetas',
                    offer_code: 'TEES20',
                },
            ],
            recommendations: [
                {
                    recommendation_title: 'Accesorios Complementarios',
                    recommendation_description:
                        'Completa tu compra con cinturones, sombreros y más',
                },
            ],
            promo_code_available: true,
            promo_code: 'PRIMERACOMPRA10',
            promo_description: '10% descuento en tu próxima compra',
            track_order_url: `${process.env.PUBLIC_URL}/track/${order.order_number}`,
            continue_shopping_url: `${process.env.PUBLIC_URL}/shop`,
            customer_address: order.users.address || 'Dirección no especificada',
            support_email: process.env.SUPPORT_EMAIL || 'soporte@tienda.com',
            facebook_url: 'https://facebook.com/mi-tienda',
            instagram_url: 'https://instagram.com/mi-tienda',
            twitter_url: 'https://twitter.com/mi-tienda',
            company_name: process.env.COMPANY_NAME || 'Mi Tienda',
            current_year: new Date().getFullYear(),
        };

        // Enviar correo al cliente
        await sendCustomerEmail(order.users.email, emailData);

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Correo de confirmación enviado',
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error en confirmación:', error);
        return new Response(
            JSON.stringify({ error: 'Error procesando confirmación' }),
            { status: 500 }
        );
    }
};

// ============================================================================
// EJEMPLO 2: Middleware para automatizar envío de emails post-pedido
// ============================================================================

// middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    const response = await next();

    // Si es una confirmación de pedido exitosa
    if (context.request.url.includes('/api/checkout/confirm') && response.status === 200) {
        const data = await response.json();

        // Aquí podrías agregar lógica adicional
        console.log('✓ Pedido confirmado y correo enviado');
    }

    return response;
});

// ============================================================================
// EJEMPLO 3: Cron job para enviar reportes automáticos diarios
// ============================================================================

// scripts/send-daily-report.ts
import { generateAdminEmailData, sendAdminEmail } from '../src/lib/email';

async function sendDailyReport() {
    try {
        console.log('📊 Generando reporte diario...');

        const reportData = await generateAdminEmailData('day');
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@ejemplo.com';

        await sendAdminEmail(adminEmail, reportData);

        console.log('✓ Reporte diario enviado a', adminEmail);
    } catch (error) {
        console.error('✗ Error enviando reporte diario:', error);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    sendDailyReport();
}

// ============================================================================
// EJEMPLO 4: Componente React para interfaz de reportes simplificada
// ============================================================================

// components/ReportGenerator.tsx
import { useState } from 'react';

export default function ReportGenerator() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [dateRange, setDateRange] = useState('day');

    const handleSendReport = async () => {
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/admin/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dateRange,
                    adminEmail: localStorage.getItem('adminEmail') || '',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('✓ Reporte enviado exitosamente');
            } else {
                setMessage(`✗ Error: ${data.error}`);
            }
        } catch (error) {
            setMessage(`✗ Error de conexión: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    // Retorna JSX similar a:
    // <div className="report-generator">
    //     <h3>Generar Reporte</h3>
    //     <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
    //         <option value="day">Hoy</option>
    //         <option value="week">Esta Semana</option>
    //         <option value="month">Este Mes</option>
    //         <option value="year">Este Año</option>
    //     </select>
    //     <button onClick={handleSendReport} disabled={loading}>
    //         {loading ? 'Enviando...' : 'Enviar Reporte'}
    //     </button>
    //     {message && <p>{message}</p>}
    // </div>
}

// ============================================================================
// EJEMPLO 5: Función helper para enviar bulk emails a múltiples clientes
// ============================================================================

// lib/email-bulk.ts
import { sendBulkCustomerEmails } from './email';
import type { CustomerEmailData } from './email';
import { supabase } from './supabase';

export async function sendOrderConfirmationsToAll(from: string, to: string) {
    try {
        // Obtener todos los pedidos del período
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                id,
                order_number,
                total_amount,
                users (name, email),
                order_items (quantity, unit_price, products (name, sku))
            `)
            .gte('created_at', from)
            .lte('created_at', to);

        if (error || !orders) throw error;

        // Preparar datos para bulk send
        const emailsToSend = orders.map((order: any) => ({
            email: order.users.email,
            data: {
                customer_name: order.users.name,
                order_number: order.order_number,
                // ... más datos
            } as CustomerEmailData,
        }));

        // Enviar todos los correos
        const results = await sendBulkCustomerEmails(emailsToSend);

        // Reporte de envíos
        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        console.log(`✓ Enviados: ${successful}, Fallidos: ${failed}`);

        return results;
    } catch (error) {
        console.error('Error en envío bulk:', error);
        throw error;
    }
}

// ============================================================================
// EJEMPLO 6: Verificación de configuración
// ============================================================================

// pages/api/health/email.ts
import type { APIRoute } from 'astro';
import { verifyEmailConnection } from '../../lib/email';

export const GET: APIRoute = async () => {
    try {
        const isConnected = await verifyEmailConnection();

        return new Response(
            JSON.stringify({
                status: isConnected ? 'ok' : 'error',
                message: isConnected
                    ? '✓ Sistema de emails configurado correctamente'
                    : '✗ Error en configuración de emails',
                timestamp: new Date().toISOString(),
            }),
            { status: isConnected ? 200 : 500, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                status: 'error',
                message: `✗ ${(error as Error).message}`,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

// ============================================================================
// EJEMPLO 7: Exportar datos a Excel (con exceljs)
// ============================================================================

// lib/export-excel.ts
import { Workbook } from 'exceljs';
import { supabase } from './supabase';

export async function exportOrdersToExcel(startDate: Date, endDate: Date) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Pedidos');

    // Headers
    worksheet.columns = [
        { header: 'Nº Pedido', key: 'order_number', width: 15 },
        { header: 'Cliente', key: 'customer_name', width: 20 },
        { header: 'Email', key: 'customer_email', width: 25 },
        { header: 'Monto', key: 'total_amount', width: 12 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Fecha', key: 'created_at', width: 15 },
    ];

    // Obtener datos
    const { data: orders } = await supabase
        .from('orders')
        .select('order_number, total_amount, status, created_at, users(name, email)')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    // Agregar filas
    orders?.forEach((order: any) => {
        worksheet.addRow({
            order_number: order.order_number,
            customer_name: order.users?.name,
            customer_email: order.users?.email,
            total_amount: order.total_amount,
            status: order.status,
            created_at: order.created_at,
        });
    });

    // Styling
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF667EEA' },
    };

    return workbook;
}

// ============================================================================
// EJEMPLO 8: Integración con Stripe/Pagos
// ============================================================================

// lib/payment-email.ts
export async function handlePaymentSuccess(event: any) {
    const { order, customer } = event.data.object;

    // Enviar correo de confirmación
    await sendCustomerEmail(customer.email, {
        customer_name: customer.name,
        order_number: order.id,
        order_status: 'Pago Procesado',
        // ... más datos
    });

    // Notificar al admin
    await sendAdminEmail(process.env.ADMIN_EMAIL, {
        report_period: 'Notificación de Pago',
        // ... datos del reporte
    });
}

// ============================================================================
// EJEMPLO 9: Testing de plantillas
// ============================================================================

// scripts/test-email-templates.ts
import { sendCustomerEmail } from '../src/lib/email';
import type { CustomerEmailData } from '../src/lib/email';

async function testEmailTemplates() {
    console.log('🧪 Testeando plantillas de email...');

    const testEmail: CustomerEmailData = {
        customer_name: 'Test User',
        order_number: 'TEST-001',
        order_date: new Date().toLocaleDateString('es-ES'),
        order_status: 'Confirmado',
        payment_method: 'Tarjeta de Crédito',
        products: [
            {
                product_name: 'Producto Test',
                product_sku: 'TEST-SKU',
                quantity: 1,
                unit: 'pzas',
                unit_price: 100,
                total_price: 100,
            },
        ],
        subtotal: 100,
        tax_rate: 16,
        tax_amount: 16,
        shipping_cost: 10,
        total_amount: 126,
        active_offers: [],
        recommendations: [],
        track_order_url: 'https://ejemplo.com/track',
        continue_shopping_url: 'https://ejemplo.com/shop',
        customer_address: 'Calle Test 123',
        support_email: 'soporte@ejemplo.com',
        facebook_url: 'https://facebook.com',
        instagram_url: 'https://instagram.com',
        twitter_url: 'https://twitter.com',
        company_name: 'Test Company',
        current_year: 2026,
    };

    try {
        await sendCustomerEmail('test@ejemplo.com', testEmail);
        console.log('✓ Email de prueba enviado exitosamente');
    } catch (error) {
        console.error('✗ Error:', error);
    }
}

testEmailTemplates();

// ============================================================================
// EJEMPLO 10: Dashboard integrado en admin
// ============================================================================

// components/AdminEmailStatus.tsx
import { useEffect, useState } from 'react';

export default function AdminEmailStatus() {
    const [stats, setStats] = useState({
        emailsSent: 0,
        emailsFailed: 0,
        lastReport: null,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Retorna JSX similar a:
    // <div className="email-status">
    //     <h3>Estado del Sistema de Emails</h3>
    //     <div className="stats">
    //         <div className="stat">
    //             <p>Enviados</p>
    //             <h4>{stats.emailsSent}</h4>
    //         </div>
    //         <div className="stat">
    //             <p>Fallidos</p>
    //             <h4>{stats.emailsFailed}</h4>
    //         </div>
    //         <div className="stat">
    //             <p>Último Reporte</p>
    //             <p>{stats.lastReport || 'No enviado'}</p>
    //         </div>
    //     </div>
    // </div>
