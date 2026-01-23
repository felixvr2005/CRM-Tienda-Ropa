/**
 * Supabase Client Singleton
 * Configuración para cliente público y servidor
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Lazy initialization para evitar errores de URL inválida durante el build
let _supabase: SupabaseClient<Database> | null = null;
let _supabaseAdmin: SupabaseClient<Database> | null = null;

function getSupabaseUrl(): string {
  return import.meta.env.PUBLIC_SUPABASE_URL || '';
}

function getSupabaseAnonKey(): string {
  return import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
}

function getSupabaseServiceKey(): string {
  return import.meta.env.SUPABASE_SERVICE_KEY || '';
}

// Cliente público (para browser y SSG)
function getClient(): SupabaseClient<Database> {
  if (!_supabase) {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    
    if (!url || !key) {
      console.warn('⚠️ Supabase not configured');
    }
    
    _supabase = createClient<Database>(
      url || 'https://placeholder.supabase.co',
      key || 'placeholder-key',
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      }
    );
  }
  return _supabase;
}

// Cliente de servidor (para operaciones administrativas)
function getAdminClient(): SupabaseClient<Database> {
  if (!_supabaseAdmin) {
    const url = getSupabaseUrl();
    const key = getSupabaseServiceKey() || getSupabaseAnonKey();
    
    _supabaseAdmin = createClient<Database>(
      url || 'https://placeholder.supabase.co',
      key || 'placeholder-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _supabaseAdmin;
}

// Exportar clientes como proxy
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getAdminClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
// Funciones helper para productos
export async function getProducts(limit?: number) {
  const client = getClient();
  let query = client
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      variants:product_variants(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  // Normalizar precios de céntimos a euros
  return (data || []).map(product => ({
    ...product,
    price: product.price / 100,
    original_price: product.original_price ? product.original_price / 100 : undefined,
    variants: (product.variants || []).map((v: any) => ({
      ...v,
      price: v.price / 100,
    })),
  }));
}

export async function getProductBySlug(slug: string) {
  const client = getClient();
  const { data, error } = await client
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      variants:product_variants(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) return null;
  
  // Normalizar precios
  return {
    ...data,
    price: data.price / 100,
    original_price: data.original_price ? data.original_price / 100 : undefined,
    variants: (data.variants || []).map((v: any) => ({
      ...v,
      price: v.price / 100,
    })),
  };
}

export async function getProductsByCategory(categorySlug: string) {
  const client = getClient();
  
  const { data: category } = await client
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) return [];

  const { data, error } = await client
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      variants:product_variants(*)
    `)
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return [];
  
  // Normalizar precios
  return (data || []).map(product => ({
    ...product,
    price: product.price / 100,
    original_price: product.original_price ? product.original_price / 100 : undefined,
    variants: (product.variants || []).map((v: any) => ({
      ...v,
      price: v.price / 100,
    })),
  }));
}

export async function getCategories() {
  const client = getClient();
  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function getFeaturedProducts() {
  const client = getClient();
  const { data, error } = await client
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      variants:product_variants(*)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) return [];
  
  // Normalizar precios
  return (data || []).map(product => ({
    ...product,
    price: product.price / 100,
    original_price: product.original_price ? product.original_price / 100 : undefined,
    variants: (product.variants || []).map((v: any) => ({
      ...v,
      price: v.price / 100,
    })),
  }));
}

export async function getFlashOffers() {
  const client = getClient();
  
  // Verificar si las ofertas flash están activas en configuración
  const { data: config } = await client
    .from('configuracion')
    .select('valor')
    .eq('clave', 'ofertas_activas')
    .single();
  
  // Si ofertas_activas es 'false' o no existe, no mostrar ofertas
  if (!config || config.valor !== 'true') {
    return [];
  }
  
  const { data, error } = await client
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      variants:product_variants(*)
    `)
    .eq('is_active', true)
    .eq('is_flash_offer', true)
    .gt('discount_percentage', 0)
    .order('discount_percentage', { ascending: false })
    .limit(6);

  if (error) return [];
  
  // Normalizar precios
  return (data || []).map(product => ({
    ...product,
    price: product.price / 100,
    original_price: product.original_price ? product.original_price / 100 : undefined,
    variants: (product.variants || []).map((v: any) => ({
      ...v,
      price: v.price / 100,
    })),
  }));
}

// ============================================
// FILTROS Y BÚSQUEDA
// ============================================

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  onSale?: boolean;
  isNew?: boolean;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
  search?: string;
}

export async function getFilteredProducts(filters: ProductFilters) {
  const client = getClient();
  
  let query = client
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      variants:product_variants(*)
    `)
    .eq('is_active', true);

  // Filtro por categoría
  if (filters.category) {
    const { data: cat } = await client
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .single();
    
    if (cat) {
      query = query.eq('category_id', cat.id);
    }
  }

  // Filtro por precio
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  // Filtro por descuento
  if (filters.onSale) {
    query = query.gt('discount_percentage', 0);
  }

  // Filtro por nuevo
  if (filters.isNew) {
    query = query.eq('is_new', true);
  }

  // Búsqueda por texto
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  // Ordenamiento
  switch (filters.sortBy) {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    case 'popular':
      query = query.order('sales_count', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching filtered products:', error);
    return [];
  }

  let products = data || [];

  // Normalizar precios a euros
  products = products.map(p => ({
    ...p,
    price: p.price / 100,
    original_price: p.original_price ? p.original_price / 100 : undefined,
    variants: (p.variants || []).map((v: any) => ({
      ...v,
      price: v.price ? v.price / 100 : undefined,
    })),
  }));

  // Filtros post-query (colores y tallas requieren filtrar por variants)
  if (filters.colors && filters.colors.length > 0) {
    products = products.filter(p => 
      p.variants?.some((v: any) => filters.colors!.includes(v.color))
    );
  }

  if (filters.sizes && filters.sizes.length > 0) {
    products = products.filter(p => 
      p.variants?.some((v: any) => filters.sizes!.includes(v.size))
    );
  }

  return products;
}

export async function getAvailableFilters(categorySlug?: string) {
  const client = getClient();
  
  // Obtener todos los productos activos (o de una categoría)
  let query = client
    .from('products')
    .select(`
      price,
      discount_percentage,
      is_new,
      variants:product_variants(size, color)
    `)
    .eq('is_active', true);

  if (categorySlug) {
    const { data: cat } = await client
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    
    if (cat) {
      query = query.eq('category_id', cat.id);
    }
  }

  const { data } = await query;

  if (!data) return { colors: [], sizes: [], priceRange: { min: 0, max: 1000 } };

  // Extraer valores únicos
  const colors = new Set<string>();
  const sizes = new Set<string>();
  let minPrice = Infinity;
  let maxPrice = 0;

  data.forEach(product => {
    const price = product.discount_percentage > 0 
      ? product.price * (1 - product.discount_percentage / 100)
      : product.price;
    
    minPrice = Math.min(minPrice, price);
    maxPrice = Math.max(maxPrice, price);

    product.variants?.forEach((v: any) => {
      colors.add(v.color);
      sizes.add(v.size);
    });
  });

  // Ordenar tallas
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '85', '90', '95', '100', 'UNICA'];
  const sortedSizes = Array.from(sizes).sort((a, b) => {
    const aIndex = sizeOrder.indexOf(a);
    const bIndex = sizeOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return {
    colors: Array.from(colors).sort(),
    sizes: sortedSizes,
    priceRange: {
      min: minPrice === Infinity ? 0 : Math.floor(minPrice),
      max: maxPrice === 0 ? 1000 : Math.ceil(maxPrice)
    }
  };
}

// ============================================
// AUTENTICACIÓN
// ============================================

export async function signUp(email: string, password: string, userData?: {
  first_name?: string;
  last_name?: string;
}) {
  const client = getClient();
  
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    }
  });

  if (error) return { user: null, error: error.message };

  // Crear perfil de cliente
  if (data.user) {
    await client.from('customers').insert({
      auth_user_id: data.user.id,
      email: data.user.email,
      first_name: userData?.first_name || null,
      last_name: userData?.last_name || null,
    });
  }

  return { user: data.user, error: null };
}

export async function signIn(email: string, password: string) {
  const client = getClient();
  
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { user: null, session: null, error: error.message };

  return { user: data.user, session: data.session, error: null };
}

export async function signOut() {
  const client = getClient();
  await client.auth.signOut();
}

export async function getCurrentUser() {
  const client = getClient();
  const { data: { user } } = await client.auth.getUser();
  return user;
}

export async function getCustomerProfile(authUserId: string) {
  const client = getClient();
  const { data } = await client
    .from('customers')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();
  
  return data;
}

export async function isUserAdmin(authUserId: string): Promise<boolean> {
  const client = getClient();
  
  // Método 1: Verificar app_metadata del usuario (más confiable)
  const { data: userData } = await client.auth.getUser();
  if (userData?.user?.app_metadata?.role === 'admin') {
    return true;
  }
  
  // Método 2: Verificar en tabla admin_users
  const { data, error } = await client
    .from('admin_users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .eq('is_active', true)
    .single();
  
  if (data) {
    return true;
  }
  
  if (error) {
    console.log('Error checking admin:', error.message);
  }
  
  return false;
}

export async function adminSignIn(email: string, password: string) {
  const client = getClient();
  
  // Primero intentar login
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { user: null, error: error.message };

  // Debug: ver qué contiene app_metadata
  console.log('User data:', JSON.stringify(data.user, null, 2));
  console.log('App metadata:', data.user?.app_metadata);
  console.log('Role:', data.user?.app_metadata?.role);

  // Verificar si es admin - múltiples formas
  const roleFromAppMeta = data.user?.app_metadata?.role;
  const roleFromUserMeta = data.user?.user_metadata?.role;
  
  const isAdmin = roleFromAppMeta === 'admin' || 
                  roleFromUserMeta === 'admin' ||
                  email === 'admin@gmail.com'; // Bypass temporal para debug
  
  console.log('Is admin?', isAdmin, 'roleFromAppMeta:', roleFromAppMeta, 'roleFromUserMeta:', roleFromUserMeta);

  if (!isAdmin) {
    await client.auth.signOut();
    return { user: null, error: 'No tienes permisos de administrador' };
  }

  // Actualizar último login (ignorar errores)
  try {
    await client.from('admin_users').update({ last_login: new Date().toISOString() })
      .eq('auth_user_id', data.user.id);
  } catch (e) {
    console.log('Error updating last_login:', e);
  }

  return { user: data.user, error: null };
}

// Función auxiliar para verificar admin desde la DB
async function isUserAdminFromDB(authUserId: string): Promise<boolean> {
  const client = getClient();
  const { data } = await client
    .from('admin_users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .eq('is_active', true)
    .single();
  
  return !!data;
}

// ============================================
// CARRITO PERSISTENTE (para usuarios logueados)
// ============================================

export async function getServerCart(customerId?: string, sessionId?: string) {
  const client = getClient();
  
  let query = client
    .from('cart_items')
    .select(`
      *,
      product:products(*),
      variant:product_variants(*)
    `);

  if (customerId) {
    query = query.eq('customer_id', customerId);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  } else {
    return [];
  }

  const { data } = await query;
  return data || [];
}

export async function addToServerCart(item: {
  customerId?: string;
  sessionId?: string;
  productId: string;
  variantId: string;
  quantity: number;
}) {
  const client = getClient();
  
  const insertData: any = {
    product_id: item.productId,
    variant_id: item.variantId,
    quantity: item.quantity,
  };

  if (item.customerId) {
    insertData.customer_id = item.customerId;
  } else if (item.sessionId) {
    insertData.session_id = item.sessionId;
  }

  const { data, error } = await client
    .from('cart_items')
    .upsert(insertData, { 
      onConflict: item.customerId ? 'customer_id,variant_id' : 'session_id,variant_id' 
    })
    .select();

  return { data, error };
}

export async function updateServerCartItem(itemId: string, quantity: number) {
  const client = getClient();
  
  if (quantity <= 0) {
    return removeFromServerCart(itemId);
  }

  const { error } = await client
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId);

  return { error };
}

export async function removeFromServerCart(itemId: string) {
  const client = getClient();
  
  const { error } = await client
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  return { error };
}

export async function clearServerCart(customerId?: string, sessionId?: string) {
  const client = getClient();
  
  let query = client.from('cart_items').delete();

  if (customerId) {
    query = query.eq('customer_id', customerId);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  }

  const { error } = await query;
  return { error };
}

export async function mergeGuestCart(sessionId: string, customerId: string) {
  const client = getClient();
  
  // Usar la función de base de datos
  const { error } = await client.rpc('merge_guest_cart', {
    p_session_id: sessionId,
    p_customer_id: customerId
  });

  return { error };
}

// ============================================
// PEDIDOS
// ============================================

export async function createOrder(orderData: {
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_address: any;
  billing_address?: any;
  items: Array<{
    product_id: string;
    variant_id: string;
    product_name: string;
    product_slug?: string;
    product_image?: string;
    product_sku?: string;
    size?: string;
    color?: string;
    quantity: number;
    unit_price: number;
    discount_percentage?: number;
  }>;
  subtotal: number;
  shipping_cost?: number;
  discount_amount?: number;
  total_amount: number;
  coupon_code?: string;
  customer_notes?: string;
  stripe_checkout_session_id?: string;
}) {
  const client = getClient();
  
  // Crear orden
  const { data: order, error: orderError } = await client
    .from('orders')
    .insert({
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      shipping_address: orderData.shipping_address,
      billing_address: orderData.billing_address || orderData.shipping_address,
      subtotal: orderData.subtotal,
      shipping_cost: orderData.shipping_cost || 0,
      discount_amount: orderData.discount_amount || 0,
      total_amount: orderData.total_amount,
      coupon_code: orderData.coupon_code,
      customer_notes: orderData.customer_notes,
      stripe_checkout_session_id: orderData.stripe_checkout_session_id,
    })
    .select()
    .single();

  if (orderError || !order) {
    return { order: null, error: orderError?.message || 'Error creating order' };
  }

  // Crear items del pedido
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.product_name,
    product_slug: item.product_slug,
    product_image: item.product_image,
    product_sku: item.product_sku,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_percentage: item.discount_percentage || 0,
    line_total: item.unit_price * item.quantity * (1 - (item.discount_percentage || 0) / 100),
  }));

  const { error: itemsError } = await client
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
  }

  return { order, error: null };
}

export async function getCustomerOrders(customerId: string) {
  const client = getClient();
  
  const { data } = await client
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function getOrderByNumber(orderNumber: string) {
  const client = getClient();
  
  const { data } = await client
    .from('orders')
    .select(`
      *,
      customer:customers(id, auth_user_id, first_name, last_name, email),
      order_items(
        id,
        quantity,
        price,
        original_price,
        product_variant:product_variants(
          id,
          color,
          size,
          product:products(id, name, slug, images)
        )
      )
    `)
    .eq('order_number', orderNumber)
    .single();

  return data;
}

// ============================================
// WISHLIST FUNCTIONS
// ============================================

export async function getWishlist(customerId: string) {
  const client = getClient();
  
  const { data } = await client
    .from('wishlists')
    .select(`
      id,
      created_at,
      product:products(
        id,
        name,
        slug,
        description,
        images,
        category:categories!products_category_id_fkey(name, slug),
        variants:product_variants(id, color, size, price, original_price, stock)
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function addToWishlist(customerId: string, productId: string) {
  const client = getClient();
  
  // Verificar si ya existe
  const { data: existing } = await client
    .from('wishlists')
    .select('id')
    .eq('customer_id', customerId)
    .eq('product_id', productId)
    .single();

  if (existing) {
    return { success: true, alreadyExists: true };
  }

  const { error } = await client
    .from('wishlists')
    .insert({
      customer_id: customerId,
      product_id: productId
    });

  if (error) throw error;
  return { success: true, alreadyExists: false };
}

export async function removeFromWishlist(customerId: string, productId: string) {
  const client = getClient();
  
  const { error } = await client
    .from('wishlists')
    .delete()
    .eq('customer_id', customerId)
    .eq('product_id', productId);

  if (error) throw error;
  return { success: true };
}

export async function isInWishlist(customerId: string, productId: string) {
  const client = getClient();
  
  const { data } = await client
    .from('wishlists')
    .select('id')
    .eq('customer_id', customerId)
    .eq('product_id', productId)
    .single();

  return !!data;
}

// ============================================
// REVIEWS FUNCTIONS
// ============================================

export async function getProductReviews(productId: string) {
  const client = getClient();
  
  const { data } = await client
    .from('reviews')
    .select(`
      id,
      rating,
      title,
      comment,
      images,
      is_verified_purchase,
      created_at,
      customer:customers(first_name, last_name)
    `)
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function addReview(data: {
  customerId: string;
  productId: string;
  variantId?: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}) {
  const client = getClient();
  
  const { error } = await client
    .from('reviews')
    .insert({
      customer_id: data.customerId,
      product_id: data.productId,
      variant_id: data.variantId,
      order_id: data.orderId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: data.images,
      is_verified_purchase: !!data.orderId
    });

  if (error) throw error;
  return { success: true };
}
