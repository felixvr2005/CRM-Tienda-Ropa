import '@stripe/stripe-js';
import Stripe from 'stripe';

function getStripeServer() {
  return new Stripe("sk_test_51SXzXlRrW2kGomeyvD6pFi2uUKew3HgdG9GfBuay0MJIVzCbAbwIPAR8NaDmjN990dAnlaDIpuIm1WDq8yYRNYea00NQuDx0fh", {
    apiVersion: "2025-02-24.acacia"
  });
}
const PAYMENT_METHOD_TYPES = [
  "card"
  // Tarjetas (Visa, Mastercard, Amex) - siempre disponible
];
async function createCheckoutSession(items, successUrl, cancelUrl, customerEmail, metadata) {
  const stripe = getStripeServer();
  const lineItems = items.map((item) => ({
    price_data: {
      currency: "eur",
      product_data: {
        name: item.name,
        description: item.description,
        images: item.image ? [item.image] : []
      },
      unit_amount: item.price
      // Ya viene en céntimos
    },
    quantity: item.quantity
  }));
  const sessionConfig = {
    line_items: lineItems,
    mode: "payment",
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    // Usar los métodos de pago configurados
    payment_method_types: PAYMENT_METHOD_TYPES,
    shipping_address_collection: {
      allowed_countries: ["ES", "PT", "FR", "IT", "DE", "BE", "NL", "AT", "PL", "CH"]
    },
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true
    },
    locale: "es",
    metadata: metadata || {}
  };
  return stripe.checkout.sessions.create(sessionConfig);
}
async function createStripeProduct(product) {
  const stripe = getStripeServer();
  return stripe.products.create({
    name: product.name,
    description: product.description || void 0,
    images: product.images || [],
    metadata: product.metadata || {}
  });
}
async function createStripePrice(options) {
  const stripe = getStripeServer();
  return stripe.prices.create({
    product: options.productId,
    unit_amount: options.unitAmount,
    // En céntimos
    currency: options.currency || "eur",
    metadata: options.metadata || {}
  });
}

export { createStripePrice as a, createCheckoutSession as b, createStripeProduct as c };
