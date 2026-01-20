/**
 * Script para generar 100 productos con 3 imágenes cada uno en Cloudinary y Supabase
 * Ejecutar: node scripts/seed-products.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Configuración
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const cloudinaryCloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || '';

if (!supabaseUrl || !supabaseKey || !cloudinaryCloudName) {
  console.error('❌ Variables de entorno incompletas');
  console.error('Asegúrate de tener .env.local con:');
  console.error('  - PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_KEY');
  console.error('  - PUBLIC_CLOUDINARY_CLOUD_NAME');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de ejemplo
const categories = [
  'Camisetas',
  'Pantalones',
  'Vestidos',
  'Chaquetas',
  'Zapatos',
  'Accesorios',
  'Ropa Interior',
  'Ropa Deportiva',
];

const materials = [
  'Algodón 100%',
  'Poliéster',
  'Lana Merino',
  'Seda',
  'Lino',
  'Cuero',
  'Denim',
  'Algodón-Poliéster',
];

const colors = [
  'Negro',
  'Blanco',
  'Gris',
  'Azul',
  'Rojo',
  'Verde',
  'Amarillo',
  'Rosa',
  'Púrpura',
  'Naranja',
];

/**
 * Generar imágenes únicas para cada producto usando Unsplash
 * 3 imágenes diferentes por producto
 */
