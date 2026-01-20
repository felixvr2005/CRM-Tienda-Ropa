/**
 * Script para arreglar órdenes con total_amount nulo
 * Recalcula el total basándose en subtotal + shipping_cost - discount_amount
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOrderTotals() {
  console.log('🔧 Iniciando reparación de órdenes con total_amount nulo...');
  
  try {
    // Obtener todas las órdenes con total_amount nulo
    const { data: ordersWithNullTotal, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .is('total_amount', null);

    if (fetchError) {
      console.error('❌ Error fetching orders:', fetchError);
      return;
    }

    console.log(`📊 Encontradas ${ordersWithNullTotal?.length || 0} órdenes con total_amount nulo`);

    if (!ordersWithNullTotal || ordersWithNullTotal.length === 0) {
      console.log('✅ No hay órdenes para reparar');
      return;
    }

    // Actualizar cada orden
    for (const order of ordersWithNullTotal) {
      const subtotal = order.subtotal || 0;
      const shippingCost = order.shipping_cost || 0;
      const discountAmount = order.discount_amount || 0;
      const totalAmount = subtotal + shippingCost - discountAmount;

      console.log(`🔄 Actualizando orden ${order.order_number}: ${totalAmount}€`);

      const { error: updateError } = await supabase
        .from('orders')
        .update({ total_amount: totalAmount })
        .eq('id', order.id);

      if (updateError) {
        console.error(`❌ Error updating order ${order.order_number}:`, updateError);
      } else {
        console.log(`✅ Orden ${order.order_number} actualizada`);
      }
    }

    console.log('✨ Reparación completada');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
fixOrderTotals();
