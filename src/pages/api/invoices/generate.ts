import { logger } from '@lib/logger';
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import PDFDocument from 'pdfkit';

export const prerender = false;

// ── Constantes de diseño ──
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
  web: 'www.essentialforce.com',
};

const IVA_RATE = 0.21;

// ── Helpers ──
function fmt(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' €';
}

function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

/** Fetch remote image to buffer (for product thumbnails in PDF) */
async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  } catch {
    return null;
  }
}

/** Draw a thin horizontal line */
function hLine(doc: PDFKit.PDFDocument, y: number, x1 = 50, x2 = 545) {
  doc.strokeColor(COLORS.subtle).lineWidth(0.5)
    .moveTo(x1, y).lineTo(x2, y).stroke()
    .strokeColor(COLORS.black).lineWidth(1);
}

// ═══════════════════════════════════════════════
// GET /api/invoices/generate?orderId=xxx
// ═══════════════════════════════════════════════
export const GET: APIRoute = async ({ url, request }) => {
  try {
    const orderId = url.searchParams.get('orderId');
    const authHeader = request.headers.get('authorization');

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Order ID requerido' }), { status: 400 });
    }
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    // ── Data ──
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders').select('*').eq('id', orderId).single();
    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Orden no encontrada' }), { status: 404 });
    }

    const { data: orderItems } = await supabaseAdmin
      .from('order_items').select('*').eq('order_id', orderId);
    if (!orderItems) {
      return new Response(JSON.stringify({ error: 'Error obteniendo items' }), { status: 500 });
    }

    const o = order as any;

    // Pre-fetch product images in parallel
    const imageBuffers = new Map<number, Buffer>();
    await Promise.all(
      orderItems.map(async (item: any, idx: number) => {
        const imgUrl = item.product_image || null;
        if (imgUrl) {
          const buf = await fetchImageBuffer(imgUrl);
          if (buf) imageBuffers.set(idx, buf);
        }
      })
    );

    // ── Cálculos fiscales ──
    const totalAmount = o.total_amount || 0;
    const discount = o.discount_amount || 0;
    const shipping = o.shipping_cost || 0;

    // Items subtotal (before discount, incl. IVA)
    const itemsTotal = orderItems.reduce((sum: number, item: any) => {
      return sum + (item.line_total || item.total_price || ((item.unit_price || 0) * item.quantity));
    }, 0);

    // Desglose IVA (precios incluyen IVA)
    const itemsBase = +(itemsTotal / (1 + IVA_RATE)).toFixed(2);
    const itemsIva = +(itemsTotal - itemsBase).toFixed(2);

    const shippingBase = +(shipping / (1 + IVA_RATE)).toFixed(2);
    const shippingIva = +(shipping - shippingBase).toFixed(2);

    const discountBase = +(discount / (1 + IVA_RATE)).toFixed(2);
    const discountIva = +(discount - discountBase).toFixed(2);

    const totalBase = +(itemsBase + shippingBase - discountBase).toFixed(2);
    const totalIva = +(itemsIva + shippingIva - discountIva).toFixed(2);

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

    // "FACTURA" badge top-right
    doc.fontSize(24).font('Helvetica-Bold').fillColor(COLORS.black)
      .text('FACTURA', 400, 45, { width: 145, align: 'right' });
    doc.fontSize(9).font('Helvetica').fillColor(COLORS.mid)
      .text(`Nº factura: ${o.order_number}`, 350, 75, { width: 195, align: 'right' })
      .text(`Fecha: ${fmtDate(o.created_at)}`, 350, 87, { width: 195, align: 'right' })
      .text(`Método de pago: ${o.payment_method === 'stripe' ? 'Tarjeta' : (o.payment_method || 'Tarjeta')}`, 350, 99, { width: 195, align: 'right' });

    hLine(doc, 142);

    // ───── CLIENT INFO ─────
    const billing = o.billing_address || o.shipping_address || {};
    const clientName = billing.name || `${billing.first_name || ''} ${billing.last_name || ''}`.trim() || o.customer_name || '';

    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.mid)
      .text('FACTURADO A', 50, 155);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.black)
      .text(clientName, 50, 168);
    doc.fontSize(9).font('Helvetica').fillColor(COLORS.dark)
      .text(billing.address || '', 50, 182)
      .text(`${billing.postal_code || ''} ${billing.city || ''}`.trim(), 50, 194)
      .text(billing.state || '', 50, 206)
      .text(billing.country === 'ES' ? 'España' : (billing.country || ''), 50, 218);

    if (o.customer_email) {
      doc.fontSize(9).fillColor(COLORS.mid).text(o.customer_email, 50, 234);
    }

    // ───── ITEMS TABLE ─────
    const tableTop = 265;
    const colX = { img: 50, name: 95, qty: 340, price: 400, total: 480 };

    // Table header
    doc.rect(50, tableTop, 495, 20).fill(COLORS.bg);
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(COLORS.mid);
    doc.text('PRODUCTO', colX.name, tableTop + 6);
    doc.text('CANT.', colX.qty, tableTop + 6, { width: 50, align: 'center' });
    doc.text('PRECIO', colX.price, tableTop + 6, { width: 70, align: 'right' });
    doc.text('TOTAL', colX.total, tableTop + 6, { width: 65, align: 'right' });

    let y = tableTop + 28;

    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i] as any;
      const unitPrice = item.unit_price || item.price || 0;
      const lineTotal = item.line_total || item.total_price || (unitPrice * item.quantity);
      const rowHeight = 40;

      // Alternate row bg
      if (i % 2 === 0) {
        doc.rect(50, y - 4, 495, rowHeight).fill('#fcfcfc');
      }

      // Product image thumbnail
      const imgBuf = imageBuffers.get(i);
      if (imgBuf) {
        try {
          doc.image(imgBuf, colX.img, y - 2, { width: 34, height: 34, fit: [34, 34] });
        } catch { /* skip if image fails */ }
      } else {
        // Placeholder box
        doc.rect(colX.img, y - 2, 34, 34).fillAndStroke(COLORS.bg, COLORS.subtle);
      }

      // Product info
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.black)
        .text(item.product_name || 'Producto', colX.name, y, { width: 230 });
      
      const details: string[] = [];
      if (item.size) details.push(`Talla: ${item.size}`);
      if (item.color) details.push(`Color: ${item.color}`);
      if (item.product_sku) details.push(`SKU: ${item.product_sku}`);
      if (details.length > 0) {
        doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.light)
          .text(details.join('  ·  '), colX.name, y + 13, { width: 230 });
      }

      // Qty, price, total
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.dark);
      doc.text(item.quantity.toString(), colX.qty, y + 4, { width: 50, align: 'center' });
      doc.text(fmt(unitPrice), colX.price, y + 4, { width: 70, align: 'right' });
      doc.font('Helvetica-Bold').fillColor(COLORS.black)
        .text(fmt(lineTotal), colX.total, y + 4, { width: 65, align: 'right' });

      y += rowHeight;
      hLine(doc, y - 4);
    }

    // ───── TOTALS & IVA BREAKDOWN ─────
    y += 8;
    const totalsX = 350;
    const totalsValX = 480;
    const totalsW = 65;

    doc.font('Helvetica').fontSize(9).fillColor(COLORS.dark);
    doc.text('Base imponible productos:', totalsX, y);
    doc.text(fmt(itemsBase), totalsValX, y, { width: totalsW, align: 'right' });

    if (discount > 0) {
      y += 16;
      doc.fillColor('#991b1b').text(`Descuento${o.coupon_code ? ` (${o.coupon_code})` : ''}:`, totalsX, y);
      doc.text(`-${fmt(discountBase)}`, totalsValX, y, { width: totalsW, align: 'right' });
      doc.fillColor(COLORS.dark);
    }

    if (shipping > 0) {
      y += 16;
      doc.text('Gastos de envío (base):', totalsX, y);
      doc.text(fmt(shippingBase), totalsValX, y, { width: totalsW, align: 'right' });
    } else {
      y += 16;
      doc.text('Gastos de envío:', totalsX, y);
      doc.fillColor(COLORS.mid).text('Gratis', totalsValX, y, { width: totalsW, align: 'right' });
      doc.fillColor(COLORS.dark);
    }

    y += 20;
    hLine(doc, y, totalsX, 545);
    y += 8;

    // IVA summary
    doc.text('Base imponible total:', totalsX, y);
    doc.text(fmt(totalBase), totalsValX, y, { width: totalsW, align: 'right' });
    y += 16;
    doc.text('IVA (21%):', totalsX, y);
    doc.text(fmt(totalIva), totalsValX, y, { width: totalsW, align: 'right' });

    y += 22;
    // Total box
    doc.rect(totalsX - 10, y - 4, 215, 28).fill(COLORS.black);
    doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.white)
      .text('TOTAL', totalsX, y + 2)
      .text(fmt(totalAmount), totalsValX - 20, y + 2, { width: 85, align: 'right' });

    // ───── FOOTER ─────
    doc.fillColor(COLORS.black);
    const footerY = 740;
    hLine(doc, footerY);

    doc.fontSize(7).font('Helvetica').fillColor(COLORS.light);
    doc.text(
      'Los precios incluyen IVA. Este documento sirve como factura simplificada según el RD 1619/2012.',
      50, footerY + 8, { width: 495, align: 'center' }
    );
    doc.text(
      `${COMPANY.legal}  ·  CIF: ${COMPANY.cif}  ·  ${COMPANY.address}, ${COMPANY.city}`,
      50, footerY + 20, { width: 495, align: 'center' }
    );
    doc.text(
      'Sus datos personales están protegidos según el RGPD (UE) 2016/679.',
      50, footerY + 32, { width: 495, align: 'center' }
    );

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(
          new Response(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="factura-${o.order_number}.pdf"`,
            },
          })
        );
      });
    });
  } catch (error) {
    logger.error('Invoice generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Error generando factura' }),
      { status: 500 }
    );
  }
};
