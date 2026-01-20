import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

async function cleanDatabase() {
  try {
    console.log('🗑️  Limpiando base de datos...\n');

    // Eliminar todos los productos
    console.log('Eliminando productos...');
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (productsError) {
      console.error('Error eliminando productos:', productsError.message);
    } else {
      console.log('✅ Productos eliminados');
    }

    // Eliminar todas las categorías creadas (excepto las predeterminadas)
    console.log('Eliminando categorías...');
    const { error: categoriesError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (categoriesError) {
      console.error('Error eliminando categorías:', categoriesError.message);
    } else {
      console.log('✅ Categorías eliminadas');
    }

    console.log('\n✅ Base de datos limpia');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanDatabase();
