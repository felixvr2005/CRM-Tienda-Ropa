import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars['PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_KEY'];

const response = await fetch(
  `${supabaseUrl}/rest/v1/product_variants?select=id,color,color_hex&limit=100`,
  {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    }
  }
);

const variants = await response.json();
console.log('COLORES EN BASE DE DATOS:');
variants.forEach(v => {
  console.log(`- ID: ${v.id.substring(0, 8)}... Color: "${v.color}" (${v.color_hex})`);
});
