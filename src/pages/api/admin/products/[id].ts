import { logger } from '@lib/logger';
/**
 * API Admin: Single Product CRUD
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { slugify } from '@lib/utils';

export const prerender = false;

// GET - Get single product
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Producto no encontrado' }),
      { status: 404 }
    );
  }
};

// PUT - Update product
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const { product, variants } = await request.json();
    
    logger.info('PUT /api/admin/products/[id]', { id, product, variantsCount: variants?.length || 0 });
    
    // Validar que al menos name sea proporcionado
    if (!product.name || product.name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'El nombre del producto es obligatorio' }),
        { status: 400 }
      );
    }
    
    // Update slug if name changed
    if (product.name) {
      product.slug = slugify(product.name);
      
      // Check if slug exists (excluding current product)
      const { data: existing } = await supabaseAdmin
        .from('products')
        .select('slug')
        .eq('slug', product.slug)
        .neq('id', id)
        .single();
      
      if (existing) {
        product.slug = `${product.slug}-${Date.now()}`;
      }
    }
    
    // Mapear campos del formulario a campos de BD
    const updateData: any = {};
    
    // Campos que sí existen en la BD
    const allowedFields = [
      'name', 'slug', 'description', 'category_id', 'product_type_id', 'price', 
      'compare_at_price', 'discount_percentage', 'images', 'image_url', 'brand',
      'material', 'care_instructions', 'is_active', 'is_featured',
      'is_new', 'is_flash_offer', 'tags', 'meta_title', 'meta_description',
      'sku', 'cost_price'
    ];
    
    // Copiar solo campos permitidos
    allowedFields.forEach(field => {
      if (field in product) {
        let value = product[field];
        
        // Para el campo images, permitir arrays vacíos (significa eliminar todas las imágenes)
        if (field === 'images' && Array.isArray(value)) {
          updateData[field] = value;
          // Sincronizar image_url con la primera imagen del array
          updateData['image_url'] = value.length > 0 ? value[0] : null;
          logger.info('Images update:', { count: value.length, image_url: updateData['image_url'] });
          return;
        }
        
        // Para otros campos, NO actualizar si son null/undefined
        if (value === null || value === undefined) {
          return; // Skip this field
        }
        
        // Convertir precios de euros a céntimos
        if (field === 'price' && typeof value === 'number') {
          value = Math.round(value * 100);
        } else if (field === 'compare_at_price' && typeof value === 'number') {
          value = Math.round(value * 100);
        }
        
        updateData[field] = value;
      }
    });
    
    // Asegurar que updated_at se actualice
    updateData.updated_at = new Date().toISOString();
    
    logger.info('Updating product:', id, 'with data:', JSON.stringify(updateData));
    
    // Update product
    const { error: productError, data: updatedProduct } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (productError) {
      logger.error('Product update error:', JSON.stringify(productError));
      return new Response(
        JSON.stringify({ 
          error: 'Error al actualizar producto en BD: ' + productError.message,
          details: productError.details || productError.hint || '',
          code: productError.code
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    logger.info('Product updated successfully:', updatedProduct?.id, 'images:', updatedProduct?.images?.length);
    
    // Update variants
    if (variants && Array.isArray(variants)) {
      // Get existing variants
      const { data: existingVariants } = await supabaseAdmin
        .from('product_variants')
        .select('id')
        .eq('product_id', id);
      
      const existingIds = existingVariants?.map(v => v.id) || [];
      const newVariantIds = variants.filter((v: any) => v.id).map((v: any) => v.id);
      
      // Delete removed variants
      const toDelete = existingIds.filter(vid => !newVariantIds.includes(vid));
      if (toDelete.length > 0) {
        await supabaseAdmin
          .from('product_variants')
          .delete()
          .in('id', toDelete);
      }
      
      // Update or insert variants
      for (const variant of variants) {
        if (variant.id) {
          // Update existing
          const { id: variantId, ...variantData } = variant;
          await supabaseAdmin
            .from('product_variants')
            .update({ ...variantData, updated_at: new Date().toISOString() })
            .eq('id', variantId);
        } else {
          // Insert new
          await supabaseAdmin
            .from('product_variants')
            .insert({
              ...variant,
              product_id: id,
            });
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Producto actualizado correctamente',
        updated_fields: Object.keys(updateData).filter(k => k !== 'updated_at'),
        images_count: updatedProduct?.images?.length || 0
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    logger.error('Update product error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar el producto', details: error?.message || String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PATCH - Regenerate SKU
export const PATCH: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Obtener nombre del producto para generar prefijo
    const { data: product, error: fetchErr } = await supabaseAdmin
      .from('products')
      .select('name')
      .eq('id', id)
      .single();

    if (fetchErr || !product) {
      return new Response(JSON.stringify({ error: 'Producto no encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const prefix = product.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    let sku = `${prefix}-${timestamp}-${random}`;

    // Verificar unicidad
    const { data: existing } = await supabaseAdmin
      .from('products')
      .select('sku')
      .eq('sku', sku)
      .neq('id', id)
      .single();

    if (existing) {
      sku = `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}-${random}`;
    }

    const { error: updateErr } = await supabaseAdmin
      .from('products')
      .update({ sku, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateErr) throw updateErr;

    logger.info('SKU regenerated:', { id, sku });

    return new Response(
      JSON.stringify({ success: true, sku }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    logger.error('SKU regeneration error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al generar SKU', details: error?.message || String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE - Delete product
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Delete variants first (cascade should handle this but just in case)
    await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('product_id', id);
    
    // Delete product
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    logger.error('Delete product error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar el producto' }),
      { status: 500 }
    );
  }
};