function generateCloudinaryImageUrls(productName, colorIndex, productIndex) {
  // Galería de fotos de Unsplash - cada una es completamente diferente
  // Clasificadas por tipo de prenda
  const clothingImages = {
    shirts: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
      'https://images.unsplash.com/photo-1542272604-787c62d465d1',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
      'https://images.unsplash.com/photo-1503341960993-27dc2fedc3c0',
      'https://images.unsplash.com/photo-1551028719-00167b16ebc5',
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3',
      'https://images.unsplash.com/photo-1516762714899-abc9be7d88bb',
      'https://images.unsplash.com/photo-1581092916562-40aa08e78837',
      'https://images.unsplash.com/photo-1618731267538-b75fad24e01f',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
    ],
    pants: [
      'https://images.unsplash.com/photo-1542606892-2b6631f46c91',
      'https://images.unsplash.com/photo-1548883329-38c6de58fed3',
      'https://images.unsplash.com/photo-1506617564874-a58f1dac3d3f',
      'https://images.unsplash.com/photo-1542272604-787c62d465d1',
      'https://images.unsplash.com/photo-1604695573706-e7f3dbe4fe13',
      'https://images.unsplash.com/photo-1541099810657-401b8b019739',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
      'https://images.unsplash.com/photo-1594969566211-c1a9a3fb4efb',
      'https://images.unsplash.com/photo-1542606892-2b6631f46c91',
      'https://images.unsplash.com/photo-1610054589319-987b1d206e62',
    ],
    dresses: [
      'https://images.unsplash.com/photo-1595777707802-221d02d326d3',
      'https://images.unsplash.com/photo-1612336307429-8a88e8d08dbb',
      'https://images.unsplash.com/photo-1537050487e1-eb813fae910',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f',
      'https://images.unsplash.com/photo-1494413849981-43304b2e406d',
      'https://images.unsplash.com/photo-1612336307429-8a88e8d08dbb',
      'https://images.unsplash.com/photo-1575723643623-d2f2e6df3d90',
      'https://images.unsplash.com/photo-1609087218589-6129cd307149',
      'https://images.unsplash.com/photo-1602033473121-ddfb1b90eb53',
      'https://images.unsplash.com/photo-1536882240095-0379873feb4e',
    ],
    jackets: [
      'https://images.unsplash.com/photo-1551028719-00167b16ebc5',
      'https://images.unsplash.com/photo-1539533057592-4d2b7472e0a7',
      'https://images.unsplash.com/photo-1553448692-ec5857a5ead0',
      'https://images.unsplash.com/photo-1535016120754-188fbb840c8d',
      'https://images.unsplash.com/photo-1539533057592-4d2b7472e0a7',
      'https://images.unsplash.com/photo-1551535941-d2a6bb1ef413',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
      'https://images.unsplash.com/photo-1606599810694-ac14b2820d0f',
      'https://images.unsplash.com/photo-1585487897520-bf97f84b3b95',
      'https://images.unsplash.com/photo-1594868882017-f0c0de8b1def',
    ],
    shoes: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782',
      'https://images.unsplash.com/photo-1552820728-8ac41f1ce891',
      'https://images.unsplash.com/photo-1595348895917-c6a42b5d9c20',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2',
      'https://images.unsplash.com/photo-1494341990857-178c50902917',
      'https://images.unsplash.com/photo-1526777267771-a440879cb921',
      'https://images.unsplash.com/photo-1608256245803-ba4f8c70ae0b',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1595777707802-221d02d326d3',
    ],
    accessories: [
      'https://images.unsplash.com/photo-1505814346881-b72b27e84530',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
      'https://images.unsplash.com/photo-1590301157890-4810ed352733',
      'https://images.unsplash.com/photo-1591553895911-0055eca6402d',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
      'https://images.unsplash.com/photo-1485261371474-1f8e99c56f72',
      'https://images.unsplash.com/photo-1578062284167-a00646776d86',
      'https://images.unsplash.com/photo-1564169897920-ab7201d428f9',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f',
    ],
    underwear: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f',
      'https://images.unsplash.com/photo-1501196354995-147348df276d',
      'https://images.unsplash.com/photo-1609830923917-a86edd33c439',
      'https://images.unsplash.com/photo-1517457373614-b7152f800fd1',
      'https://images.unsplash.com/photo-1539533057592-4d2b7472e0a7',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
      'https://images.unsplash.com/photo-1613558904459-0029a4e2ef16',
      'https://images.unsplash.com/photo-1585487897520-bf97f84b3b95',
      'https://images.unsplash.com/photo-1506622296473-443a88db0d41',
      'https://images.unsplash.com/photo-1572877606655-14e4a9a96bfd',
    ],
    sports: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
      'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042',
      'https://images.unsplash.com/photo-1516591291840-3da280fc1fdf',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae',
      'https://images.unsplash.com/photo-1535275335684-3406841bd33c',
      'https://images.unsplash.com/photo-1543291026-5786ebb9ebb7',
      'https://images.unsplash.com/photo-1523294587191-0f49b77b5e75',
      'https://images.unsplash.com/photo-1516602912645-36b2cb21ea8b',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    ],
  };

  // Seleccionar categoría de imágenes basada en el tipo de producto
  const categoryImages = clothingImages[
    Object.keys(clothingImages)[productIndex % Object.keys(clothingImages).length]
  ];

  // Generar 3 imágenes diferentes para este producto
  const images = [];
  for (let i = 0; i < 3; i++) {
    // Usar un índice diferente para cada imagen del mismo producto
    const imageIndex = (productIndex * 3 + i) % categoryImages.length;
    const baseUrl = categoryImages[imageIndex];
    
    // Agregar parámetros únicos para forzar URLs diferentes
    const imageUrl = `${baseUrl}?w=500&h=600&fit=crop&q=80&utm_source=fashion_store&utm_campaign=product_${productIndex}_img_${i}`;
    
    // Pasar por Cloudinary para optimizar
    const cloudinaryUrl = `https://res.cloudinary.com/${cloudinaryCloudName}/image/fetch/w_500,h_600,c_fill,q_auto,f_auto/${encodeURIComponent(imageUrl)}`;
    images.push(cloudinaryUrl);
  }

  return images;
}

function getColorHex(index) {
  const hexColors = [
    '000000', 'FFFFFF', '808080', '0000FF', 'FF0000',
    '008000', 'FFFF00', 'FFC0CB', '800080', 'FFA500',
  ];
  return hexColors[index % hexColors.length];
}

/**
 * Generar slug desde el nombre
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[àáäâ]/g, 'a')
    .replace(/[èéëê]/g, 'e')
    .replace(/[ìíïî]/g, 'i')
    .replace(/[òóöô]/g, 'o')
    .replace(/[ùúüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 100);
}

/**
 * Generar un producto aleatorio
 */
