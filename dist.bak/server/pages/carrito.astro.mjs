/* empty css                              */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $cart, s as startCartExpirationTimer, r as removeFromCart, u as updateQuantity, c as clearCart, g as getCartTimeRemaining, a as $$PublicLayout } from '../PublicLayout.D3A_txxX.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useStore } from '@nanostores/react';
import { useState, useEffect } from 'react';
import { f as formatPrice } from '../utils.Ceah_axf.mjs';
export { renderers } from '../renderers.mjs';

function CouponInput({ onCouponApplied, onCouponRemoved }) {
  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Ingresa un código de cupón");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase() })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Cupón inválido");
        return;
      }
      setAppliedCode(code.toUpperCase());
      setDiscountAmount(data.discount || 0);
      setSuccess(`¡Cupón aplicado! Descuento: -${data.discount_percentage || 0}%`);
      setCode("");
      onCouponApplied?.(code.toUpperCase(), data.discount || 0);
    } catch (err) {
      console.error("Coupon validation error:", err);
      setError("Error al validar el cupón");
    } finally {
      setIsLoading(false);
    }
  };
  const handleRemoveCoupon = () => {
    setAppliedCode(null);
    setDiscountAmount(0);
    setCode("");
    setError("");
    setSuccess("");
    onCouponRemoved?.();
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    appliedCode && /* @__PURE__ */ jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-green-600", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-green-900", children: appliedCode }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-green-700", children: "Cupón aplicado correctamente" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleRemoveCoupon,
          className: "text-green-600 hover:text-green-900 transition-colors",
          title: "Remover cupón",
          children: "✕"
        }
      )
    ] }) }),
    !appliedCode && /* @__PURE__ */ jsxs("form", { onSubmit: handleApplyCoupon, className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Código de cupón...",
          value: code,
          onChange: (e) => {
            setCode(e.target.value);
            setError("");
          },
          className: "flex-1 px-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm",
          disabled: isLoading
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isLoading || !code.trim(),
          className: "px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors",
          children: isLoading ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }),
            "Validando..."
          ] }) : "Aplicar"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-3", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-700", children: [
      "❌ ",
      error
    ] }) }),
    success && !appliedCode && /* @__PURE__ */ jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-green-700", children: [
      "✓ ",
      success
    ] }) })
  ] });
}

