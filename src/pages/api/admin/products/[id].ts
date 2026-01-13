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
    
    // Remove id from update object
    delete product.id;
    
    // Update product
    const { error: productError } = await supabase
      .from('products')
      .update(product)
      .eq('id', id);
    
    if (productError) throw productError;
    
    // Update variants
    if (variants) {
      // Get existing variants
      const { data: existingVariants } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', id);
      
      const existingIds = existingVariants?.map(v => v.id) || [];
      const newVariantIds = variants.filter((v: any) => v.id).map((v: any) => v.id);
      
      // Delete removed variants
      const toDelete = existingIds.filter(id => !newVariantIds.includes(id));
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
            .update(variantData)
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
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update product error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar el producto' }),
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
