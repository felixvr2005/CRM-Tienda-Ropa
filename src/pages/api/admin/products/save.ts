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
      is_active
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

    const productData = {
      name,
      slug,
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
      is_active
    };

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
    console.error('Error en POST /api/admin/products/save:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
