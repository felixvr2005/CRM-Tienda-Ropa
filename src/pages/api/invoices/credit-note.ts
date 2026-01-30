import { logger } from '@lib/logger';
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import PDFDocument from 'pdfkit';

export const prerender = false;

/**
 * API para generar abonos (facturas negativas)
 * Se genera cuando un cliente devuelve un producto
 * POST /api/invoices/credit-note
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { returnRequestId, originalOrderId, authToken } = await request.json();

    if (!returnRequestId || !originalOrderId) {
      return new Response(
        JSON.stringify({ error: 'returnRequestId y originalOrderId requeridos' }),
        { status: 400 }
      );
    }

    // Obtener datos de la devolución
    const { data: returnRequest, error: returnError } = await supabaseAdmin
      .from('return_requests')
      .select('*')
      .eq('id', returnRequestId)
      .single();

    if (returnError || !returnRequest) {
      return new Response(
        JSON.stringify({ error: 'Solicitud de devolución no encontrada' }),
        { status: 404 }
      );
    }

    // Obtener datos de la orden original
    const { data: originalOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', originalOrderId)
      .single();

    if (orderError || !originalOrder) {
      return new Response(
        JSON.stringify({ error: 'Orden original no encontrada' }),
        { status: 404 }
      );
    }

    // Obtener items devueltos
    const { data: returnedItems, error: itemsError } = await supabaseAdmin
      .from('return_request_items')
      .select('*')
      .eq('return_request_id', returnRequestId);

    if (itemsError || !returnedItems) {
      return new Response(
        JSON.stringify({ error: 'Error obteniendo items devueltos' }),
        { status: 500 }
      );
    }

    // Crear documento PDF para el abono
    const doc = new PDFDocument();
    let buffers: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => {
      buffers.push(chunk);
    });

    // Encabezado - ABONO (diferente del azul normal)
    doc.fontSize(20).font('Helvetica-Bold').text('ABONO / NOTA DE CRÉDITO', 50, 50);
    doc.fontSize(10).font('Helvetica').text(
      `Referencia: ${(originalOrder as any).order_number}`, 
      50, 
      80
    );
    doc.text(`Fecha del abono: ${new Date().toLocaleDateString('es-ES')}`, 50, 95);
    doc.text(`Fecha de compra original: ${new Date((originalOrder as any).created_at).toLocaleDateString('es-ES')}`, 50, 110);

    // Banner de abono
    doc.fillColor('#fee2e2')
      .rect(50, 130, 500, 30)
      .fill();
    doc.fillColor('#991b1b')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Este documento es un abono por devolución de mercancía', 60, 140);

    doc.fillColor('black');

    // Datos de la empresa
    doc.fontSize(12).font('Helvetica-Bold').text('Fashion Store', 50, 180);
    doc.fontSize(10).font('Helvetica')
      .text('Calle Principal 123', 50, 200)
      .text('28001 Madrid, España', 50, 215)
      .text('info@fashionstore.com', 50, 230);

    // Datos del cliente
    doc.fontSize(10).font('Helvetica-Bold').text('ABONO A:', 300, 180);
    const billingInfo = (originalOrder as any).billing_address || {};
    doc.fontSize(9).font('Helvetica')
      .text(`${billingInfo.first_name || ''} ${billingInfo.last_name || ''}`, 300, 200)
      .text(billingInfo.address || '', 300, 215)
      .text(`${billingInfo.postal_code || ''} ${billingInfo.city || ''}`, 300, 230)
      .text(billingInfo.country || '', 300, 245);

    // Tabla de items devueltos
    const startY = 280;
    const colWidths = [250, 80, 80, 80];
    const cols = ['Producto', 'Cantidad', 'Precio', 'Total'];

    doc.fontSize(10).font('Helvetica-Bold');
    cols.forEach((col, i) => {
      doc.text(col, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY);
    });

    doc.moveTo(50, startY + 15).lineTo(550, startY + 15).stroke();

    // Items devueltos
    let currentY = startY + 25;
    doc.font('Helvetica').fontSize(9);

    let totalDebit = 0;
    returnedItems.forEach((item: any) => {
      const itemName = item.product_name || 'Producto';
      const itemTotal = (item.refund_amount / 100);
      totalDebit += itemTotal;

      doc.text(itemName, 50, currentY, { width: colWidths[0] - 10 });
      doc.text(item.quantity.toString(), 50 + colWidths[0], currentY);
      doc.text(`€${(item.refund_amount / 100 / item.quantity).toFixed(2)}`, 50 + colWidths[0] + colWidths[1], currentY);
      doc.text(`-€${itemTotal.toFixed(2)}`, 50 + colWidths[0] + colWidths[1] + colWidths[2], currentY);

      currentY += 20;
    });

    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();

    // Totales (negativos)
    currentY += 10;
    const shippingRefund = (returnRequest as any).refund_shipping_cost ? ((originalOrder as any).shipping_cost / 100) : 0;
    const subtotalRefund = totalDebit;
    const taxRefund = subtotalRefund * 0.21;
    const totalRefund = subtotalRefund + shippingRefund + taxRefund;

    doc.fontSize(10).font('Helvetica')
      .text(`Subtotal abonado: -€${subtotalRefund.toFixed(2)}`, 350, currentY)
      .text(`Envío abonado: -€${shippingRefund.toFixed(2)}`, 350, currentY + 20)
      .text(`IVA (21%): -€${taxRefund.toFixed(2)}`, 350, currentY + 40);

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#991b1b')
      .text(`TOTAL ABONADO: -€${totalRefund.toFixed(2)}`, 350, currentY + 60);

    doc.fillColor('black');

    // Motivo de la devolución
    doc.fontSize(10).font('Helvetica-Bold').text('Motivo de la devolución:', 50, currentY + 100);
    doc.fontSize(9).font('Helvetica')
      .text((returnRequest as any).reason || 'No especificado', 50, currentY + 120, { width: 500 });

    // Instrucciones de reembolso
    doc.fontSize(10).font('Helvetica-Bold').text('Información del reembolso:', 50, currentY + 180);
    doc.fontSize(9).font('Helvetica')
      .text(`• Se procesará en: ${(returnRequest as any).expected_refund_date || '5-7 días hábiles'}`, 50, currentY + 200)
      .text('• El abono se realizará al método de pago original', 50, currentY + 220)
      .text('• Ref. original: ' + (originalOrder as any).stripe_payment_intent?.slice(-8), 50, currentY + 240);

    // Pie de página
    doc.fontSize(8).font('Helvetica').text(
      'Este documento es un abono por devolución. Conserva una copia para tus registros.',
      50,
      700,
      { align: 'center', width: 500 }
    );

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        
        // Crear registro en BD
        try {
          (supabaseAdmin.from('credit_notes') as any).insert({
            return_request_id: returnRequestId,
            original_order_id: originalOrderId,
            refund_amount: Math.round(totalRefund * 100),
            created_at: new Date()
          });
        } catch (err: any) {
          logger.error('Error storing credit note:', err);
        }

        resolve(
          new Response(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="abono-${(originalOrder as any).order_number}.pdf"`
            }
          })
        );
      });
    });
  } catch (error) {
    logger.error('Credit note generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Error generando abono' }),
      { status: 500 }
    );
  }
};