function CartPageContent() {
  const cart = useStore($cart);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  useEffect(() => {
    if (cart.length === 0) return;
    startCartExpirationTimer();
    const updateTimer = () => {
      setTimeRemaining(getCartTimeRemaining());
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1e3);
    return () => clearInterval(interval);
  }, [cart.length]);
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  const subtotal = cart.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
  const shipping = subtotal >= 100 ? 0 : 5.95;
  let discountAmount = 0;
  if (appliedCoupon && appliedCoupon.discountType === "percentage") {
    discountAmount = subtotal * appliedCoupon.discountPercentage / 100;
  }
  const total = subtotal - discountAmount + shipping;
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          couponCode: appliedCoupon?.code || null,
          discountAmount
        })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error al procesar el pago");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };
  if (cart.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-20", children: [
      /* @__PURE__ */ jsx("svg", { className: "w-20 h-20 mx-auto text-primary-300 mb-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1", d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" }) }),
      /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl mb-4", children: "Tu cesta está vacía" }),
      /* @__PURE__ */ jsx("p", { className: "text-primary-500 mb-8", children: "Descubre nuestra colección y añade tus prendas favoritas" }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/productos",
          className: "inline-block bg-primary-900 text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-primary-800 transition-colors",
          children: "Ver colección"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12", children: [
    timeRemaining > 0 && /* @__PURE__ */ jsx("div", { className: "lg:col-span-3", children: /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-center gap-2 py-3 px-4 rounded ${timeRemaining < 300 ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`, children: [
      /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
        /* @__PURE__ */ jsx("strong", { children: "Stock reservado por:" }),
        " ",
        formatTime(timeRemaining)
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-xs ml-2", children: timeRemaining < 300 ? "(¡Date prisa!)" : "(El stock se liberará al expirar)" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "border-b border-primary-200 pb-4 mb-4 hidden md:grid grid-cols-12 gap-4 text-xs uppercase tracking-wider text-primary-500", children: [
        /* @__PURE__ */ jsx("div", { className: "col-span-6", children: "Producto" }),
        /* @__PURE__ */ jsx("div", { className: "col-span-2 text-center", children: "Cantidad" }),
        /* @__PURE__ */ jsx("div", { className: "col-span-2 text-right", children: "Precio" }),
        /* @__PURE__ */ jsx("div", { className: "col-span-2 text-right", children: "Total" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: cart.map((item) => {
        const itemTotal = item.price * item.quantity;
        return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-4 py-4 border-b border-primary-100", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-span-12 md:col-span-6 flex gap-4", children: [
            /* @__PURE__ */ jsx("a", { href: `/productos/${item.slug}`, className: "w-24 h-32 bg-primary-100 flex-shrink-0", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: item.image,
                alt: item.name,
                className: "w-full h-full object-cover"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("a", { href: `/productos/${item.slug}`, className: "font-medium hover:underline block mb-1", children: item.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-primary-500 mb-2", children: [
                "Talla: ",
                item.size,
                " | Color: ",
                item.color
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "md:hidden flex items-center gap-2 mb-2", children: [
                item.discount > 0 && /* @__PURE__ */ jsx("span", { className: "text-sm text-primary-400 line-through", children: formatPrice(item.originalPrice) }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: formatPrice(item.price) })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: async () => await removeFromCart(item.variantId),
                  className: "text-xs text-primary-500 hover:text-red-600 underline",
                  children: "Eliminar"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "col-span-6 md:col-span-2 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center border border-primary-300", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: async () => await updateQuantity(item.variantId, item.quantity - 1),
                className: "w-8 h-8 flex items-center justify-center hover:bg-primary-100 transition-colors",
                disabled: item.quantity <= 1,
                children: "−"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "w-10 text-center text-sm", children: item.quantity }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: async () => await updateQuantity(item.variantId, item.quantity + 1),
                className: "w-8 h-8 flex items-center justify-center hover:bg-primary-100 transition-colors",
                children: "+"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "hidden md:flex col-span-2 items-center justify-end", children: /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            item.discount > 0 && /* @__PURE__ */ jsx("span", { className: "text-sm text-primary-400 line-through block", children: formatPrice(item.originalPrice) }),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: formatPrice(item.price) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-span-6 md:col-span-2 flex items-center justify-end", children: /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatPrice(itemTotal) }) })
        ] }, `${item.id}-${item.size}-${item.color}`);
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-6", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: async () => await clearCart(true),
            className: "text-sm text-primary-500 hover:text-red-600",
            children: "Vaciar cesta"
          }
        ),
        /* @__PURE__ */ jsx("a", { href: "/productos", className: "text-sm underline hover:no-underline", children: "Continuar comprando" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "bg-primary-50 p-6 sticky top-24", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-xl mb-6", children: "Resumen del pedido" }),
      /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx(
        CouponInput,
        {
          onCouponApplied: (code, discount) => {
            setAppliedCoupon({ code, discountPercentage: discount / subtotal * 100 });
            setCouponError("");
          },
          onCouponRemoved: () => {
            setAppliedCoupon(null);
            setPromoCode("");
          }
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm border-t border-primary-200 pt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-primary-600", children: "Subtotal" }),
          /* @__PURE__ */ jsx("span", { children: formatPrice(subtotal) })
        ] }),
        appliedCoupon && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-green-600 font-medium", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Descuento (",
            appliedCoupon.discountPercentage,
            "%)"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "-",
            formatPrice(discountAmount)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-primary-600", children: "Envío" }),
          /* @__PURE__ */ jsx("span", { children: shipping === 0 ? "Gratis" : formatPrice(shipping) })
        ] }),
        shipping > 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-primary-500", children: "Envío gratis en pedidos superiores a 100€" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-lg font-medium border-t border-primary-200 pt-3", children: [
          /* @__PURE__ */ jsx("span", { children: "Total" }),
          /* @__PURE__ */ jsx("span", { children: formatPrice(total) })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-primary-500", children: "IVA incluido" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleCheckout,
          disabled: isProcessing || cart.length === 0,
          className: "w-full bg-primary-900 text-white py-4 mt-6 text-sm tracking-widest uppercase hover:bg-primary-800 transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed",
          children: isProcessing ? "Procesando..." : "Finalizar compra"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-primary-500 mb-3", children: "Pago seguro con" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-primary-400", children: "Visa" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-primary-400", children: "Mastercard" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-primary-400", children: "PayPal" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-6 border-t border-primary-200 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-primary-400 flex-shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Pago 100% seguro" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-primary-500", children: "Conexión SSL encriptada" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-primary-400 flex-shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Devolución gratuita" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-primary-500", children: "30 días para devolver" })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}

const prerender = false;
const $$Carrito = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Tu cesta", "showPromoBar": false }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-[1400px] mx-auto px-4 lg:px-8 py-8"> <!-- Breadcrumb --> <nav class="text-sm text-primary-500 mb-8"> <a href="/" class="hover:text-primary-900">Inicio</a> <span class="mx-2">/</span> <span class="text-primary-900">Cesta</span> </nav> <h1 class="font-display text-3xl md:text-4xl mb-8">Tu cesta</h1> ${renderComponent($$result2, "CartPageContent", CartPageContent, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@components/islands/CartPageContent", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/carrito.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/carrito.astro";
const $$url = "/carrito";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Carrito,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
