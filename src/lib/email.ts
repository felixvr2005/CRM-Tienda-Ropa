import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

// Tipos de datos
interface EmailTemplate {
    subject: string;
    html: string;
}

interface CustomerEmailData {
    customer_name: string;
    order_number: string;
    order_date: string;
    order_status: string;
    payment_method: string;
    products: Array<{
        product_name: string;
        product_sku: string;
        quantity: number;
        unit: string;
        unit_price: number;
        total_price: number;
    }>;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    shipping_cost: number;
    discount_applied?: boolean;
    discount_code?: string;
    discount_amount?: number;
    total_amount: number;
    active_offers: Array<{
        discount_percentage: number;
        offer_title: string;
        offer_code: string;
    }>;
    recommendations: Array<{
        recommendation_title: string;
        recommendation_description: string;
    }>;
    promo_code_available?: boolean;
    promo_code?: string;
    promo_description?: string;
    track_order_url: string;
    continue_shopping_url: string;
    customer_address: string;
    support_email: string;
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
    company_name: string;
    current_year: number;
}

interface AdminEmailData {
    report_period: string;
    date_range: string;
    report_date: string;
    generated_at: string;
    total_orders: number;
    total_revenue: number;
    pending_shipments: number;
    critical_alerts: number;
    has_alerts: boolean;
    payment_errors?: Array<{
        error_description: string;
        affected_order: string;
    }>;
    incomplete_orders?: Array<{
        order_issue: string;
        order_id: string;
    }>;
    low_stock?: Array<{
        product_name: string;
        stock_quantity: number;
    }>;
    system_alerts?: Array<{
        system_message: string;
    }>;
    recent_orders: Array<{
        order_number: string;
        customer_name: string;
        order_amount: number;
        order_status: string;
        order_status_lower: string;
        order_time: string;
    }>;
    gross_revenue: number;
    refunds: number;
    shipping_costs: number;
    discounts_total: number;
    commissions: number;
    net_profit: number;
    shipments: Array<{
        tracking_number: string;
        destination: string;
        shipment_status: string;
        shipment_status_lower: string;
        shipment_date: string;
    }>;
    top_products: Array<{
        product_name: string;
        product_revenue: number;
        product_quantity: number;
    }>;
    average_order_value: number;
    conversion_rate: number;
    new_customers: number;
    returning_customers: number;
    most_used_payment: string;
    recommended_actions: Array<{
        action_text: string;
    }>;
    admin_email: string;
    admin_panel_url: string;
    report_settings: string;
    company_name: string;
    current_year: number;
}

export type { EmailTemplate, CustomerEmailData, AdminEmailData };

// Configurar transporte de correo
const createEmailTransport = () => {
    const gmailUser = process.env.GMAIL_USER || 'felixvr2005@gmail.com';
    const gmailPassword = process.env.GMAIL_APP_PASSWORD || 'yglxkxkzrvcmciqq';
    
    if (!gmailUser || !gmailPassword) {
        console.error('Variables de email no configuradas:', { gmailUser: !!gmailUser, gmailPassword: !!gmailPassword });
    }
    
    console.log('Usando email:', gmailUser);
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailPassword,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
};

// Leer plantillas HTML
const loadTemplate = (templateName: string): string => {
    const templatePath = path.join(process.cwd(), 'src', 'templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf-8');
};

// Renderizar plantilla con datos
const renderTemplate = (template: string, data: any): string => {
    let html = template;

    // Reemplazar variables simples
    Object.keys(data).forEach((key) => {
        if (typeof data[key] !== 'object' && data[key] !== null) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, data[key]?.toString() || '');
        }
    });

    // Procesar bloques condicionales {{#if variable}}...{{/if}}
    const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
    html = html.replace(ifRegex, (match, key, content) => {
        return data[key] ? content : '';
    });

    // Procesar bloques condicionales {{#variable}}...{{/variable}} (legacy)
    Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key]) || typeof data[key] === 'boolean') {
            const conditionalRegex = new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
            html = html.replace(conditionalRegex, (match, content) => {
                if (Array.isArray(data[key])) {
                    // Iterar sobre array
                    return data[key].map((item: any) => {
                        let itemContent = content;
                        Object.keys(item).forEach((itemKey) => {
                            const itemRegex = new RegExp(`{{${itemKey}}}`, 'g');
                            itemContent = itemContent.replace(itemRegex, item[itemKey]?.toString() || '');
                        });
                        return itemContent;
                    }).join('');
                } else if (data[key]) {
                    // Mostrar si es true
                    return content;
                }
                return '';
            });
        }
    });

    return html;
};

