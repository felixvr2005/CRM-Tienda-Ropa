import { logger } from '@lib/logger';
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabaseAdmin } from '@lib/supabase';

export const prerender = false;

/**
 * API para sincronizar precios de Stripe con la base de datos
 * PUT /api/admin/products/sync-stripe-prices
 */
export const PUT: APIRoute = async ({ request }) => {
  try {
    // Verificar que sea una solicitud autenticada (admin)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

    // Obtener todos los productos con sus variantes
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        price,
        stripe_product_id,
        variants:product_variants(
          id,
          color,
          size,
          price,
          stripe_price_id
        )
      `);

    if (error) {
      throw new Error(`Error obteniendo productos: ${error.message}`);
    }

    const results = {
      total: 0,
      synced: 0,
      errors: [] as string[],
      details: [] as any[]
    };

    for (const product of products as any[]) {
      results.total++;

      if (!product.stripe_product_id) {
        results.errors.push(`${product.name}: sin stripe_product_id`);
        continue;
      }

      // Sincronizar cada variante
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants as any[]) {
          const priceInCents = Math.round(variant.price * 100);

          if (variant.stripe_price_id) {
            // Actualizar metadatos del precio existente
            try {
              await stripe.prices.update(variant.stripe_price_id, {
                metadata: {
                  sync_date: new Date().toISOString(),
                  price_eur: variant.price.toString(),
                  color: variant.color || '',
                  size: variant.size || ''
                }
              });

              results.synced++;
              results.details.push({
                product: product.name,
                variant: `${variant.color}/${variant.size}`,
                price: `€${variant.price}`,
                status: 'synced'
              });
            } catch (err: any) {
              results.errors.push(`${product.name} (${variant.color}/${variant.size}): ${err.message}`);
            }
          }
        }
      } else {
        // Sincronizar precio base del producto
        const priceInCents = Math.round(product.price * 100);

        const stripePrices = await stripe.prices.list({
          product: product.stripe_product_id,
          active: true,
          limit: 1
        });

        if (stripePrices.data.length > 0) {
          const stripePrice = stripePrices.data[0];

          try {
            // Si el precio es diferente, crear uno nuevo
            if (stripePrice.unit_amount !== priceInCents) {
              // Archivar el precio antiguo
              await stripe.prices.update(stripePrice.id, { active: false });

              // Crear nuevo precio
              const newPrice = await stripe.prices.create({
                product: product.stripe_product_id,
                unit_amount: priceInCents,
                currency: 'eur',
                metadata: {
                  sync_date: new Date().toISOString(),
                  price_eur: product.price.toString()
                }
              });

              // Actualizar en la BD
              await supabaseAdmin
                .from('products')
                .update({ stripe_price_id: newPrice.id })
                .eq('id', product.id);

              results.synced++;
              results.details.push({
                product: product.name,
                oldPrice: `${stripePrice.unit_amount / 100}€`,
                newPrice: `€${product.price}`,
                status: 'updated'
              });
            } else {
              results.synced++;
              results.details.push({
                product: product.name,
                price: `€${product.price}`,
                status: 'already_correct'
              });
            }
          } catch (err: any) {
            results.errors.push(`${product.name}: ${err.message}`);
          }
        }
      }
    }

    logger.info('Sync results:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sincronización completada: ${results.synced}/${results.total} sincronizados`,
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    logger.error('Error en sync-stripe-prices:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al sincronizar precios' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
