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

// Colores disponibles
const colors = [
  { name: 'Rojo', hex: '#DC2626' },
  { name: 'Azul', hex: '#2563EB' },
  { name: 'Negro', hex: '#000000' },
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Verde', hex: '#16A34A' },
];

// Obtener todas las variantes
const response = await fetch(
  `${supabaseUrl}/rest/v1/product_variants?select=id,size`,
  {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    }
  }
);

const variants = await response.json();
console.log(`Encontradas ${variants.length} variantes`);

// Asignar colores (rotarlos)
let colorIndex = 0;
for (const variant of variants) {
  const color = colors[colorIndex % colors.length];
  
  const updateResponse = await fetch(
    `${supabaseUrl}/rest/v1/product_variants?id=eq.${variant.id}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        color: color.name,
        color_hex: color.hex
      })
    }
  );

  if (updateResponse.ok) {
    console.log(`✓ Actualizado: ${variant.id.substring(0,8)} -> ${color.name}`);
  } else {
    console.error(`✗ Error al actualizar ${variant.id}:`, await updateResponse.text());
  }
  
  colorIndex++;
}

console.log('\n✅ Actualización completada');
