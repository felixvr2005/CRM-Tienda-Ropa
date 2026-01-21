import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import nodemailer from 'nodemailer';

// Configurar transporte de correo
const transporter = nodemailer.createTransport({
  host: import.meta.env.SMTP_HOST,
  port: parseInt(import.meta.env.SMTP_PORT || '587'),
  secure: import.meta.env.SMTP_SECURE === 'true',
  auth: {
    user: import.meta.env.SMTP_USER,
    pass: import.meta.env.SMTP_PASSWORD,
  },
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const { returnId, status, trackingNumber, labelUrl, notes } = await request.json();

    if (!returnId) {
      return new Response(
        JSON.stringify({ error: 'Return ID is required' }),
        { status: 400 }
      );
    }

    // 1. Obtener datos de la devolución
    const { data: returnRequest, error: fetchError } = await supabaseAdmin
      .from('return_requests')
      .select('*, customers(email, first_name, last_name), orders(order_number)')
      .eq('id', returnId)
      .single();

    if (fetchError || !returnRequest) {
      console.error('Error fetching return:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Return request not found' }),
        { status: 404 }
      );
    }

    // 2. Actualizar estado de la devolución
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
      console.error('Error updating return:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update return status' }),
        { status: 500 }
      );
    }

    // 3. Enviar correo con etiqueta de envío
    const customerEmail = returnRequest.customers?.email;
    const customerName = `${returnRequest.customers?.first_name} ${returnRequest.customers?.last_name}`;
    const orderNumber = returnRequest.orders?.order_number || 'N/A';

    if (customerEmail && labelUrl) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Devolución Aprobada</h2>
          
          <p>Hola ${customerName},</p>
          
          <p>Tu solicitud de devolución ha sido aprobada. Aquí están los detalles:</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Número de Pedido:</strong> #${orderNumber}</p>
            <p><strong>ID de Devolución:</strong> ${returnId.slice(0, 8)}</p>
            <p><strong>Monto a Reembolsar:</strong> €${returnRequest.refund_amount}</p>
          </div>

          <h3>Etiqueta de Envío</h3>
          <p>Descarga tu etiqueta de envío haciendo click en el botón de abajo:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${labelUrl}" 
               style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Descargar Etiqueta de Envío
            </a>
          </div>

          ${trackingNumber ? `
            <p><strong>Número de Seguimiento:</strong> ${trackingNumber}</p>
          ` : ''}

          <h3>Próximos Pasos</h3>
          <ol>
            <li>Descarga e imprime la etiqueta de envío</li>
            <li>Prepara el artículo devuelto en su empaque original</li>
            <li>Adhiere la etiqueta de envío al paquete</li>
            <li>Entrega el paquete en la oficina de correo</li>
          </ol>

          <p>Una vez que recibamos tu devolución, procesaremos el reembolso en 5-7 días hábiles.</p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Si tienes preguntas, contáctanos a través de nuestro sitio web.
          </p>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: import.meta.env.SMTP_FROM || 'noreply@fashionforce.com',
          to: customerEmail,
          subject: `Etiqueta de Envío para Devolución #${returnId.slice(0, 8)}`,
          html: emailHtml,
        });
        console.log(`Email sent to ${customerEmail}`);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // No fallar si el email falla, pero registrar el error
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Return status updated and email sent',
        returnId: returnId,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
};
