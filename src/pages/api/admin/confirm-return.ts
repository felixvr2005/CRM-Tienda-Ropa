import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';
import nodemailer from 'nodemailer';

// Crear transporte de correo con Gmail
const createTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  logger.debug('Confirm Return - configuring gmail transporter', { user: gmailUser });

  if (!gmailUser || !gmailPassword) {
    throw new Error('GMAIL_USER o GMAIL_APP_PASSWORD no configurados');
  }

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

export const POST: APIRoute = async ({ request }) => {
  try {
    const { returnId, status, trackingNumber, labelUrl, notes } = await request.json();

    logger.info('Confirm Return API starting', { returnId, status, trackingNumber });

    if (!returnId) {
      return new Response(
        JSON.stringify({ error: 'Return ID is required' }),
        { status: 400 }
      );
    }

    // 1. Obtener datos de la devolución
    logger.debug('Fetching return request', { returnId });
    const { data: returnRequest, error: fetchError } = await supabaseAdmin
      .from('return_requests')
      .select('*')
      .eq('id', returnId)
      .single();

    if (fetchError || !returnRequest) {
      logger.error('Return request not found or fetch error', { error: fetchError });
      return new Response(
        JSON.stringify({ error: 'Return request not found', details: fetchError?.message }),
        { status: 404 }
      );
    }

    logger.info('Return request fetched', { id: returnRequest.id });

    // 2. Obtener datos de cliente
    logger.debug('Fetching customer for return', { customerId: returnRequest.customer_id });
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('email, first_name, last_name')
      .eq('id', returnRequest.customer_id)
      .single();

    if (customerError) {
      logger.error('Error fetching customer for return', { error: customerError });
    }

    logger.info('Customer fetched for return', { email: customer?.email });

    // 3. Obtener datos de pedido
    logger.debug('Fetching order for return', { orderId: returnRequest.order_id });
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('order_number')
      .eq('id', returnRequest.order_id)
      .single();

    if (orderError) {
      logger.error('Error fetching order for return', { error: orderError });
    }

    logger.info('Order fetched for return', { orderNumber: order?.order_number });

    // 4. Actualizar estado
    logger.info('[Confirm Return API] Actualizando estado...');
    const updateData: any = {
      status: status || 'label_sent',
      updated_at: new Date().toISOString(),
    };

    if (trackingNumber) updateData.return_tracking_number = trackingNumber;
    if (labelUrl) updateData.return_label_url = labelUrl;
    if (notes) updateData.notes = notes;

    const { error: updateError } = await supabaseAdmin
      .from('return_requests')
      .update(updateData)
      .eq('id', returnId);

    if (updateError) {
      logger.error('Error updating return:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update return status', details: updateError.message }),
        { status: 500 }
      );
    }

    logger.info('[Confirm Return API] Estado actualizado correctamente');

    // 5. Enviar correo
    const customerEmail = customer?.email;
    const customerName = `${customer?.first_name} ${customer?.last_name}`.trim();
    const orderNumber = order?.order_number || 'N/A';

    logger.info('[Confirm Return API] Preparando envío de correo a:', customerEmail);

    if (customerEmail && labelUrl) {
      try {
        await sendReturnEmail({
          email: customerEmail,
          name: customerName,
          orderNumber,
          returnId,
          amount: returnRequest.refund_amount ?? 0,
          labelUrl,
          trackingNumber,
        });
        logger.info('[Confirm Return API] Email enviado correctamente');
      } catch (emailError) {
        logger.error('[Confirm Return API] Error al enviar email:', emailError);
        // Continuar aunque falle el email
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Return status updated and email sent',
        returnId,
      }),
      { status: 200 }
    );
  } catch (error) {
    logger.error('[Confirm Return API] Exception:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: (error as Error).message }),
      { status: 500 }
    );
  }
};

// Función para enviar email usando Gmail con nodemailer
async function sendReturnEmail({
  email,
  name,
  orderNumber,
  returnId,
  amount,
  labelUrl,
  trackingNumber,
}: {
  email: string;
  name: string;
  orderNumber: string;
  returnId: string;
  amount: number;
  labelUrl: string;
  trackingNumber?: string;
}): Promise<void> {
  try {
    logger.info('[Email Sender] Iniciando envío a:', email);

    const transporter = createTransporter();

    const htmlContent = generateEmailHTML({
      name,
      orderNumber,
      returnId,
      amount,
      labelUrl,
      trackingNumber,
    });

    const gmailUser = process.env.GMAIL_USER;

    const mailOptions = {
      from: gmailUser,
      to: email,
      subject: `Etiqueta de Envío para Devolución #${returnId.slice(0, 8).toUpperCase()}`,
      html: htmlContent,
    };

    logger.info('[Email Sender] Opciones de correo:', { 
      from: mailOptions.from, 
      to: mailOptions.to, 
      subject: mailOptions.subject 
    });

    const result = await transporter.sendMail(mailOptions);

    logger.info('[Email Sender] ✅ Email enviado exitosamente:', result.messageId);
  } catch (error) {
    logger.error('[Email Sender] ❌ Error al enviar email:', error);
    throw error;
  }
}

