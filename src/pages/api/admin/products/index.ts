/**
 * API Admin: Products CRUD
 */
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';
import { slugify } from '@lib/utils';
import { createStripeProduct, createStripePrice } from '@lib/stripe';

export const prerender = false;

// GET - List all products
export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error al obtener productos' }),
      { status: 500 }
    );
  }
};

// POST - Create product
export const POST: APIRoute = async ({ request }) => {
  try {
    const { product, variants } = await request.json();
    
    if (!product.name || !product.price) {
      return new Response(
        JSON.stringify({ error: 'Nombre y precio son requeridos' }),
        { status: 400 }
      );
    }
    
    // Convertir precio de euros a céntimos
    const priceInCents = Math.round(product.price * 100);
    
    // Generar SKU automático si no se proporciona
    let sku = product.sku;
    if (!sku) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      sku = `SKU-${timestamp}-${random}`;
    }
    
    // Generate slug
    let slug = slugify(product.name);
    
    // Check if slug exists
    const { data: existing } = await supabase
      .from('products')
      .select('slug')
      .eq('slug', slug)
      .single();
    
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }
    
    // Preparar datos del producto con validación de campos
    const productData: any = {
      name: product.name,
      slug: slug,
      description: product.description || null,
      category_id: product.category_id || null,
      price: priceInCents,
      compare_at_price: product.compare_at_price ? Math.round(product.compare_at_price * 100) : null,
      discount_percentage: parseInt(product.discount_percentage || '0') || 0,
      images: Array.isArray(product.images) ? product.images : [],
      brand: product.brand || null,
      material: product.material || null,
      care_instructions: product.care_instructions || null,
      is_active: !!product.is_active,
      is_featured: !!product.is_featured,
      is_new: !!product.is_new,
      is_flash_offer: !!product.is_flash_offer,
      tags: Array.isArray(product.tags) ? product.tags : [],
      meta_title: product.meta_title || null,
      meta_description: product.meta_description || null,
      sku: sku,
    };
    
    // Crear producto en Stripe automáticamente
    let stripeProductId = null;
    let stripePriceId = null;
    
    try {
      // Crear producto en Stripe
      const stripeProduct = await createStripeProduct({
        name: product.name,
        description: product.description || undefined,
        images: productData.images || undefined,
        metadata: {
          slug: productData.slug,
          category_id: productData.category_id?.toString() || '',
        }
      });
      stripeProductId = stripeProduct.id;
      
      // Crear precio en Stripe
      const stripePrice = await createStripePrice({
        productId: stripeProductId,
        unitAmount: priceInCents,
        currency: 'eur',
        metadata: {
          compare_at_price: productData.compare_at_price?.toString() || '',
        }
      });
      stripePriceId = stripePrice.id;
      
      // Añadir IDs de Stripe al producto
      productData.stripe_product_id = stripeProductId;
      productData.stripe_price_id = stripePriceId;
      
      console.log(`Producto "${productData.name}" creado en Stripe: ${stripeProductId}`);
    } catch (stripeError) {
      console.warn('Error al crear producto en Stripe (continuando sin Stripe):', stripeError);
      // Continuamos sin Stripe - el producto se crea igual en la base de datos
    }
    
    // Create product
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (productError || !newProduct) {
      console.error('Product creation error:', productError);
      throw productError || new Error('No se pudo crear el producto');
    }
    
    // Create variants
    if (variants && Array.isArray(variants) && variants.length > 0) {
      const variantsWithProductId = variants.map((v: any) => ({
        size: v.size,
        color: v.color || null,
        stock: parseInt(v.stock || '0') || 0,
        product_id: (newProduct as any).id,
      }));
      
      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantsWithProductId);
      
      if (variantsError) {
        console.error('Variants creation error:', variantsError);
        throw variantsError;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        product: newProduct,
        stripe: {
          productId: stripeProductId,
          priceId: stripePriceId
        }
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al crear el producto', details: String(error) }),
      { status: 500 }
    );
  }
};
