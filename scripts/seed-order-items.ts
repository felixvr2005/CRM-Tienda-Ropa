import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Datos de ejemplo para order_items
const orderItemsData = [
  {
    order_number: '000001',
    items: [
      {
        product_name: 'Camisa Oxford Premium',
        product_slug: 'camisa-oxford-premium',
        product_image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
        size: 'M',
        color: 'Azul',
        quantity: 1,
        unit_price: 49.99,
        discount_percentage: 0,
        line_total: 49.99
      }
    ]
  },
  {
    order_number: '000002',
    items: [
      {
        product_name: 'Pantalón Chino Clásico',
        product_slug: 'pantalon-chino-clasico',
        product_image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
        size: 'L',
        color: 'Beige',
        quantity: 1,
        unit_price: 59.99,
        discount_percentage: 0,
        line_total: 59.99
      },
      {
        product_name: 'Corbata de Seda',
        product_slug: 'corbata-de-seda',
        product_image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        size: 'Única',
        color: 'Rojo',
        quantity: 1,
        unit_price: 29.99,
        discount_percentage: 0,
        line_total: 29.99
      }
    ]
  },
  {
    order_number: '000003',
    items: [
      {
        product_name: 'Chaqueta de Lana',
        product_slug: 'chaqueta-de-lana',
        product_image: 'https://images.unsplash.com/photo-1539533057440-7814a84ee346?w=400',
        size: 'XL',
        color: 'Negro',
        quantity: 1,
        unit_price: 129.99,
        discount_percentage: 10,
        line_total: 116.99
      }
    ]
  },
  {
    order_number: '000004',
    items: [
      {
        product_name: 'Sudadera Premium',
        product_slug: 'sudadera-premium',
        product_image: 'https://images.unsplash.com/photo-1556821552-17ae9d9a6a4e?w=400',
        size: 'M',
        color: 'Gris',
        quantity: 2,
        unit_price: 49.99,
        discount_percentage: 0,
        line_total: 99.98
      }
    ]
  },
  {
    order_number: '000005',
    items: [
      {
        product_name: 'Jeans Premium',
        product_slug: 'jeans-premium',
        product_image: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400',
        size: '32',
        color: 'Azul Oscuro',
        quantity: 1,
        unit_price: 79.99,
        discount_percentage: 0,
        line_total: 79.99
      }
    ]
  },
  {
    order_number: '000006',
    items: [
      {
        product_name: 'Camisa Casual',
        product_slug: 'camisa-casual',
        product_image: 'https://images.unsplash.com/photo-1598032895949-41a0a8c6ebd7?w=400',
        size: 'M',
        color: 'Blanco',
        quantity: 1,
        unit_price: 39.99,
        discount_percentage: 0,
        line_total: 39.99
      },
      {
        product_name: 'Cinturón de Cuero',
        product_slug: 'cinturon-de-cuero',
        product_image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
        size: 'M',
        color: 'Marrón',
        quantity: 1,
        unit_price: 34.99,
        discount_percentage: 0,
        line_total: 34.99
      }
    ]
  }
];

async function seedOrderItems() {
  console.log('📦 Iniciando población de order_items...\n');

  try {
    for (const orderData of orderItemsData) {
      // Obtener el order_id basado en order_number
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderData.order_number)
        .single();

      if (orderError || !order) {
        console.log(`❌ Orden ${orderData.order_number} no encontrada`);
        continue;
      }

      console.log(`📥 Procesando orden ${orderData.order_number} (ID: ${order.id})`);

      // Insertar cada item
      for (const item of orderData.items) {
        const { error: insertError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_name: item.product_name,
            product_slug: item.product_slug,
            product_image: item.product_image,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_percentage: item.discount_percentage,
            line_total: item.line_total
          });

        if (insertError) {
          console.log(`  ❌ Error insertando ${item.product_name}: ${insertError.message}`);
        } else {
          console.log(`  ✅ ${item.product_name} (x${item.quantity})`);
        }
      }

      console.log();
    }

    // Verificar datos insertados
    const { data: allItems, error: checkError } = await supabase
      .from('order_items')
      .select('id, order_id, product_name')
      .limit(10);

    if (!checkError && allItems) {
      console.log(`\n✅ Total de order_items en BD: ${allItems.length}`);
      console.log('📋 Primeros items:');
      allItems.forEach(item => {
        console.log(`   - ${item.product_name}`);
      });
    }

    console.log('\n✅ Población de order_items completada!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

seedOrderItems();
