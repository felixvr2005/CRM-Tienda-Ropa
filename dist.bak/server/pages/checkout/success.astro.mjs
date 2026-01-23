/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { a as $$PublicLayout } from '../../PublicLayout.D3A_txxX.mjs';
import Stripe from 'stripe';
import { a as supabaseAdmin } from '../../supabase.41eewI-c.mjs';
import { b as sendCustomerEmail } from '../../email.Yr7968NY.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Success = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Success;
  const stripe = new Stripe("sk_test_51SXzXlRrW2kGomeyvD6pFi2uUKew3HgdG9GfBuay0MJIVzCbAbwIPAR8NaDmjN990dAnlaDIpuIm1WDq8yYRNYea00NQuDx0fh");
  const sessionId = Astro2.url.searchParams.get("session_id");
  let order = null;
  let orderError = "";
  if (sessionId) {
    try {
      console.log("Processing checkout success for session:", sessionId);
      const { data: existingOrder } = await supabaseAdmin.from("orders").select("*").eq("stripe_checkout_session_id", sessionId).single();
      if (existingOrder) {
        console.log("Order already exists:", existingOrder.order_number);
        order = existingOrder;
      } else {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ["line_items"]
        });
        console.log("Stripe session status:", session.payment_status);
        console.log("Stripe session metadata:", session.metadata);
        console.log("Stripe session customer_email:", session.customer_email);
        console.log("Stripe session shipping_details:", session.shipping_details);
        if (session.payment_status === "paid") {
          const metadata = session.metadata || {};
          const items = metadata.items ? JSON.parse(metadata.items) : [];
          console.log("Items from metadata:", items);
          const email = session.customer_email || session.customer_details?.email || metadata.email || "felixvr2005@gmail.com";
          const phone = session.customer_details?.phone || metadata.phone || "";
          const shippingDetails = session.shipping_details;
          const shippingAddress = shippingDetails ? {
            name: shippingDetails.name || "",
            address: shippingDetails.address?.line1 || "",
            city: shippingDetails.address?.city || "",
            state: shippingDetails.address?.state || "",
            postal_code: shippingDetails.address?.postal_code || "",
            country: shippingDetails.address?.country || "ES"
          } : null;
          if (items.length > 0) {
            const { data: lastOrder } = await supabaseAdmin.from("orders").select("order_number").order("created_at", { ascending: false }).limit(1).single();
            let nextNumber = 1;
            if (lastOrder && lastOrder.order_number) {
              const match = lastOrder.order_number.match(/(\d+)$/);
              if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
              }
            }
            const orderNumber = nextNumber.toString().padStart(6, "0");
            console.log("Generated order number:", orderNumber);
            const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            const totalAmount = (session.amount_total || 0) / 100;
            const shippingCost = totalAmount - subtotal;
            let customerId = null;
            if (email) {
              const { data: existingCustomer } = await supabaseAdmin.from("customers").select("id").eq("email", email).single();
              if (existingCustomer) {
                customerId = existingCustomer.id;
              }
            }
            const orderData = {
              order_number: orderNumber,
              customer_id: customerId,
              customer_email: email,
              customer_name: shippingAddress?.name || "",
              customer_phone: phone,
              status: "pending",
              payment_status: "paid",
              payment_method: "stripe",
              stripe_checkout_session_id: sessionId,
              stripe_payment_intent_id: session.payment_intent,
              subtotal,
              shipping_cost: shippingCost > 0 ? shippingCost : 0,
              discount_amount: 0,
              total_amount: totalAmount,
              shipping_address: shippingAddress
            };
            console.log("Creating order:", orderData);
            const { data: newOrder, error: createError } = await supabaseAdmin.from("orders").insert(orderData).select().single();
            if (createError) {
              console.error("Error creating order:", createError);
              orderError = `Error al crear el pedido: ${createError.message}`;
            } else {
              order = newOrder;
              console.log("Order created successfully:", order.order_number);
              if (email) {
                try {
                  console.log(`📧 Preparando email de confirmación para: ${email}`);
                  const emailData = {
                    customer_name: shippingAddress?.name || "Cliente",
                    order_number: orderNumber,
                    order_date: (/* @__PURE__ */ new Date()).toLocaleDateString("es-ES"),
                    order_status: "Pendiente",
                    payment_method: "Tarjeta de Crédito (Stripe)",
                    products: items.map((item) => ({
                      product_name: item.name || "Producto",
                      product_sku: item.sku || "N/A",
                      quantity: item.quantity,
                      unit: "unidad",
                      unit_price: item.price,
                      total_price: item.price * item.quantity
                    })),
                    subtotal,
                    tax_rate: 0,
                    tax_amount: 0,
                    shipping_cost: shippingCost > 0 ? shippingCost : 0,
                    discount_applied: false,
                    discount_code: void 0,
                    discount_amount: 0,
                    total_amount: totalAmount,
                    active_offers: [],
                    recommendations: [],
                    promo_code_available: true,
                    promo_code: "WELCOME2026",
                    promo_description: "Código de bienvenida: 10% en tu próxima compra",
                    track_order_url: `${Astro2.site}/cuenta/pedidos/${orderNumber}`,
                    continue_shopping_url: `${Astro2.site}/productos`,
                    customer_address: shippingAddress ? `${shippingAddress.address}, ${shippingAddress.city} (${shippingAddress.postal_code})` : "",
                    support_email: "soporte@tiendamoda.com",
                    facebook_url: "https://facebook.com/tiendamoda",
                    instagram_url: "https://instagram.com/tiendamoda",
                    twitter_url: "https://twitter.com/tiendamoda",
                    company_name: "Tienda de Moda Premium",
                    current_year: (/* @__PURE__ */ new Date()).getFullYear()
                  };
                  const emailResult = await sendCustomerEmail(email, emailData);
                  console.log(`✅ Email enviado: ${emailResult.messageId}`);
                } catch (emailError) {
                  console.error("❌ Error enviando email:", emailError);
                }
              }
              for (const item of items) {
                console.log("Processing item:", item);
                const { data: variant, error: variantError } = await supabaseAdmin.from("product_variants").select(`
                  id, color, size, price_modifier, stock,
                  product:products(id, name, price, images)
                `).eq("id", item.variantId).single();
                if (variantError) {
                  console.error("Error fetching variant:", variantError);
                  continue;
                }
                if (variant) {
                  const variantData = variant;
                  const orderItemData = {
                    order_id: order.id,
                    product_id: variantData.product?.id || item.productId,
                    variant_id: item.variantId,
                    product_name: item.name || variantData.product?.name || "Producto",
                    size: variantData.size || "",
                    color: variantData.color || "",
                    quantity: item.quantity,
                    unit_price: item.price,
                    discount_percentage: 0,
                    total_price: item.price * item.quantity
                  };
                  console.log("Creating order item:", orderItemData);
                  const { error: itemError } = await supabaseAdmin.from("order_items").insert(orderItemData);
                  if (itemError) {
                    console.error("Error creating order item:", itemError);
                  }
                  console.log(`Stock para variant ${item.variantId} ya estaba reservado (cantidad: ${item.quantity})`);
                }
              }
            }
          } else {
            console.error("No items found in metadata");
            orderError = "No se encontraron productos en la sesión de pago";
          }
        } else {
          console.log("Payment not completed yet:", session.payment_status);
          orderError = "El pago aún no ha sido confirmado";
        }
      }
    } catch (err) {
      console.error("Error processing checkout:", err);
      orderError = err.message;
    }
  }
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Pedido confirmado", "showPromoBar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-2xl mx-auto px-4 py-20 text-center"> <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"> <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg> </div> <h1 class="font-display text-4xl mb-4">¡Gracias por tu pedido!</h1> ${order && renderTemplate`<div class="bg-green-50 border border-green-200 p-4 mb-6 text-left"> <p class="text-green-800 font-medium">Pedido #${order.order_number}</p> <p class="text-green-700 text-sm">Tu pedido ha sido registrado correctamente.</p> </div>`} <p class="text-primary-600 text-lg mb-8">
Tu pedido ha sido confirmado y está siendo procesado.
      Recibirás un email de confirmación en breve.