function generateProduct(index) {
  const category = categories[index % categories.length];
  const color = colors[index % colors.length];
  const material = materials[index % materials.length];
  
  const productName = `${category} ${color} - ${index + 1}`;
  const price = (Math.floor(Math.random() * 150 + 20) * 100) / 100; // Entre €20 y €170
  const compareAtPrice = price + Math.floor(Math.random() * 50 * 100) / 100;
  const discountPercentage = Math.floor(((compareAtPrice - price) / compareAtPrice) * 100);

  const images = generateCloudinaryImageUrls(productName, index, index);

  return {
    name: productName,
    slug: slugify(productName),
    description: `${category} premium en color ${color}. Fabricado con ${material}. Producto de alta calidad para tu colección de moda.`,
    price: price,
    compare_at_price: compareAtPrice,
    discount_percentage: discountPercentage,
    sku: `SKU-${String(index + 1).padStart(5, '0')}`,
    images: images,
    brand: 'Fashion Store',
    material: material,
    care_instructions: 'Lavar con agua fría. No blanquear. Secar al aire. Planchar a temperatura baja.',
    is_active: true,
    is_featured: index < 10,
    is_new: index < 20,
    tags: [category, color, material],
    avg_rating: Math.round((Math.random() * 50 + 35) / 10 * 100) / 100,
    review_count: Math.floor(Math.random() * 200),
  };
}

/**
 * Obtener o crear categoría
 */
async function getOrCreateCategory(categoryName) {
  const slug = slugify(categoryName);

  // Intentar obtener la categoría existente
  let { data: existing, error: fetchError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    return existing.id;
  }

  // Crear nueva categoría
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: categoryName,
      slug: slug,
      description: `Categoría: ${categoryName}`,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) {
    console.error(`Error creando categoría ${categoryName}:`, error.message);
    return null;
  }

  return data?.id;
}

/**
 * Insertar productos en Supabase
 */
async function seedProducts() {
  try {
    console.log('🚀 Iniciando seeding de productos...\n');

    // 1. Crear/obtener categorías
    console.log('📂 Preparando categorías...');
    const categoryMap = {};

    for (const category of categories) {
      const categoryId = await getOrCreateCategory(category);
      if (categoryId) {
        categoryMap[category] = categoryId;
      }
    }
    console.log(`✅ ${Object.keys(categoryMap).length} categorías listas\n`);

    // 2. Generar productos
    console.log('📝 Generando 100 productos...');
    const products = [];

    for (let i = 0; i < 100; i++) {
      const product = generateProduct(i);
      const category = categories[i % categories.length];
      const categoryId = categoryMap[category];

      if (categoryId) {
        products.push({
          ...product,
          category_id: categoryId,
        });
      }

      if ((i + 1) % 20 === 0) {
        console.log(`  ${i + 1}/100 productos generados`);
      }
    }
    console.log(`✅ 100 productos generados\n`);

    // 3. Insertar en Supabase (en lotes de 10)
    console.log('💾 Insertando productos en Supabase...');
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < products.length; i += 10) {
      const batch = products.slice(i, i + 10);

      const { error } = await supabase
        .from('products')
        .insert(batch);

      if (error) {
        console.error(`Error en lote ${Math.floor(i / 10) + 1}:`, error.message);
        failed += batch.length;
      } else {
        successful += batch.length;
        console.log(`  ✅ ${successful}/100 insertados`);
      }

      // Pequeña pausa entre lotes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🎉 Seeding completado!`);
    console.log(`✅ ${successful} productos insertados`);
    if (failed > 0) {
      console.log(`❌ ${failed} productos fallaron`);
    }
    console.log(`\n📸 Detalles:`);
    console.log(`  - Imágenes: Usando Cloudinary fetch con placeholders`);
    console.log(`  - 3 imágenes por producto`);
    console.log(`  - Colores: ${colors.length} opciones`);
    console.log(`  - Categorías: ${categories.length} opciones`);
    console.log(`  - Precios: Desde €20 hasta €170`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Ejecutar
seedProducts();
