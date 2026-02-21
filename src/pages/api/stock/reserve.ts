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

    // UPDATE ATÓMICO: solo actualiza si stock >= quantity (evita race conditions)
    const newStock = currentStock - quantity;
    const { error: updateError, count } = await supabaseAdmin
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', variantId)
      .gte('stock', quantity);

    // Si count === 0, otro usuario reservó primero (race condition detectada)
    if (updateError || count === 0) {
      // Re-leer stock actual para dar info precisa
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

    logger.info('Stock reservado (atómico)', { variantId, quantity, newStock });

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
    await transporter.sendMail({
      from: gmailUser,
      to: adminEmail,
      subject: isOutOfStock
        ? `🚨 PRODUCTO AGOTADO: ${productName} (${detail})`
        : `⚠️ Stock bajo: ${productName} (${detail}) - ${currentStock} uds`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: ${isOutOfStock ? '#dc2626' : '#f59e0b'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">${isOutOfStock ? '🚨 Producto Agotado' : '⚠️ Stock Bajo'}</h2>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
            <p><strong>Producto:</strong> ${productName}</p>
            <p><strong>Variante:</strong> ${detail || 'N/A'}</p>
            <p><strong>Stock actual:</strong> <span style="color: ${isOutOfStock ? '#dc2626' : '#f59e0b'}; font-weight: bold;">${stockText}</span></p>
            <p style="margin-top: 15px;"><a href="${import.meta.env.PUBLIC_APP_URL || process.env.PUBLIC_APP_URL || ''}/admin/inventario?filter=${isOutOfStock ? 'out' : 'low'}" style="background: #1f2937; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reabastecer ahora</a></p>
          </div>
        </div>
      `,
    });

    logger.info('Email de stock bajo enviado al admin', { productName, currentStock });
  } catch (e) {
    logger.warn('No se pudo enviar email de stock bajo:', e);
  }
}
