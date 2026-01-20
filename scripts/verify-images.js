import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

async function verifyImages() {
  try {
    console.log('🔍 Verificando imágenes de productos...\n');

    // Obtener todos los productos
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, images')
      .limit(100);

    if (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }

    if (!products || products.length === 0) {
      console.log('❌ No hay productos en la BD');
      process.exit(1);
    }

    console.log(`📊 Total de productos: ${products.length}\n`);

    let correctCount = 0;
    let incorrectCount = 0;
    const issues = [];

    products.forEach((product, idx) => {
      const imageCount = product.images?.length || 0;
      
      if (imageCount === 3) {
        correctCount++;
        if ((idx + 1) % 20 === 0) {
          console.log(`✅ ${idx + 1}/${products.length} - ${product.name}: ${imageCount} imágenes`);
        }
      } else {
        incorrectCount++;
        issues.push({
          id: product.id,
          name: product.name,
          count: imageCount,
          images: product.images || []
        });
        console.log(`❌ ${idx + 1} - ${product.name}: ${imageCount} imágenes (debería tener 3)`);
      }
    });

    console.log(`\n📈 Resumen:`);
    console.log(`  ✅ Correctos (3 imágenes): ${correctCount}`);
    console.log(`  ❌ Incorrectos: ${incorrectCount}`);
    
    if (incorrectCount > 0) {
      console.log(`\n⚠️  Productos con problemas:`);
      issues.slice(0, 5).forEach(issue => {
        console.log(`   - ${issue.name}: ${issue.count} imágenes`);
      });
    }

    // Verificar que las imágenes sean URLs válidas
    console.log(`\n🔗 Verificando URLs de imágenes...`);
    let validUrls = 0;
    let invalidUrls = 0;

    products.slice(0, 5).forEach(product => {
      if (product.images && product.images.length > 0) {
        product.images.forEach((url, idx) => {
          const isValid = url.includes('cloudinary') || url.includes('unsplash') || url.includes('placeholder');
          if (isValid) {
            validUrls++;
          } else {
            invalidUrls++;
            console.log(`  ❌ ${product.name} - Imagen ${idx + 1}: URL inválida`);
          }
        });
      }
    });

    console.log(`  ✅ URLs válidas: ${validUrls}`);
    console.log(`  ❌ URLs inválidas: ${invalidUrls}`);

    if (correctCount === products.length) {
      console.log(`\n🎉 ¡Perfecto! Todos los ${products.length} productos tienen 3 imágenes`);
      process.exit(0);
    } else {
      console.log(`\n⚠️  ${incorrectCount} productos tienen problemas`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyImages();
