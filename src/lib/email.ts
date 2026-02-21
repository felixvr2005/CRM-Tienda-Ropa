import { logger } from '@lib/logger';
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
        product_image?: string;
        product_details?: string;
        quantity: number;
        unit: string;
        unit_price: string;
        total_price: string;
    }>;
    base_amount: string;
    tax_amount: string;
    shipping_cost: number;
    shipping_label: string;
    discount_applied?: boolean;
    discount_code?: string;
    discount_amount?: string;
    total_amount: string;
    track_order_url: string;
    customer_address: string;
    support_email: string;
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
    const gmailPassword = process.env.GMAIL_APP_PASSWORD || '';
    
    if (!gmailUser || !gmailPassword) {
        logger.warn('Variables de email no configuradas (GMAIL_USER / GMAIL_APP_PASSWORD faltantes).');
    }
    
    logger.info('Usando email (transporter)', { user: gmailUser });
    
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

    // Procesar bloques condicionales {{#if variable}}...{{/if}} (de dentro hacia fuera para soportar anidamiento)
    let ifChanged = true;
    while (ifChanged) {
      const before = html;
      // Solo matchea bloques que NO contienen otro {{#if dentro (innermost first)
      html = html.replace(/{{#if\s+(\w+)}}((?:(?!{{#if)[\s\S])*?){{\/if}}/g, (match, key, content) => {
        return data[key] ? content : '';
      });
      ifChanged = html !== before;
    }

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
        logger.info('Email enviado al cliente', { to: customerEmail, response: info.response });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error('Error al enviar email a cliente', { error: String(error) });
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
        logger.info(`Email enviado al admin: ${adminEmail}`, info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error('Error al enviar email a admin:', error);
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
        logger.error('Error al enviar emails masivos:', error);
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
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #404040; background-color: #f5f5f5; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #171717; color: #ffffff; padding: 28px 40px; text-align: center; }
        .header h1 { font-size: 12px; letter-spacing: 3px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px; }
        .header p { font-size: 11px; color: #a3a3a3; margin: 0; }
        .content { padding: 36px 40px; }
        .status-box { background-color: #fafafa; border: 1px solid #e5e5e5; padding: 20px; margin: 20px 0; }
        .status-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
        .status-label { color: #737373; }
        .status-value { color: #171717; font-weight: 600; }
        .status-new { font-size: 18px; font-weight: 700; color: #171717; text-align: center; padding: 16px 0 8px; }
        .order-details { border-top: 1px solid #e5e5e5; margin-top: 20px; padding-top: 16px; }
        .detail-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
        .detail-label { color: #737373; }
        .detail-val { color: #171717; font-weight: 500; }
        .cta-section { text-align: center; margin: 24px 0; }
        .cta-button { display: inline-block; background-color: #171717; color: #ffffff; padding: 12px 36px; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
        .footer { background-color: #fafafa; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e5e5; font-size: 11px; color: #a3a3a3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Essential Force</h1>
            <p>Actualización de pedido</p>
        </div>
        <div class="content">
            <p style="font-size: 15px; color: #171717;">Hola <strong>${data.customer_name}</strong>,</p>
            <p style="font-size: 14px; color: #404040; margin-top: 8px;">El estado de tu pedido ha sido actualizado:</p>

            <div class="status-box">
                <div class="status-row">
                    <span class="status-label">Estado anterior</span>
                    <span class="status-value">${previousStatusLabel}</span>
                </div>
                <div style="text-align: center; padding: 4px 0; color: #a3a3a3; font-size: 16px;">↓</div>
                <div class="status-new">${emoji} ${newStatusLabel}</div>
            </div>

            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Nº Pedido</span>
                    <span class="detail-val">#${data.order_number}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Fecha</span>
                    <span class="detail-val">${new Date(data.order_date).toLocaleDateString('es-ES')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total</span>
                    <span class="detail-val">${data.total_amount.toFixed(2).replace('.', ',')} €</span>
                </div>
            </div>

            <div class="cta-section">
                <a href="${data.tracking_url}" class="cta-button">Ver mi pedido</a>
            </div>

            <p style="font-size: 12px; color: #a3a3a3; text-align: center;">
                ¿Necesitas ayuda? Escríbenos a <strong>info@essentialforce.com</strong>
            </p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} Essential Force. Todos los derechos reservados.<br>
            Este es un email automático, por favor no respondas a este mensaje.
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: process.env.GMAIL_USER || 'felixvr2005@gmail.com',
            to: customerEmail,
            subject: `Tu pedido #${data.order_number} ahora está ${newStatusLabel} — Essential Force`,
            html,
            replyTo: 'info@essentialforce.com',
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email de notificación enviado a: ${customerEmail}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error('Error al enviar email de notificación:', error);
        // No lanzar error para no bloquear la operación
        return { success: false, error: (error as Error).message };
    }
};

// Verificar conexión SMTP
export const verifyEmailConnection = async () => {
    try {
        const transporter = createEmailTransport();
        await transporter.verify();
        logger.info('Conexión de email verificada correctamente');
        return true;
    } catch (error) {
        logger.error('Error verificando conexión de email', { error: String(error) });
        return false;
    }
};
