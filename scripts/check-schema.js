import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

async function getTableInfo() {
  try {
    // Consultar información de la tabla products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(0);

    if (error) {
      console.error('Error:', error.message);
    } else {
      console.log('Columnas disponibles en products:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

getTableInfo();
