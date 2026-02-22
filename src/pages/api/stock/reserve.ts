/**
 * API: Reservar stock de forma atómica
 * Usa UPDATE condicionado (stock >= quantity) para evitar race conditions.
 * Notifica al admin automáticamente cuando el stock baja del umbral.
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

const LOW_STOCK_THRESHOLD = 10;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { variantId, quantity } = await request.json();
    
    if (!variantId || !quantity || quantity <= 0) {
      return new Response(
        JSON.stringify({ error: 'variantId y quantity (> 0) son requeridos' }),
        { status: 400 }
      );
    }

    // Obtener info del producto para mensajes de error y notificaciones
    const { data: variant, error: fetchError } = await supabaseAdmin
      .from('product_variants')
      .select('stock, color, size, product:products(name, slug)')
      .eq('id', variantId)
      .single();

    if (fetchError || !variant) {
      return new Response(
        JSON.stringify({ error: 'Variante no encontrada' }),
        { status: 404 }
      );
    }

    const variantData = variant as any;
    const productName = variantData.product?.name || 'Producto';
    const currentStock = variantData.stock;

    // Verificar stock suficiente ANTES del update
    if (currentStock < quantity) {
      return new Response(
        JSON.stringify({
          error: currentStock === 0
            ? `"${productName}" está agotado`
            : `Solo quedan ${currentStock} unidades de "${productName}"`,
          availableStock: currentStock,
          productName
        }),
        { status: 400 }
      );
    }

    // DESCONTAR STOCK ATÓMICO via RPC (usa FOR UPDATE en PostgreSQL, sin race conditions)
    const { error: rpcError } = await supabaseAdmin.rpc('decrease_stock', {
      p_variant_id: variantId,
      p_quantity: quantity
    });

    if (rpcError) {
      // La RPC lanza excepción si stock insuficiente — releer para info precisa
      const { data: fresh } = await supabaseAdmin
        .from('product_variants')
        .select('stock')
        .eq('id', variantId)
        .single();
      const freshStock = (fresh as any)?.stock ?? 0;

      return new Response(
        JSON.stringify({
          error: freshStock === 0
            ? `"${productName}" se ha agotado`
            : `Solo quedan ${freshStock} unidades de "${productName}"`,
          availableStock: freshStock,
          productName
        }),
        { status: 400 }
      );
    }

    const newStock = currentStock - quantity;

    // Registrar cambio en stock_change_log (no bloquear si falla)
    Promise.resolve(
      supabaseAdmin
        .from('stock_change_log')
        .insert({
          product_id: variantId,
          previous_stock: currentStock,
          new_stock: newStock,
          reason: 'reserve_cart'
        })
    ).catch((e: any) => logger.warn('Error logging stock change:', e));

    logger.info('Stock reservado (RPC atómico)', { variantId, quantity, newStock });

    // Notificar al admin si el stock bajó del umbral (fire-and-forget)
    if (newStock <= LOW_STOCK_THRESHOLD) {
      notifyLowStock(variantData, newStock).catch(e =>
        logger.warn('Error enviando notificación de stock bajo:', e)
      );
    }

    return new Response(
      JSON.stringify({ success: true, newStock }),
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Error reservando stock:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
};

/**
 * Notifica al admin por email cuando el stock baja del umbral
 */
async function notifyLowStock(variantData: any, currentStock: number) {
  const productName = variantData.product?.name || 'Producto desconocido';
  const detail = [variantData.color, variantData.size].filter(Boolean).join(' / ');
  const stockText = currentStock === 0 ? 'AGOTADO' : `${currentStock} unidades`;

  logger.warn(`⚠️ STOCK BAJO: ${productName} (${detail}) - ${stockText}`);

  try {
    const nodemailer = await import('nodemailer');
    const gmailUser = import.meta.env.GMAIL_USER || process.env.GMAIL_USER;
    const gmailPassword = import.meta.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
    const adminEmail = import.meta.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || gmailUser;

    if (!gmailUser || !gmailPassword || !adminEmail) {
      logger.warn('Variables de email no configuradas, no se puede enviar alerta de stock');
      return;
    }

    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPassword },
      tls: { rejectUnauthorized: false },
    });

    const isOutOfStock = currentStock === 0;
    const baseUrl = import.meta.env.PUBLIC_APP_URL || process.env.PUBLIC_APP_URL || '';
    await transporter.sendMail({
      from: gmailUser,
      to: adminEmail,
      subject: isOutOfStock
        ? `PRODUCTO AGOTADO: ${productName} (${detail})`
        : `Stock bajo: ${productName} (${detail}) - ${currentStock} uds`,
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #404040; background-color: #f5f5f5; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #171717; color: #ffffff; padding: 32px 40px; text-align: center;">
      <h1 style="font-size: 13px; letter-spacing: 4px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px;">Essential Force</h1>
      <p style="font-size: 12px; color: #a3a3a3; font-weight: 300; margin: 0;">${isOutOfStock ? 'Alerta: producto agotado' : 'Alerta: stock bajo'}</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px;">
      <p style="font-size: 15px; color: #171717; margin: 0 0 24px;">${isOutOfStock ? 'Un producto se ha agotado y requiere atención inmediata.' : 'El stock de un producto ha bajado del umbral mínimo.'}</p>

      <div style="font-size: 11px; letter-spacing: 2px; font-weight: 600; text-transform: uppercase; color: #737373; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #e5e5e5;">Detalles del producto</div>
      <div style="background-color: #fafafa; border: 1px solid #e5e5e5; padding: 16px 20px; margin-bottom: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 4px 0; color: #737373; font-size: 13px;">Producto</td>
            <td style="padding: 4px 0; color: #171717; font-weight: 500; font-size: 13px; text-align: right;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #737373; font-size: 13px;">Variante</td>
            <td style="padding: 4px 0; color: #171717; font-weight: 500; font-size: 13px; text-align: right;">${detail || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #737373; font-size: 13px;">Stock actual</td>
            <td style="padding: 4px 0; color: #171717; font-weight: 700; font-size: 16px; text-align: right;">${stockText}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${baseUrl}/admin/inventario?filter=${isOutOfStock ? 'out' : 'low'}" style="display: inline-block; background-color: #171717; color: #ffffff; padding: 12px 36px; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">Reabastecer ahora</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #fafafa; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
      <p style="font-size: 11px; color: #a3a3a3; margin: 0;">
        © ${new Date().getFullYear()} Essential Force — Notificación automática de inventario.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    logger.info('Email de stock bajo enviado al admin', { productName, currentStock });
  } catch (e) {
    logger.warn('No se pudo enviar email de stock bajo:', e);
  }
}
