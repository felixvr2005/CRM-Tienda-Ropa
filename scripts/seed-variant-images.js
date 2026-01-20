/**
 * Script para poblar variant_images con datos de prueba
 * Este script agrega imágenes de ejemplo para cada variante existente
 */

const fs = require('fs');
const path = require('path');

// Leer variables de entorno del archivo .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars['PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan las variables de entorno PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

// Imágenes de prueba por color
const imagesByColor = {
  'Rojo': [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', // Rojo frontal
    'https://images.unsplash.com/photo-1595777707802-c79ee79e5b2a?w=800&q=80', // Rojo back
    'https://images.unsplash.com/photo-1591280695259-6f6b2bcf7d5d?w=800&q=80', // Rojo detalle
  ],
  'Azul': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', // Azul frontal
    'https://images.unsplash.com/photo-1503342217505-1f3f5b52f63d?w=800&q=80', // Azul back
    'https://images.unsplash.com/photo-1548126328-c9fa89d128fa?w=800&q=80', // Azul detalle
  ],
  'Negro': [
    'https://images.unsplash.com/photo-1585487897553-7d1c55dbbdca?w=800&q=80', // Negro frontal
    'https://images.unsplash.com/photo-1584455604694-1dac5a7a7bb1?w=800&q=80', // Negro back
    'https://images.unsplash.com/photo-1556821552-5a0d7f56aae5?w=800&q=80', // Negro detalle
  ],
  'Blanco': [
    'https://images.unsplash.com/photo-1605777927133-1c1404cc0e6f?w=800&q=80', // Blanco frontal
    'https://images.unsplash.com/photo-1598618645979-ca6f0f4c06af?w=800&q=80', // Blanco back
    'https://images.unsplash.com/photo-1559163113-ce2ecca39645?w=800&q=80', // Blanco detalle
  ],
  'Verde': [
    'https://images.unsplash.com/photo-1616396895615-db6595f59e6b?w=800&q=80', // Verde frontal
    'https://images.unsplash.com/photo-1573275254698-ef249a8a20df?w=800&q=80', // Verde back
    'https://images.unsplash.com/photo-1553839739-3d1fbfab7e50?w=800&q=80', // Verde detalle
  ],
  'Rosa': [
    'https://images.unsplash.com/photo-1598618645979-ca6f0f4c06af?w=800&q=80', // Rosa frontal
    'https://images.unsplash.com/photo-1610797235074-8b8e4a84a4f3?w=800&q=80', // Rosa back
    'https://images.unsplash.com/photo-1572804786901-5e7e1fd04da5?w=800&q=80', // Rosa detalle
  ],
};

async function seedVariantImages() {
  try {
    console.log('Iniciando... Obteniendo variantes existentes');

    // Obtener todas las variantes
    const variantResponse = await fetch(
      `${supabaseUrl}/rest/v1/product_variants?select=id,color`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    );

    if (!variantResponse.ok) {
      console.error('Error obteniendo variantes:', variantResponse.statusText);
      return;
    }

    const variants = await variantResponse.json();
    console.log(`✓ Se encontraron ${variants.length} variantes`);

    // Agrupar por color
    const variantsByColor = {};
    variants.forEach(v => {
      if (!variantsByColor[v.color]) {
        variantsByColor[v.color] = [];
      }
      variantsByColor[v.color].push(v.id);
    });

    console.log('Colores encontrados:', Object.keys(variantsByColor).join(', '));

    // Insertar imágenes para cada variante
    let totalImages = 0;
    let addedImages = 0;

    for (const [color, variantIds] of Object.entries(variantsByColor)) {
      const images = imagesByColor[color] || imagesByColor['Rojo']; // Fallback a Rojo
      
      for (const variantId of variantIds) {
        // Insertar 3 imágenes por variante
        const imagesToInsert = images.slice(0, 3).map((imageUrl, index) => ({
          variant_id: variantId,
          image_url: imageUrl,
          alt_text: `${color} - Imagen ${index + 1}`,
          is_primary: index === 0, // Primera imagen es principal
          sort_order: index,
        }));

        const insertResponse = await fetch(
          `${supabaseUrl}/rest/v1/variant_images`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(imagesToInsert)
          }
        );

        if (!insertResponse.ok) {
          const errorBody = await insertResponse.text();
          console.error(`✗ Error al insertar imágenes para variante ${variantId}:`, errorBody);
        } else {
          addedImages += imagesToInsert.length;
          console.log(`✓ Se agregaron ${imagesToInsert.length} imágenes para ${color}`);
        }
      }
    }

    console.log(`\n✅ Completado! Se agregaron ${addedImages} imágenes en total`);
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar
seedVariantImages();
