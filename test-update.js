import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Obtener un producto
const { data: product } = await supabase
  .from('products')
  .select('id, name, price, compare_at_price, discount_percentage')
  .limit(1)
  .single();

console.log('Current product:', {
  id: product.id,
  name: product.name,
  price: product.price,
  priceInEuros: product.price / 100,
  compare_at_price: product.compare_at_price,
  compareAtPriceInEuros: product.compare_at_price ? product.compare_at_price / 100 : null,
  discount_percentage: product.discount_percentage,
});

// Simular lo que hace el formulario - enviar 15€
const updateData = {
  name: product.name + ' - PRUEBA',
  price: 15, // euros
  compare_at_price: product.compare_at_price ? product.compare_at_price / 100 : null,
};

console.log('\nData to send (en euros):', updateData);

// Convertir a céntimos como hace el endpoint
const updateDataCents = {
  ...updateData,
  price: Math.round(updateData.price * 100),
  compare_at_price: updateData.compare_at_price ? Math.round(updateData.compare_at_price * 100) : null,
};

console.log('Data converted to cents:', updateDataCents);

// Actualizar
const { error } = await supabase
  .from('products')
  .update(updateDataCents)
  .eq('id', product.id);

if (error) {
  console.error('Error:', error);
} else {
  console.log('✅ Producto actualizado correctamente');
  
  // Verificar el resultado
  const { data: updated } = await supabase
    .from('products')
    .select('price, compare_at_price')
    .eq('id', product.id)
    .single();
  
  console.log('\nResultado en BD:', {
    price: updated.price,
    priceInEuros: updated.price / 100,
    compare_at_price: updated.compare_at_price,
    compareAtPriceInEuros: updated.compare_at_price ? updated.compare_at_price / 100 : null,
  });
}
