#!/usr/bin/env node

/**
 * Script para arreglar órdenes con total_amount NULL
 * Ejecutar: node scripts/fix-totals.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Falta PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTotals() {
  console.log('🔧 Iniciando reparación de órdenes...\n');

  try {
    // 1. Obtener órdenes con total_amount NULL
    console.log('📊 Buscando órdenes con total_amount NULL...');
    const { data: ordersWithNull, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, subtotal, shipping_cost, discount_amount')
      .is('total_amount', null)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error:', fetchError.message);
      process.exit(1);
    }

    if (!ordersWithNull || ordersWithNull.length === 0) {
      console.log('✅ No hay órdenes para reparar\n');
      process.exit(0);
    }

    console.log(`✅ Encontradas ${ordersWithNull.length} órdenes\n`);

    // 2. Actualizar cada orden
    let updated = 0;
    let failed = 0;

    for (const order of ordersWithNull) {
      const subtotal = order.subtotal || 0;
      const shippingCost = order.shipping_cost || 0;
      const discountAmount = order.discount_amount || 0;
      const totalAmount = subtotal + shippingCost - discountAmount;

      console.log(`🔄 ${order.order_number}: ${subtotal}€ + ${shippingCost}€ - ${discountAmount}€ = ${totalAmount}€`);

      const { error: updateError } = await supabase
        .from('orders')
        .update({ total_amount: totalAmount })
        .eq('id', order.id);

      if (updateError) {
        console.log(`   ❌ Error: ${updateError.message}`);
        failed++;
      } else {
        console.log(`   ✅ Actualizado`);
        updated++;
      }
    }

    console.log(`\n✨ Resumen:`);
    console.log(`   ✅ Actualizadas: ${updated}`);
    console.log(`   ❌ Errores: ${failed}`);
    console.log(`   📊 Total: ${updated + failed}\n`);

    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixTotals();
