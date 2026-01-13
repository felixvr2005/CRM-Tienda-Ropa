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
    product.price = priceInCents;
    
    // Generar SKU automático si no se proporciona
    if (!product.sku) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      product.sku = `SKU-${timestamp}-${random}`;
    }
    
    // Generate slug
    product.slug = slugify(product.name);
    
    // Check if slug exists
    const { data: existing } = await supabase
      .from('products')
      .select('slug')
      .eq('slug', product.slug)
      .single();
    
    if (existing) {
      product.slug = `${product.slug}-${Date.now()}`;
    }
    
    // Crear producto en Stripe automáticamente
    let stripeProductId = null;
    let stripePriceId = null;
    
    try {
      // Crear producto en Stripe
      const stripeProduct = await createStripeProduct({
        name: product.name,
        description: product.description || undefined,
        images: product.images || undefined,
        metadata: {
          slug: product.slug,
          category_id: product.category_id?.toString() || '',
        }
      });
      stripeProductId = stripeProduct.id;
      
      // Crear precio en Stripe
      const stripePrice = await createStripePrice({
        productId: stripeProductId,
        unitAmount: product.price, // Ya viene en céntimos desde la BD
        currency: 'eur',
        metadata: {
          original_price: product.original_price?.toString() || '',
        }
      });
      stripePriceId = stripePrice.id;
      
      // Añadir IDs de Stripe al producto
      product.stripe_product_id = stripeProductId;
      product.stripe_price_id = stripePriceId;
      
      console.log(`Producto "${product.name}" creado en Stripe: ${stripeProductId}`);
    } catch (stripeError) {
      console.warn('Error al crear producto en Stripe (continuando sin Stripe):', stripeError);
      // Continuamos sin Stripe - el producto se crea igual en la base de datos
    }
    
    // Create product
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (productError || !newProduct) {
      throw productError || new Error('No se pudo crear el producto');
    }
    
    // Create variants
    if (variants && variants.length > 0) {
      const variantsWithProductId = variants.map((v: any) => ({
        ...v,
        product_id: (newProduct as any).id,
      }));
      
      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantsWithProductId);
      
      if (variantsError) throw variantsError;
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
      JSON.stringify({ error: 'Error al crear el producto' }),
      { status: 500 }
    );
  }
};
