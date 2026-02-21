import { logger } from '@lib/logger';
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';

/**
 * POST /api/admin/products/save
 * Crea o actualiza un producto
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  // Verificar autenticación
  const accessToken = cookies.get('sb-access-token')?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await request.json();
    const {
      id,
      name,
      description,
      category_id,
      product_type_id,
      price,
      compare_at_price,
      discount_percentage,
      brand,
      material,
      care_instructions,
      is_featured,
      is_new,
      is_flash_offer,
      is_active,
      images,
      variants
    } = data;

    // Validar campos requeridos
    if (!name || !product_type_id || !price) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Falta nombre, tipo de producto o precio'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generar slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Generar SKU automático para productos nuevos
    let sku: string | null = null;
    if (!id) {
      const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
      const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      sku = `${prefix}-${timestamp}-${random}`;
      // Verificar unicidad
      const { data: existingSku } = await supabaseAdmin
        .from('products')
        .select('sku')
        .eq('sku', sku)
        .single();
      if (existingSku) {
        sku = `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}-${random}`;
      }
    }

    const productData: any = {
      name,
      slug,
      description: description || null,
      category_id: category_id || null,
      product_type_id: product_type_id || null,
      price: Math.round(price * 100),
      compare_at_price: compare_at_price ? Math.round(compare_at_price * 100) : null,
      discount_percentage: discount_percentage || 0,
      brand: brand || null,
      material: material || null,
      care_instructions: care_instructions || null,
      is_featured: !!is_featured,
      is_new: !!is_new,
      is_flash_offer: !!is_flash_offer,
      is_active: is_active !== false,
      images: Array.isArray(images) ? images : [],
      image_url: Array.isArray(images) && images.length > 0 ? images[0] : null,
    };

    // Solo añadir SKU en creación (no sobreescribir en actualización)
    if (sku) {
      productData.sku = sku;
    }

    let productId: string;

    if (id) {
      // Actualizar producto existente
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update(productData)
        .eq('id', id);

      if (updateError) throw updateError;
      productId = id;
    } else {
      // Crear nuevo producto
      const { data: newProduct, error: insertError } = await supabaseAdmin
        .from('products')
        .insert([productData])
        .select('id')
        .single();

      if (insertError) throw insertError;
      if (!newProduct) throw new Error('No se retornó ID del producto');

      productId = newProduct.id;

      // Insertar variantes si vienen en la petición (solo en creación)
      if (variants && Array.isArray(variants) && variants.length > 0) {
        const variantInserts = variants.map((v: any) => ({
          product_id: productId,
          color: v.color || null,
          size: v.size || null,
          price_modifier: v.price_modifier || 0,
          stock: v.stock || 0,
          sku: v.sku || null
        }));

        const { error: variantsError } = await supabaseAdmin
          .from('product_variants')
          .insert(variantInserts);

        if (variantsError) throw variantsError;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      productId,
      message: id ? 'Producto actualizado' : 'Producto creado'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Error en POST /api/admin/products/save:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
