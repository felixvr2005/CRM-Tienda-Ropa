import Stripe from 'stripe';
import { supabaseAdmin } from '../src/lib/supabase.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function syncProductPrices() {
  console.log('🔄 Sincronizando precios de productos con Stripe...\n');

  try {
    // Obtener todos los productos de la base de datos
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        price,
        stripe_product_id,
        variants:product_variants(
          id,
          price,
          stripe_price_id
        )
      `);

    if (error) {
      console.error('❌ Error obteniendo productos:', error);
      return;
    }

    console.log(`📦 Encontrados ${products.length} productos\n`);

    for (const product of products as any[]) {
      console.log(`\n📝 Procesando: ${product.name}`);
      console.log(`   Precio base BD: €${product.price}`);
      
      if (!product.stripe_product_id) {
        console.log(`   ⚠️  Sin stripe_product_id - Saltando`);
        continue;
      }

      // Obtener precios actuales en Stripe
      const stripePrices = await stripe.prices.list({
        product: product.stripe_product_id,
        active: true,
        limit: 10
      });

      console.log(`   Precios actuales en Stripe: ${stripePrices.data.length}`);

      // Si hay variantes, actualizar precios de variantes
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants as any[]) {
          if (!variant.stripe_price_id) {
            console.log(`   ⚠️  Variante sin stripe_price_id`);
            continue;
          }

          const priceInCents = Math.round(variant.price * 100);
          console.log(`     - Variante: €${variant.price} → ${priceInCents} céntimos`);

          try {
            // Actualizar el precio
            await stripe.prices.update(variant.stripe_price_id, {
              metadata: {
                updated_at: new Date().toISOString(),
                original_price_eur: variant.price.toString()
              }
            });
            console.log(`     ✅ Actualizado`);
          } catch (err: any) {
            console.error(`     ❌ Error: ${err.message}`);
          }
        }
      } else {
        // Actualizar el precio base del producto
        const priceInCents = Math.round(product.price * 100);
        console.log(`   Precio base en céntimos: ${priceInCents}`);

        // Buscar si hay un precio activo
        if (stripePrices.data.length > 0) {
          const activePrice = stripePrices.data[0];
          console.log(`   Precio actual en Stripe: ${activePrice.unit_amount} céntimos`);
          
          if (activePrice.unit_amount !== priceInCents) {
            console.log(`   ❌ DIFERENCIA DETECTADA: Esperado ${priceInCents}, Actual ${activePrice.unit_amount}`);
            console.log(`   💡 Solución: Archiva el precio anterior e crea uno nuevo`);
          } else {
            console.log(`   ✅ Precio correcto`);
          }
        }
      }
    }

    console.log('\n✅ Sincronización completada');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

syncProductPrices().then(() => process.exit(0));
