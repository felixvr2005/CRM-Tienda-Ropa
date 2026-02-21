import { logger } from '@lib/logger';
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import PDFDocument from 'pdfkit';

export const prerender = false;

// ── Constantes de diseño (mismas que factura) ──
const COLORS = {
  black: '#171717',
  dark: '#404040',
  mid: '#737373',
  light: '#a3a3a3',
  subtle: '#e5e5e5',
  bg: '#fafafa',
  white: '#ffffff',
};

const COMPANY = {
  name: 'ESSENTIAL FORCE',
  legal: 'Essential Force S.L.',
  cif: 'B-12345678',
  address: 'C/ Gran Vía 42, 3ª planta',
  city: '28013 Madrid, España',
  email: 'info@essentialforce.com',
  phone: '+34 910 123 456',
};

const IVA_RATE = 0.21;

function fmt(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' €';
}

function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function hLine(doc: PDFKit.PDFDocument, y: number, x1 = 50, x2 = 545) {
  doc.strokeColor(COLORS.subtle).lineWidth(0.5)
    .moveTo(x1, y).lineTo(x2, y).stroke()
    .strokeColor(COLORS.black).lineWidth(1);
}

const REASON_MAP: Record<string, string> = {
  defective: 'Producto defectuoso',
  wrong_item: 'Producto equivocado',
  not_as_described: 'No coincide con la descripción',
  too_large: 'Talla demasiado grande',
  too_small: 'Talla demasiado pequeña',
  changed_mind: 'Cambio de opinión',
  other: 'Otro motivo',
};

