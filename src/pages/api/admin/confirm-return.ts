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
          amount: returnRequest.refund_amount,
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

// Función para generar HTML
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
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <td style="padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px;">Devolución Aprobada</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px;">Hola <strong>${name}</strong>,</p>
              
              <p style="margin: 0 0 30px 0; font-size: 14px; color: #666;">
                Tu solicitud de devolución ha sido <strong>aprobada</strong>. Por favor descarga la etiqueta de envío y sigue los pasos indicados para completar el proceso de devolución.
              </p>

              <!-- Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f8ff; border-left: 4px solid #667eea; margin: 30px 0; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px 0; color: #667eea; font-weight: bold; font-size: 14px;">DETALLES DE TU DEVOLUCIÓN</p>
                    <p style="margin: 5px 0; font-size: 13px;"><span style="color: #666;">Número de Pedido:</span> <strong>#${orderNumber}</strong></p>
                    <p style="margin: 5px 0; font-size: 13px;"><span style="color: #666;">ID de Devolución:</span> <strong>${returnId.slice(0, 8).toUpperCase()}</strong></p>
                    <p style="margin: 5px 0; font-size: 13px;"><span style="color: #666;">Monto a Reembolsar:</span> <strong style="color: #28a745; font-size: 18px;">€${amount.toFixed(2)}</strong></p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 35px 0;">
                <tr>
                  <td align="center">
                    <a href="${labelUrl}" style="display: inline-block; background: #28a745; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Descargar Etiqueta de Envío
                    </a>
                  </td>
                </tr>
              </table>

              ${trackingNumber ? `
              <p style="text-align: center; margin: 20px 0 0 0; font-size: 13px; color: #666;">
                <strong>Número de Seguimiento:</strong><br>
                <code style="background: #f0f0f0; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px; font-family: monospace;">${trackingNumber}</code>
              </p>
              ` : ''}

              <!-- Steps -->
              <h3 style="margin: 35px 0 15px 0; color: #333; font-size: 16px;">Próximos Pasos</h3>
              <ol style="margin: 0; padding-left: 20px; color: #666; font-size: 14px;">
                <li style="margin-bottom: 8px;">Descarga e imprime la etiqueta de envío</li>
                <li style="margin-bottom: 8px;">Prepara el artículo devuelto en su empaque original</li>
                <li style="margin-bottom: 8px;">Adhiere la etiqueta de envío en un lugar visible del paquete</li>
                <li style="margin-bottom: 8px;">Entrega el paquete en la oficina de correo indicada</li>
              </ol>

              <!-- Important Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #fff3cd; border-left: 4px solid #ffc107; margin: 30px 0; border-radius: 4px;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="margin: 0; color: #856404; font-size: 13px;">
                      <strong>⏱️ Reembolso:</strong> Una vez recibamos y procesemos tu devolución, el reembolso se acreditará en tu cuenta en 5-7 días hábiles.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">
                Si tienes preguntas o problemas, contáctanos a través de nuestro sitio web.
              </p>
              <p style="margin: 0; font-size: 11px; color: #bbb;">
                © 2025 Fashion Force. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