// Función para generar HTML — diseño minimalista Essential Force
function generateEmailHTML({
  name,
  orderNumber,
  returnId,
  amount,
  labelUrl,
  trackingNumber,
}: {
  name: string;
  orderNumber: string;
  returnId: string;
  amount: number;
  labelUrl: string;
  trackingNumber?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #404040; background-color: #f5f5f5; margin: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #171717; color: #ffffff; padding: 32px 40px; text-align: center; }
    .header h1 { font-size: 13px; letter-spacing: 4px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px; }
    .header p { font-size: 12px; color: #a3a3a3; font-weight: 300; margin: 0; }
    .content { padding: 40px; }
    .section-title { font-size: 11px; letter-spacing: 2px; font-weight: 600; text-transform: uppercase; color: #737373; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #e5e5e5; }
    .info-box { background-color: #fafafa; border: 1px solid #e5e5e5; padding: 16px 20px; margin-bottom: 24px; }
    .cta-section { text-align: center; margin: 28px 0; }
    .cta-button { display: inline-block; background-color: #ffffff; color: #171717; padding: 14px 40px; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; border: 2px solid #171717; }
    .footer { background-color: #fafafa; padding: 28px 40px; text-align: center; border-top: 1px solid #e5e5e5; }
    .footer-note { font-size: 11px; color: #a3a3a3; line-height: 1.6; }
    @media (max-width: 600px) { .content { padding: 24px 20px; } .header { padding: 24px 20px; } .footer { padding: 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Essential Force</h1>
      <p>Devolución aprobada</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p style="font-size: 15px; color: #171717; margin: 0 0 8px;">Hola <strong>${name}</strong>,</p>
      <p style="font-size: 14px; color: #404040; margin: 0 0 28px;">
        Tu solicitud de devolución ha sido <strong>aprobada</strong>. Descarga la etiqueta de envío y sigue los pasos indicados para completar el proceso.
      </p>

      <!-- Detalles -->
      <div class="section-title">Detalles de la devolución</div>
      <div class="info-box">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 4px 0; color: #737373; font-size: 13px;">Nº Pedido</td>
            <td style="padding: 4px 0; color: #171717; font-weight: 500; font-size: 13px; text-align: right;">#${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #737373; font-size: 13px;">ID Devolución</td>
            <td style="padding: 4px 0; color: #171717; font-weight: 500; font-size: 13px; text-align: right;">${returnId.slice(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #737373; font-size: 13px;">Reembolso</td>
            <td style="padding: 4px 0; color: #171717; font-weight: 700; font-size: 16px; text-align: right;">${amount.toFixed(2).replace('.', ',')} €</td>
          </tr>
        </table>
      </div>

      ${trackingNumber ? `
      <div class="info-box" style="margin-bottom: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 4px 0; color: #737373; font-size: 13px;">Nº Seguimiento</td>
            <td style="padding: 4px 0; color: #171717; font-weight: 500; font-size: 13px; text-align: right; font-family: monospace;">${trackingNumber}</td>
          </tr>
        </table>
      </div>
      ` : ''}

      <!-- CTA -->
      <div class="cta-section">
        <a href="${labelUrl}" class="cta-button" style="display: inline-block; background-color: #ffffff; color: #171717; padding: 14px 40px; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; border: 2px solid #171717;">Descargar etiqueta de envío</a>
      </div>

      <!-- Próximos pasos -->
      <div class="section-title" style="margin-top: 32px;">Próximos pasos</div>
      <ol style="margin: 0; padding-left: 20px; color: #404040; font-size: 13px; line-height: 1.8;">
        <li>Descarga e imprime la etiqueta de envío</li>
        <li>Prepara el artículo en su empaque original</li>
        <li>Adhiere la etiqueta en un lugar visible del paquete</li>
        <li>Entrega el paquete en la oficina de correo indicada</li>
      </ol>

      <!-- Nota de reembolso -->
      <div class="info-box" style="margin-top: 24px;">
        <p style="margin: 0; color: #404040; font-size: 13px;">
          <strong>Plazo de reembolso:</strong> Una vez recibamos y procesemos tu devolución, el reembolso se acreditará en tu cuenta en 5-7 días hábiles.
        </p>
      </div>

      <p style="text-align: center; font-size: 12px; color: #a3a3a3; margin-top: 24px;">
        ¿Necesitas ayuda? Escríbenos a <strong>info@essentialforce.com</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-note">
        © ${new Date().getFullYear()} Essential Force. Todos los derechos reservados.<br>
        Este es un email automático, por favor no respondas a este mensaje.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
