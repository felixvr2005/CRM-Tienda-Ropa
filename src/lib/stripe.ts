/**
 * Stripe Client Configuration
 * Soporta múltiples métodos de pago
 */
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import StripeServer from 'stripe';

let stripePromise: Promise<Stripe | null>;

// Cliente de Stripe para el browser
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

// Cliente de Stripe para el servidor
export function getStripeServer() {
  return new StripeServer(import.meta.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

// Métodos de pago - Empezar solo con card que siempre funciona
// Luego puedes añadir más cuando verifiques que están habilitados en Stripe
const PAYMENT_METHOD_TYPES: StripeServer.Checkout.SessionCreateParams.PaymentMethodType[] = [
  'card',              // Tarjetas (Visa, Mastercard, Amex) - siempre disponible
];

// Crear sesión de checkout con todos los métodos de pago
export async function createCheckoutSession(
  items: Array<{
    name: string;
    description?: string;
    price: number;
    quantity: number;
    image?: string;
  }>,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string,
  metadata?: Record<string, string>
) {
  const stripe = getStripeServer();

  const lineItems = items.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.name,
        description: item.description,
        images: item.image ? [item.image] : [],
      },
      unit_amount: item.price, // Ya viene en céntimos
    },
    quantity: item.quantity,
  }));

  // Configuración de la sesión con métodos de pago explícitos
  // Esto permite usar todos los métodos habilitados en el Dashboard de Stripe
  const sessionConfig: StripeServer.Checkout.SessionCreateParams = {
    line_items: lineItems,
    mode: 'payment',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    // Usar los métodos de pago configurados
    payment_method_types: PAYMENT_METHOD_TYPES,
    shipping_address_collection: {
      allowed_countries: ['ES', 'PT', 'FR', 'IT', 'DE', 'BE', 'NL', 'AT', 'PL', 'CH'],
    },
    billing_address_collection: 'required',
    phone_number_collection: {
      enabled: true,
    },
    locale: 'es',
    metadata: metadata || {},
  };

  // Añadir email si se proporciona
  if (customerEmail) {
    sessionConfig.customer_email = customerEmail;
  }

  return stripe.checkout.sessions.create(sessionConfig);
}

// Crear producto en Stripe (para sincronización automática)
export async function createStripeProduct(product: {
  name: string;
  description?: string;
  images?: string[];
  metadata?: Record<string, string>;
}) {
  const stripe = getStripeServer();
  
  return stripe.products.create({
    name: product.name,
    description: product.description || undefined,
    images: product.images || [],
    metadata: product.metadata || {},
  });
}

// Crear precio para un producto en Stripe
export async function createStripePrice(options: {
  productId: string;
  unitAmount: number;
  currency?: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripeServer();
  
  return stripe.prices.create({
    product: options.productId,
    unit_amount: options.unitAmount, // En céntimos
    currency: options.currency || 'eur',
    metadata: options.metadata || {},
  });
}

// Crear un Payment Link para un producto (compra directa)
export async function createPaymentLink(
  priceId: string,
  quantity: number = 1,
  metadata?: Record<string, string>
) {
  const stripe = getStripeServer();
  
  return stripe.paymentLinks.create({
    line_items: [
      {
        price: priceId,
        quantity: quantity,
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
          maximum: 10,
        },
      },
    ],
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['ES', 'PT', 'FR', 'IT', 'DE', 'BE', 'NL', 'AT', 'PL', 'CH'],
    },
    phone_number_collection: {
      enabled: true,
    },
    metadata: metadata || {},
  });
}

// Recuperar sesión de checkout
export async function retrieveCheckoutSession(sessionId: string) {
  const stripe = getStripeServer();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer', 'payment_intent'],
  });
}

// Listar productos de Stripe
export async function listStripeProducts(limit: number = 100) {
  const stripe = getStripeServer();
  return stripe.products.list({ limit, active: true });
}

// Actualizar producto en Stripe
export async function updateStripeProduct(
  productId: string,
  updates: {
    name?: string;
    description?: string;
    images?: string[];
    active?: boolean;
    metadata?: Record<string, string>;
  }
) {
  const stripe = getStripeServer();
  return stripe.products.update(productId, updates);
}
