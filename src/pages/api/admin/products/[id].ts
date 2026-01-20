/**
 * API Admin: Single Product CRUD
 */
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';
import { slugify } from '@lib/utils';

export const prerender = false;

// GET - Get single product
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    const { data, error } = await supabase
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
    const { id } = params;
    const { product, variants } = await request.json();
    
    console.log('PUT /api/admin/products/[id]', { id, product, variantsCount: variants?.length || 0 });
    
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
      const { data: existing } = await supabase
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
      'name', 'slug', 'description', 'category_id', 'price', 
      'compare_at_price', 'discount_percentage', 'images', 'brand',
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
    
    console.log('Updating product:', id, 'with data:', updateData);
    
    // Update product
    const { error: productError, data: updatedProduct } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (productError) {
      console.error('Product update error:', productError);
      throw productError;
    }
    
    // Update variants
    if (variants && Array.isArray(variants)) {
      // Get existing variants
      const { data: existingVariants } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', id);
      
      const existingIds = existingVariants?.map(v => v.id) || [];
      const newVariantIds = variants.filter((v: any) => v.id).map((v: any) => v.id);
      
      // Delete removed variants
      const toDelete = existingIds.filter(vid => !newVariantIds.includes(vid));
      if (toDelete.length > 0) {
        await supabase
          .from('product_variants')
          .delete()
          .in('id', toDelete);
      }
      
      // Update or insert variants
      for (const variant of variants) {
        if (variant.id) {
          // Update existing
          const { id: variantId, ...variantData } = variant;
          await supabase
            .from('product_variants')
            .update({ ...variantData, updated_at: new Date().toISOString() })
            .eq('id', variantId);
        } else {
          // Insert new
          await supabase
            .from('product_variants')
            .insert({
              ...variant,
              product_id: id,
            });
        }
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Producto actualizado correctamente' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update product error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar el producto', details: String(error) }),
      { status: 500 }
    );
  }
};

// DELETE - Delete product
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    // Delete variants first (cascade should handle this but just in case)
    await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', id);
    
    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar el producto' }),
      { status: 500 }
    );
  }
};
