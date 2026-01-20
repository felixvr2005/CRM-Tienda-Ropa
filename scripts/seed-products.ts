/**
 * Script para generar 100 productos con 3 imágenes cada uno en Cloudinary y Supabase
 * Ejecutar: npx ts-node scripts/seed-products.ts
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

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/**
 * Generar imágenes de placeholder en Cloudinary
 * Usando cloudinary fetch URL con parámetros
 */
function generateCloudinaryImageUrls(productName: string, colorIndex: number): string[] {
  const baseUrl = `https://res.cloudinary.com/${cloudinaryCloudName}/image/fetch`;
  
  // Usar imágenes de placeholder con colores
  const placeholders = [
    `https://via.placeholder.com/500x600?text=${encodeURIComponent(productName)}&bg=${getColorHex(colorIndex)}`,
    `https://via.placeholder.com/500x600?text=${encodeURIComponent(productName + ' - Vista')}&bg=${getColorHex((colorIndex + 1) % colors.length)}`,
    `https://via.placeholder.com/500x600?text=${encodeURIComponent(productName + ' - Detalle')}&bg=${getColorHex((colorIndex + 2) % colors.length)}`,
  ];

  return placeholders.map(
    url => `${baseUrl}/w_500,h_600,c_fill,q_auto,f_auto/${encodeURIComponent(url)}`
  );
}

function getColorHex(index: number): string {
  const hexColors = [
    '000000', 'FFFFFF', '808080', '0000FF', 'FF0000',
    '008000', 'FFFF00', 'FFC0CB', '800080', 'FFA500',
  ];
  return hexColors[index % hexColors.length];
}

/**
 * Generar slug desde el nombre
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 100);
}

/**
 * Generar un producto aleatorio
 */
function generateProduct(index: number) {
  const category = categories[index % categories.length];
  const color = colors[index % colors.length];
  const material = materials[index % materials.length];
  
  const productName = `${category} ${color} - ${index + 1}`;
  const price = Math.floor(Math.random() * 150 + 20) * 100; // Entre €20 y €170
  const originalPrice = price + Math.floor(Math.random() * 50 * 100);
  const discountPercentage = Math.floor(((originalPrice - price) / originalPrice) * 100);

  const images = generateCloudinaryImageUrls(productName, index);

  return {
    name: productName,
    slug: slugify(productName),
    description: `${category} premium en color ${color}. Fabricado con ${material}. Producto de alta calidad para tu colección de moda.`,
    price: price,
    original_price: originalPrice,
    discount_percentage: discountPercentage,
    sku: `SKU-${String(index + 1).padStart(5, '0')}`,
    images: images,
    is_active: true,
    is_featured: index < 10, // Los primeros 10 como destacados
    is_new: index < 20, // Los primeros 20 como nuevos
    materials: material,
    care_instructions: 'Lavar con agua fría. No blanquear. Secar al aire. Planchar a temperatura baja.',
    tags: [category, color, material],
    average_rating: Math.floor(Math.random() * 50 + 35) / 10, // Entre 3.5 y 5.0
    review_count: Math.floor(Math.random() * 200),
  };
}

/**
 * Obtener o crear categoría
 */
async function getOrCreateCategory(categoryName: string) {
  const slug = slugify(categoryName);

  // Intentar obtener la categoría existente
  let { data: existing } = await supabase
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
    console.error(`Error creando categoría ${categoryName}:`, error);
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
    const categoryMap: Record<string, string> = {};

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
        console.error(`Error en lote ${Math.floor(i / 10) + 1}:`, error);
        failed += batch.length;
      } else {
        successful += batch.length;
        console.log(`  ✅ ${successful}/100 insertados`);
      }
    }

    console.log(`\n🎉 Seeding completado!`);
    console.log(`✅ ${successful} productos insertados`);
    if (failed > 0) {
      console.log(`❌ ${failed} productos fallaron`);
    }
    console.log(`\n📸 Todas las imágenes usan Cloudinary con URL de placeholder`);
    console.log(`🎨 ${colors.length} colores diferentes`);
    console.log(`📂 ${categories.length} categorías`);

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar
seedProducts();