// Enviar correo a cliente
export const sendCustomerEmail = async (
    customerEmail: string,
    data: CustomerEmailData
) => {
    try {
        const transporter = createEmailTransport();
        const template = loadTemplate('email-customer');
        const html = renderTemplate(template, data);

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: customerEmail,
            subject: `Confirmación de Pedido #${data.order_number} - ${data.company_name}`,
            html,
            replyTo: data.support_email,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email enviado al cliente: ${customerEmail}`, info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error al enviar email a cliente:', error);
        throw error;
    }
};

// Enviar correo a administrador
export const sendAdminEmail = async (
    adminEmail: string,
    data: AdminEmailData
) => {
    try {
        const transporter = createEmailTransport();
        const template = loadTemplate('email-admin');
        const html = renderTemplate(template, data);

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: adminEmail,
            subject: `Resumen de ${data.report_period} - ${data.date_range} | ${data.company_name}`,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email enviado al admin: ${adminEmail}`, info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error al enviar email a admin:', error);
        throw error;
    }
};

// Enviar correo masivo a clientes
export const sendBulkCustomerEmails = async (
    emails: Array<{ email: string; data: CustomerEmailData }>
) => {
    try {
        const transporter = createEmailTransport();
        const template = loadTemplate('email-customer');
        const results = [];

        for (const { email, data } of emails) {
            try {
                const html = renderTemplate(template, data);
                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: email,
                    subject: `Confirmación de Pedido #${data.order_number} - ${data.company_name}`,
                    html,
                    replyTo: data.support_email,
                };

                const info = await transporter.sendMail(mailOptions);
                results.push({
                    email,
                    success: true,
                    messageId: info.messageId,
                });
            } catch (error) {
                results.push({
                    email,
                    success: false,
                    error: (error as Error).message,
                });
            }
        }

        return results;
    } catch (error) {
        console.error('Error al enviar emails masivos:', error);
        throw error;
    }
};

// 📧 Enviar notificación de cambio de estado de pedido
export const sendAdminNotificationEmail = async (
    customerEmail: string,
    data: {
        order_number: string;
        previous_status: string;
        new_status: string;
        customer_name: string;
        order_date: string;
        total_amount: number;
        tracking_url: string;
    }
) => {
    try {
        const transporter = createEmailTransport();

        // Mapear estados a textos amigables
        const statusLabels: Record<string, string> = {
            'pending': 'Pendiente',
            'confirmed': 'Confirmado',
            'processing': 'En procesamiento',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado',
            'refunded': 'Reembolsado'
        };

        const previousStatusLabel = statusLabels[data.previous_status] || data.previous_status;
        const newStatusLabel = statusLabels[data.new_status] || data.new_status;

        // Emoji según el estado
        const statusEmoji: Record<string, string> = {
            'confirmed': '',
            'processing': '',
            'shipped': '',
            'delivered': '',
            'cancelled': '',
            'refunded': ''
        };

        const emoji = statusEmoji[data.new_status] || '';

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
        .content { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .status-update { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border: 1px solid #ddd; border-radius: 4px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #667eea; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ACTUALIZACIÓN DE TU PEDIDO</h1>
        </div>
        
        <div class="content">
            <p>¡Hola ${data.customer_name}!</p>
            
            <p>Tu pedido ha sido actualizado. Aquí te mostramos los cambios:</p>
            
            <div class="status-update">
                <div class="detail-row">
                    <span class="label">Estado anterior:</span>
                    <span>${previousStatusLabel}</span>
                </div>
                <div class="detail-row" style="border-bottom: none; font-weight: bold; color: #667eea;">
                    <span>⬇️ CAMBIO A</span>
                </div>
                <div class="detail-row" style="border-bottom: none; font-weight: bold; color: #28a745; font-size: 16px;">
                    <span>${newStatusLabel}</span>
                </div>
            </div>

            <div class="order-details">
                <h3>Detalles del Pedido</h3>
                <div class="detail-row">
                    <span class="label">Número de Pedido:</span>
                    <span>#${data.order_number}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Fecha del Pedido:</span>
                    <span>${new Date(data.order_date).toLocaleDateString('es-ES')}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Total:</span>
                    <span>${data.total_amount.toFixed(2)}€</span>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="${data.tracking_url}" class="cta-button">Ver Detalles del Pedido</a>
            </div>

            <p style="margin-top: 20px; color: #666; font-size: 14px;">
                Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos. Estamos aquí para ayudarte.
            </p>
        </div>

        <div class="footer">
            <p>© ${new Date().getFullYear()} Tienda de Moda Premium. Todos los derechos reservados.</p>
            <p>Este es un email automático, por favor no responder a este mensaje.</p>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: process.env.GMAIL_USER || 'felixvr2005@gmail.com',
            to: customerEmail,
            subject: `Tu pedido #${data.order_number} ahora está ${newStatusLabel}`,
            html,
            replyTo: 'soporte@tiendamoda.com',
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email de notificación enviado a: ${customerEmail}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error al enviar email de notificación:', error);
        // No lanzar error para no bloquear la operación
        return { success: false, error: (error as Error).message };
    }
};

// Verificar conexión SMTP
export const verifyEmailConnection = async () => {
    try {
        const transporter = createEmailTransport();
        await transporter.verify();
        console.log('✓ Conexión de email verificada correctamente');
        return true;
    } catch (error) {
        console.error('✗ Error verificando conexión de email:', error);
        return false;
    }
};