// ═════════════════════════════════════════════════════
// POST /api/invoices/credit-note
// ═════════════════════════════════════════════════════
export const POST: APIRoute = async ({ request }) => {
  try {
    const { returnRequestId, originalOrderId } = await request.json();

    if (!returnRequestId || !originalOrderId) {
      return new Response(
        JSON.stringify({ error: 'returnRequestId y originalOrderId requeridos' }),
        { status: 400 }
      );
    }

    // ── Data ──
    const [returnRes, orderRes, itemsRes] = await Promise.all([
      supabaseAdmin.from('return_requests').select('*').eq('id', returnRequestId).single(),
      supabaseAdmin.from('orders').select('*').eq('id', originalOrderId).single(),
      supabaseAdmin.from('return_request_items').select('*').eq('return_request_id', returnRequestId),
    ]);

    if (returnRes.error || !returnRes.data) {
      return new Response(JSON.stringify({ error: 'Solicitud de devolución no encontrada' }), { status: 404 });
    }
    if (orderRes.error || !orderRes.data) {
      return new Response(JSON.stringify({ error: 'Orden original no encontrada' }), { status: 404 });
    }
    if (itemsRes.error || !itemsRes.data) {
      return new Response(JSON.stringify({ error: 'Error obteniendo items devueltos' }), { status: 500 });
    }

    const ret = returnRes.data as any;
    const order = orderRes.data as any;
    const returnedItems = itemsRes.data as any[];

    // ── Cálculos fiscales (precios YA incluyen IVA) ──
    // refund_amount está en céntimos en la BD
    const itemsRefund = returnedItems.reduce((sum, item) => sum + (item.refund_amount || 0) / 100, 0);
    const shippingRefund = ret.refund_shipping_cost ? (order.shipping_cost || 0) : 0;
    const totalRefund = itemsRefund + shippingRefund;

    const itemsBase = +(itemsRefund / (1 + IVA_RATE)).toFixed(2);
    const itemsIva = +(itemsRefund - itemsBase).toFixed(2);

    const shippingBase = +(shippingRefund / (1 + IVA_RATE)).toFixed(2);
    const shippingIva = +(shippingRefund - shippingBase).toFixed(2);

    const totalBase = +(itemsBase + shippingBase).toFixed(2);
    const totalIva = +(itemsIva + shippingIva).toFixed(2);

    // ── PDF ──
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    // ───── HEADER ─────
    doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.black)
      .text(COMPANY.name, 50, 45);
    doc.fontSize(9).font('Helvetica').fillColor(COLORS.mid)
      .text(COMPANY.legal, 50, 72)
      .text(`CIF: ${COMPANY.cif}`, 50, 84)
      .text(COMPANY.address, 50, 96)
      .text(COMPANY.city, 50, 108)
      .text(`${COMPANY.email}  |  ${COMPANY.phone}`, 50, 120);

    // "NOTA DE CRÉDITO" — top right
    doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.black)
      .text('NOTA DE CRÉDITO', 340, 45, { width: 205, align: 'right' });
    doc.fontSize(9).font('Helvetica').fillColor(COLORS.mid)
      .text(`Pedido original: ${order.order_number}`, 340, 70, { width: 205, align: 'right' })
      .text(`Fecha pedido: ${fmtDate(order.created_at)}`, 340, 82, { width: 205, align: 'right' })
      .text(`Fecha abono: ${fmtDate(new Date())}`, 340, 94, { width: 205, align: 'right' });

    hLine(doc, 138);

    // Abono banner
    doc.rect(50, 146, 495, 24).fill(COLORS.bg);
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor(COLORS.dark)
      .text('ABONO POR DEVOLUCIÓN DE MERCANCÍA', 60, 153);

    // ───── CLIENT INFO ─────
    const billing = order.billing_address || order.shipping_address || {};
    const clientName = billing.name || `${billing.first_name || ''} ${billing.last_name || ''}`.trim() || order.customer_name || '';

    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.mid)
      .text('ABONADO A', 50, 185);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.black)
      .text(clientName, 50, 198);
    doc.fontSize(9).font('Helvetica').fillColor(COLORS.dark)
      .text(billing.address || '', 50, 212)
      .text(`${billing.postal_code || ''} ${billing.city || ''}`.trim(), 50, 224)
      .text(billing.country === 'ES' ? 'España' : (billing.country || ''), 50, 236);

    if (order.customer_email) {
      doc.fontSize(9).fillColor(COLORS.mid).text(order.customer_email, 50, 252);
    }

    // ───── ITEMS TABLE ─────
    const tableTop = 280;
    const colX = { name: 50, qty: 340, price: 400, total: 480 };

    // Header row
    doc.rect(50, tableTop, 495, 20).fill(COLORS.bg);
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(COLORS.mid);
    doc.text('PRODUCTO', colX.name + 5, tableTop + 6);
    doc.text('CANT.', colX.qty, tableTop + 6, { width: 50, align: 'center' });
    doc.text('P. UNIT.', colX.price, tableTop + 6, { width: 70, align: 'right' });
    doc.text('ABONO', colX.total, tableTop + 6, { width: 65, align: 'right' });

    let y = tableTop + 28;

    for (let i = 0; i < returnedItems.length; i++) {
      const item = returnedItems[i];
      const refundEur = (item.refund_amount || 0) / 100;
      const unitRefund = item.quantity > 0 ? refundEur / item.quantity : refundEur;
      const rowH = 30;

      if (i % 2 === 0) {
        doc.rect(50, y - 4, 495, rowH).fill('#fcfcfc');
      }

      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.black)
        .text(item.product_name || 'Producto', colX.name + 5, y, { width: 270 });

      const details: string[] = [];
      if (item.size) details.push(`Talla: ${item.size}`);
      if (item.color) details.push(`Color: ${item.color}`);
      if (details.length > 0) {
        doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.light)
          .text(details.join('  ·  '), colX.name + 5, y + 13, { width: 270 });
      }

      doc.font('Helvetica').fontSize(9).fillColor(COLORS.dark);
      doc.text(item.quantity.toString(), colX.qty, y + 4, { width: 50, align: 'center' });
      doc.text(`-${fmt(unitRefund)}`, colX.price, y + 4, { width: 70, align: 'right' });
      doc.font('Helvetica-Bold').fillColor(COLORS.black)
        .text(`-${fmt(refundEur)}`, colX.total, y + 4, { width: 65, align: 'right' });

      y += rowH;
      hLine(doc, y - 2);
    }

    // ───── TOTALS & IVA ─────
    y += 12;
    const tX = 350;
    const tV = 480;
    const tW = 65;

    doc.font('Helvetica').fontSize(9).fillColor(COLORS.dark);
    doc.text('Base imponible productos:', tX, y);
    doc.text(`-${fmt(itemsBase)}`, tV, y, { width: tW, align: 'right' });

    if (shippingRefund > 0) {
      y += 16;
      doc.text('Gastos de envío abonados (base):', tX, y);
      doc.text(`-${fmt(shippingBase)}`, tV, y, { width: tW, align: 'right' });
    }

    y += 20;
    hLine(doc, y, tX, 545);
    y += 8;

    doc.text('Base imponible total:', tX, y);
    doc.text(`-${fmt(totalBase)}`, tV, y, { width: tW, align: 'right' });
    y += 16;
    doc.text('IVA (21%):', tX, y);
    doc.text(`-${fmt(totalIva)}`, tV, y, { width: tW, align: 'right' });

    y += 22;
    doc.rect(tX - 10, y - 4, 215, 28).fill(COLORS.black);
    doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.white)
      .text('TOTAL ABONO', tX, y + 2)
      .text(`-${fmt(totalRefund)}`, tV - 20, y + 2, { width: 85, align: 'right' });

    // ───── RETURN DETAILS ─────
    doc.fillColor(COLORS.black);
    const detY = y + 50;

    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.mid)
      .text('DETALLES DE LA DEVOLUCIÓN', 50, detY);
    hLine(doc, detY + 12);

    doc.fontSize(9).font('Helvetica').fillColor(COLORS.dark);
    const reason = REASON_MAP[ret.reason] || ret.reason || 'No especificado';
    doc.text(`Motivo: ${reason}`, 50, detY + 20);
    if (ret.notes) {
      doc.text(`Notas: ${ret.notes}`, 50, detY + 34, { width: 495 });
    }

    doc.text('El reembolso se procesará al método de pago original en 5-7 días hábiles.', 50, detY + 54);
    if (order.stripe_payment_intent) {
      doc.fontSize(8).fillColor(COLORS.light)
        .text(`Ref. pago: …${order.stripe_payment_intent.slice(-8)}`, 50, detY + 70);
    }

    // ───── FOOTER ─────
    const footerY = 740;
    hLine(doc, footerY);

    doc.fontSize(7).font('Helvetica').fillColor(COLORS.light);
    doc.text(
      'Este documento es un abono / nota de crédito según RD 1619/2012. Los importes incluyen IVA.',
      50, footerY + 8, { width: 495, align: 'center' }
    );
    doc.text(
      `${COMPANY.legal}  ·  CIF: ${COMPANY.cif}  ·  ${COMPANY.address}, ${COMPANY.city}`,
      50, footerY + 20, { width: 495, align: 'center' }
    );

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);

        // Insert record (fire-and-forget)
        Promise.resolve(
          supabaseAdmin.from('credit_notes').insert({
            return_request_id: returnRequestId,
            original_order_id: originalOrderId,
            refund_amount: Math.round(totalRefund * 100),
            created_at: new Date().toISOString(),
          })
        ).catch((err: any) => logger.error('Error storing credit note:', err));

        resolve(
          new Response(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="abono-${order.order_number}.pdf"`,
            },
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
