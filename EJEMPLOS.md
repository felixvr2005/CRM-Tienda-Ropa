/**
 * EJEMPLOS DE CÓDIGO - FASHIONMARKET
 * 
 * Casos de uso y patrones recomendados
 */

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 1: Usar Nano Store en un Componente React
// ═══════════════════════════════════════════════════════════════════════════

import { useStore } from 'nanostores';
import { cartStore, cartTotalsStore } from '@stores/cart';

export default function CartInfo() {
  const items = useStore(cartStore);
  const { totalItems, totalPrice } = useStore(cartTotalsStore);

  return (
    <div>
      <p>Items: {totalItems}</p>
      <p>Total: €{(totalPrice / 100).toFixed(2)}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 2: Página Astro SSG con Producto Dinámico
// ═══════════════════════════════════════════════════════════════════════════

/*
// src/pages/shop/[slug].astro

---
import ShopLayout from '@layouts/ShopLayout.astro';
import AddToCartButton from '@components/shop/AddToCartButton';
import { supabase } from '@lib/supabase/client';

// Para SSG, usar getStaticPaths
export async function getStaticPaths() {
  const { data: products } = await supabase
    .from('products')
    .select('slug');

  return products?.map((product) => ({
    params: { slug: product.slug }
  })) || [];
}

const { slug } = Astro.params;
const product = await getProductBySlug(slug);

if (!product) {
  return new Response(null, { status: 404 });
}
---

<ShopLayout title={product.name} description={product.description}>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="grid grid-cols-2 gap-12">
      <!-- Galería de Imágenes -->
      <div>
        {product.images.map((image) => (
          <img src={image} alt={product.name} class="mb-4" />
        ))}
      </div>

      <!-- Info del Producto -->
      <div>
        <h1 class="text-4xl font-serif font-bold mb-4">{product.name}</h1>
        <p class="text-2xl font-bold text-navy-900 mb-6">
          €{(product.price / 100).toFixed(2)}
        </p>
        
        <!-- Isla Interactiva -->
        <AddToCartButton
          client:load
          productId={product.id}
          productName={product.name}
          price={product.price}
          productImage={product.images[0]}
          stock={product.stock}
          sizes={product.sizes}
          colors={product.colors}
        />
      </div>
    </div>
  </div>
</ShopLayout>
*/

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 3: Consultar Supabase desde Página Astro
// ═══════════════════════════════════════════════════════════════════════════

import { getAllCategories, getProducts } from '@lib/supabase/queries';

async function loadCatalog() {
  try {
    const categories = await getAllCategories();
    const products = await getProducts(20, 0);
    
    return { categories, products };
  } catch (error) {
    console.error('Error loading catalog:', error);
    return { categories: [], products: [] };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 4: Validar Datos de Formulario
// ═══════════════════════════════════════════════════════════════════════════

import { validateProduct, generateSlug } from '@utils/validation';

const formData = {
  name: 'Camisa Premium',
  description: 'Camisa de lujo en algodón',
  price: 15990, // céntimos
  stock: 10,
  category_id: 'uuid...',
  images: ['url1', 'url2'],
};

const errors = validateProduct(formData);

if (errors.length > 0) {
  console.error('Errores de validación:', errors);
  // Mostrar errores al usuario
} else {
  // Procesar formulario
  const slug = generateSlug(formData.name); // 'camisa-premium'
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 5: Subir Imagen a Storage
// ═══════════════════════════════════════════════════════════════════════════

import { uploadProductImage, uploadMultipleImages } from '@lib/supabase/storage';

async function handleImageUpload(files: File[], productId: string) {
  try {
    const imageUrls = await uploadMultipleImages(files, productId);
    console.log('Imágenes subidas:', imageUrls);
    // Guardar URLs en BD
    return imageUrls;
  } catch (error) {
    console.error('Error al subir imágenes:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 6: Usar el Carrito en Componente React
// ═══════════════════════════════════════════════════════════════════════════

import { addItemToCart, removeItemFromCart } from '@stores/cart';
import { formatPrice } from '@utils/cart';

export default function ProductAddForm({ product }) {
  const handleAddToCart = () => {
    addItemToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
      },
      2, // cantidad
      'M', // talla
      'Azul' // color
    );

    console.log('Producto añadido al carrito');
  };

  return (
    <div>
      <p>Precio: {formatPrice(product.price)}</p>
      <button onClick={handleAddToCart}>
        Añadir al carrito
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 7: Componente Admin para CRUD de Productos
// ═══════════════════════════════════════════════════════════════════════════

/*
// src/components/admin/ProductForm.tsx

import { useState } from 'react';
import { validateProduct } from '@utils/validation';
import { uploadMultipleImages } from '@lib/supabase/storage';
import { supabase } from '@lib/supabase/client';

export default function ProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    // Validar datos
    const validationErrors = validateProduct({
      ...formData,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
      images,
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      // Subir imágenes
      const imageUrls = await uploadMultipleImages(
        images,
        'temp-' + Date.now()
      );

      // Insertar producto en BD
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            ...formData,
            price: parseInt(formData.price),
            stock: parseInt(formData.stock),
            images: imageUrls,
            is_active: true,
          },
        ])
        .select();

      if (error) throw error;

      console.log('Producto creado:', data);
      // Reset form
      setFormData({ name: '', description: '', price: '', stock: '', category_id: '' });
      setImages([]);
    } catch (error) {
      setErrors([{ field: 'general', message: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      <div>
        <label>Nombre</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label>Imágenes (arrastra aquí)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(Array.from(e.target.files || []))}
          onDrop={(e) => {
            e.preventDefault();
            setImages(Array.from(e.dataTransfer.files));
          }}
        />
      </div>

      {errors.length > 0 && (
        <div class="text-red-600">
          {errors.map((err) => (
            <p key={err.field}>{err.message}</p>
          ))}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Crear Producto'}
      </button>
    </form>
  );
}
*/

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 8: API Route para Crear Orden
// ═══════════════════════════════════════════════════════════════════════════

/*
// src/pages/api/orders/create.ts

import type { APIRoute } from 'astro';
import { createOrder, updateProductStock } from '@lib/supabase/queries';
import { validateOrder } from '@utils/validation';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validar datos
    // const errors = validateOrder(body);
    // if (errors.length > 0) return new Response(...);

    // Crear orden
    const order = await createOrder({
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      total_amount: body.totalAmount,
      items: body.items,
      status: 'pending',
      currency: 'EUR',
    });

    // Actualizar stock
    for (const item of body.items) {
      const currentStock = item.stock - item.quantity;
      await updateProductStock(item.productId, currentStock);
    }

    return new Response(JSON.stringify({ order }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
};
*/

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 9: Formatear Precios Correctamente
// ═══════════════════════════════════════════════════════════════════════════

import { formatPrice } from '@utils/cart';

// Precio almacenado en BD en céntimos
const priceCents = 15990;

// Formatear a moneda
const priceFormatted = formatPrice(priceCents); // "€159,90"

// También funciona con otra moneda
const priceUSD = formatPrice(15990, 'USD'); // "$159.90"

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 10: Obtener Estado del Carrito
// ═══════════════════════════════════════════════════════════════════════════

import { getCartState } from '@stores/cart';

// En cualquier parte del código
const cartState = getCartState();
console.log(`Items: ${cartState.totalItems}`);
console.log(`Total: €${(cartState.totalPrice / 100).toFixed(2)}`);
console.log(`Productos:`, cartState.items);

// ═══════════════════════════════════════════════════════════════════════════
// PATRONES RECOMENDADOS
// ═══════════════════════════════════════════════════════════════════════════

/*
✅ HACER:

1. Usar SSG para catálogo (getStaticPaths)
2. Usar SSR para carrito y admin (output: 'hybrid')
3. Validar datos en cliente y servidor
4. Persistir carrito en localStorage
5. Usar Nano Stores para estado minimalista
6. Tipar todo con TypeScript
7. Mantener componentes pequeños y reutilizables
8. Documentar funciones complejas

❌ NO HACER:

1. Poner lógica de BD en componentes
2. Exponer claves privadas en cliente
3. Almacenar contraseñas en localStorage
4. Hacer consultas innecesarias a Supabase
5. Olvidar validar en servidor
6. Olvidar normalizar URLs de imágenes
7. Olvidar actualizar stock después de compra
8. Olvidar configurar RLS en tablas
*/

// ═══════════════════════════════════════════════════════════════════════════