</p> ${sessionId && !order && renderTemplate`<p class="text-sm text-primary-500 mb-8">
ID de transacción: <span class="font-mono">${sessionId}</span> </p>`} ${orderError && renderTemplate`<div class="bg-yellow-50 border border-yellow-200 p-4 mb-6 text-left"> <p class="text-yellow-800 text-sm">${orderError}</p> </div>`} <div class="bg-primary-50 p-6 text-left mb-8"> <h2 class="font-medium mb-4">¿Qué pasa ahora?</h2> <ul class="space-y-3 text-sm text-primary-600"> <li class="flex items-start gap-3"> <span class="w-6 h-6 bg-primary-900 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</span> <span>Recibirás un email de confirmación con los detalles de tu pedido.</span> </li> <li class="flex items-start gap-3"> <span class="w-6 h-6 bg-primary-900 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</span> <span>Prepararemos tu pedido con el máximo cuidado.</span> </li> <li class="flex items-start gap-3"> <span class="w-6 h-6 bg-primary-900 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</span> <span>Te enviaremos un email con el número de seguimiento cuando tu pedido sea enviado.</span> </li> </ul> </div> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="/productos" class="bg-primary-900 text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-primary-800 transition-colors">
Seguir comprando
</a> <a href="/" class="border border-primary-300 px-8 py-3 text-sm tracking-widest uppercase hover:bg-primary-50 transition-colors">
Volver al inicio
</a> </div> </div> ${renderScript($$result2, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/checkout/success.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/checkout/success.astro", void 0);
const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/checkout/success.astro";
const $$url = "/checkout/success";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Success,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
