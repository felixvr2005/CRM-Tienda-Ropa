import { e as createComponent, f as createAstro, m as maybeRenderHead, k as renderComponent, l as renderScript, r as renderTemplate, h as addAttribute, p as renderSlot } from './astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from './BaseLayout.BaGX5xKo.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useStore } from '@nanostores/react';
import { useState, useEffect, useRef } from 'react';
import { atom, computed } from 'nanostores';
import { f as formatPrice } from './utils.Ceah_axf.mjs';
import { s as supabase, a as supabaseAdmin } from './supabase.41eewI-c.mjs';

const $cart = atom([]);
const $isCartOpen = atom(false);
atom(false);
atom(null);
const $cartCount = computed(
  $cart,
  (cart) => cart.reduce((sum, item) => sum + item.quantity, 0)
);
const $cartSubtotal = computed(
  $cart,
  (cart) => cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
computed(
  $cart,
  (cart) => cart.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0)
);
const $hasItems = computed($cart, (cart) => cart.length > 0);
function initCart() {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem("fashionstore_cart");
    const expires = localStorage.getItem("fashionstore_cart_expires");
    if (saved && expires) {
      const expiresDate = new Date(expires);
      if (expiresDate > /* @__PURE__ */ new Date()) {
        $cart.set(JSON.parse(saved));
        startCartExpirationTimer();
      } else {
        clearCart();
      }
    }
  } catch (e) {
    console.error("Error loading cart:", e);
  }
}
function saveCart(cart) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("fashionstore_cart", JSON.stringify(cart));
    const expires = /* @__PURE__ */ new Date();
    expires.setMinutes(expires.getMinutes() + 15);
    localStorage.setItem("fashionstore_cart_expires", expires.toISOString());
  } catch (e) {
    console.error("Error saving cart:", e);
  }
}
async function addToCart(item, quantity = 1) {
  const cart = $cart.get();
  const existingIndex = cart.findIndex((i) => i.variantId === item.variantId);
  let newCart;
  let quantityToReserve = quantity;
  if (existingIndex >= 0) {
    const existingItem = cart[existingIndex];
    const newQty = Math.min(existingItem.quantity + quantity, existingItem.maxStock);
    quantityToReserve = newQty - existingItem.quantity;
    newCart = cart.map((i, idx) => {
      if (idx === existingIndex) {
        return { ...i, quantity: newQty };
      }
      return i;
    });
  } else {
    quantityToReserve = Math.min(quantity, item.maxStock);
    newCart = [...cart, { ...item, quantity: quantityToReserve }];
  }
  if (quantityToReserve > 0) {
    try {
      const response = await fetch("/api/stock/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: item.variantId, quantity: quantityToReserve })
      });
      if (!response.ok) {
        const error = await response.json();
        console.error("Error reservando stock:", error);
        alert(error.error || "Error al reservar el producto");
        return;
      }
    } catch (e) {
      console.error("Error en reserva de stock:", e);
    }
  }
  $cart.set(newCart);
  saveCart(newCart);
  startCartExpirationTimer();
  $isCartOpen.set(true);
}
async function updateQuantity(variantId, quantity) {
  const cart = $cart.get();
  const item = cart.find((i) => i.variantId === variantId);
  if (!item) return;
  if (quantity <= 0) {
    await removeFromCart(variantId);
    return;
  }
  const oldQty = item.quantity;
  const newQty = Math.min(quantity, item.maxStock);
  const diff = newQty - oldQty;
  if (diff > 0) {
    try {
      const response = await fetch("/api/stock/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: diff })
      });
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Stock insuficiente");
        return;
      }
    } catch (e) {
      console.error("Error reservando stock:", e);
      return;
    }
  } else if (diff < 0) {
    try {
      await fetch("/api/stock/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: Math.abs(diff) })
      });
    } catch (e) {
      console.error("Error liberando stock:", e);
    }
  }
  const newCart = cart.map((i) => {
    if (i.variantId === variantId) {
      return { ...i, quantity: newQty };
    }
    return i;
  });
  $cart.set(newCart);
  saveCart(newCart);
}
async function removeFromCart(variantId) {
  const cart = $cart.get();
  const item = cart.find((i) => i.variantId === variantId);
  if (item) {
    try {
      await fetch("/api/stock/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: item.quantity })
      });
    } catch (e) {
      console.error("Error liberando stock:", e);
    }
  }
  const newCart = cart.filter((i) => i.variantId !== variantId);
  $cart.set(newCart);
  saveCart(newCart);
}
async function clearCart(releaseStock = true) {
  const cart = $cart.get();
  if (releaseStock && cart.length > 0) {
    for (const item of cart) {
      try {
        await fetch("/api/stock/release", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity })
        });
      } catch (e) {
        console.error("Error liberando stock:", e);
      }
    }
  }
  $cart.set([]);
  if (typeof window !== "undefined") {
    localStorage.removeItem("fashionstore_cart");
    localStorage.removeItem("fashionstore_cart_expires");
    window.dispatchEvent(new CustomEvent("cart:cleared"));
  }
}
let cartExpirationTimer = null;
function startCartExpirationTimer() {
  if (typeof window === "undefined") return;
  if (cartExpirationTimer) {
    clearTimeout(cartExpirationTimer);
  }
  const expires = localStorage.getItem("fashionstore_cart_expires");
  if (!expires) return;
  const expiresDate = new Date(expires);
  const now = /* @__PURE__ */ new Date();
  const msUntilExpiry = expiresDate.getTime() - now.getTime();
  if (msUntilExpiry <= 0) {
    clearCart(true);
    return;
  }
  cartExpirationTimer = setTimeout(async () => {
    await clearCart(true);
    alert("Tu carrito ha expirado después de 15 minutos. Los productos han sido devueltos al stock.");
  }, msUntilExpiry);
}
function getCartTimeRemaining() {
  if (typeof window === "undefined") return 0;
  const expires = localStorage.getItem("fashionstore_cart_expires");
  if (!expires) return 0;
  const expiresDate = new Date(expires);
  const now = /* @__PURE__ */ new Date();
  const msRemaining = expiresDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(msRemaining / 1e3));
}

function CartContent() {
  const cart = useStore($cart);
  const subtotal = useStore($cartSubtotal);
  const hasItems = useStore($hasItems);
  const [timeRemaining, setTimeRemaining] = useState(0);
  useEffect(() => {
    if (!hasItems) return;
    startCartExpirationTimer();
    const updateTimer = () => {
      const remaining = getCartTimeRemaining();
      setTimeRemaining(remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1e3);
    return () => clearInterval(interval);
  }, [hasItems, cart]);
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  const handleQuantityChange = async (variantId, newQty) => {
    await updateQuantity(variantId, newQty);
  };
  const handleRemove = async (variantId) => {
    await removeFromCart(variantId);
  };
  const handleCheckout = () => {
    window.location.href = "/carrito";
  };
  if (!hasItems) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6", children: [
      /* @__PURE__ */ jsx("svg", { className: "w-16 h-16 text-primary-300 mb-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1", d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-primary-500 text-sm mb-4", children: "Tu cesta está vacía" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.closeCart?.(),
          className: "text-sm underline hover:no-underline",
          children: "Continuar comprando"
        }
      )
    ] });
  }
  const shippingCost = subtotal >= 100 ? 0 : 5.95;
  const total = subtotal + shippingCost;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-[calc(100vh-64px)]", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-6 space-y-6", children: cart.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx("a", { href: `/productos/${item.slug}`, className: "flex-shrink-0 w-20 aspect-[3/4] bg-primary-100", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: item.image || "https://via.placeholder.com/100x100?text=Imagen",
          alt: item.name,
          className: "w-full h-full object-cover"
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: `/productos/${item.slug}`,
            className: "text-sm font-medium text-primary-900 hover:underline line-clamp-1",
            children: item.name
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-primary-500 mt-1", children: [
          item.size,
          " | ",
          item.color
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleQuantityChange(item.variantId, item.quantity - 1),
              className: "w-7 h-7 border border-primary-300 flex items-center justify-center hover:border-primary-900 transition-colors",
              "aria-label": "Reducir cantidad",
              children: "-"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "w-8 text-center text-sm", children: item.quantity }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleQuantityChange(item.variantId, item.quantity + 1),
              disabled: item.quantity >= item.maxStock,
              className: "w-7 h-7 border border-primary-300 flex items-center justify-center hover:border-primary-900 transition-colors disabled:opacity-50",
              "aria-label": "Aumentar cantidad",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: formatPrice(item.price * item.quantity) }),
          item.originalPrice > item.price && /* @__PURE__ */ jsx("span", { className: "text-xs text-primary-400 line-through", children: formatPrice(item.originalPrice * item.quantity) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleRemove(item.variantId),
          className: "p-1 text-primary-400 hover:text-primary-900 transition-colors",
          "aria-label": "Eliminar",
          children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M6 18L18 6M6 6l12 12" }) })
        }
      )
    ] }, item.id)) }),
    /* @__PURE__ */ jsxs("div", { className: "border-t border-primary-200 p-6 space-y-4", children: [
      timeRemaining > 0 && /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-center gap-2 py-2 px-3 rounded text-sm ${timeRemaining < 300 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`, children: [
        /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
        /* @__PURE__ */ jsxs("span", { children: [
          "Reservado por: ",
          /* @__PURE__ */ jsx("strong", { children: formatTime(timeRemaining) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-primary-500", children: "Subtotal" }),
        /* @__PURE__ */ jsx("span", { children: formatPrice(subtotal) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-primary-500", children: "Envío" }),
        /* @__PURE__ */ jsx("span", { children: shippingCost === 0 ? "Gratis" : formatPrice(shippingCost) })
      ] }),
      shippingCost > 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-primary-400", children: "Envío gratis en pedidos superiores a 100€" }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-base font-medium pt-2 border-t border-primary-200", children: [
        /* @__PURE__ */ jsx("span", { children: "Total" }),
        /* @__PURE__ */ jsx("span", { children: formatPrice(total) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleCheckout,
          className: "w-full bg-primary-900 text-white text-sm tracking-widest uppercase py-4 hover:bg-primary-800 transition-colors",
          children: "Tramitar pedido"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.closeCart?.(),
          className: "w-full text-sm text-primary-500 hover:text-primary-900 transition-colors",
          children: "Continuar comprando"
        }
      )
    ] })
  ] });
}

const $$Astro$1 = createAstro();
const $$CartSlideOver = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CartSlideOver;
  return renderTemplate`${maybeRenderHead()}<div id="cart-slideover" class="fixed inset-0 z-50 hidden" aria-labelledby="cart-title" role="dialog" aria-modal="true"> <!-- Overlay --> <div class="absolute inset-0 bg-black/40 transition-opacity duration-300 opacity-0" id="cart-overlay"></div> <!-- Panel --> <div class="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl transform translate-x-full transition-transform duration-300" id="cart-panel"> <!-- Header --> <div class="flex items-center justify-between h-16 px-6 border-b border-primary-200"> <h2 id="cart-title" class="text-sm tracking-widest uppercase font-medium">
Tu cesta
</h2> <button id="close-cart-btn" class="p-2 hover:bg-primary-100 rounded-full transition-colors" aria-label="Cerrar carrito"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> <!-- Cart Content (React Island) --> ${renderComponent($$result, "CartContent", CartContent, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@components/islands/CartContent", "client:component-export": "default" })} </div> </div> ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/components/ui/CartSlideOver.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/components/ui/CartSlideOver.astro", void 0);

function CartIcon() {
  const count = useStore($cartCount);
  useEffect(() => {
    initCart();
  }, []);
  const openCart = () => {
    window.openCart?.();
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: openCart,
      className: "relative p-2 hover:bg-primary-100 rounded-full transition-colors",
      "aria-label": `Carrito (${count} artículos)`,
      children: [
        /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "1.5",
            d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          }
        ) }),
        count > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 w-5 h-5 bg-primary-900 text-white text-2xs flex items-center justify-center rounded-full", children: count > 99 ? "99+" : count })
      ]
    }
  );
}

function LiveSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceTimer = useRef(null);
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/products?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error("Error searching:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;
      if (!target.closest("[data-live-search]")) {
        setShowResults(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "relative", "data-live-search": true, children: [
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        "svg",
        {
          className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Buscar productos...",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          onFocus: () => query.trim() && setShowResults(true),
          className: "w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
        }
      ),
      isLoading && /* @__PURE__ */ jsxs(
        "svg",
        {
          className: "absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-600 animate-spin",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: [
            /* @__PURE__ */ jsx(
              "circle",
              {
                className: "opacity-25",
                cx: "12",
                cy: "12",
                r: "10",
                stroke: "currentColor",
                strokeWidth: "4"
              }
            ),
            /* @__PURE__ */ jsx(
              "path",
              {
                className: "opacity-75",
                fill: "currentColor",
                d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              }
            )
          ]
        }
      )
    ] }),
    showResults && query.trim() && /* @__PURE__ */ jsx("div", { className: "absolute top-full left-0 right-0 mt-1 bg-white border border-primary-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto", children: results.length > 0 ? /* @__PURE__ */ jsx("div", { className: "divide-y divide-primary-100", children: results.map((result) => {
      const price = result.price / 100;
      const discountedPrice = price * (1 - result.discount_percentage / 100);
      return /* @__PURE__ */ jsxs(
        "a",
        {
          href: `/productos/${result.slug}`,
          className: "flex items-center gap-3 p-3 hover:bg-primary-50 transition-colors",
          children: [
            result.image_url && /* @__PURE__ */ jsx(
              "img",
              {
                src: result.image_url,
                alt: result.name,
                className: "w-12 h-12 object-cover rounded"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-primary-900 truncate", children: result.name }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-primary-600", children: [
                  "€",
                  discountedPrice.toFixed(2)
                ] }),
                result.discount_percentage > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-primary-400 line-through", children: [
                    "€",
                    price.toFixed(2)
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded", children: [
                    "-",
                    result.discount_percentage,
                    "%"
                  ] })
                ] })
              ] })
            ] })
          ]
        },
        result.id
      );
    }) }) : /* @__PURE__ */ jsxs("div", { className: "p-6 text-center text-sm text-primary-500", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        'No encontramos "',
        query,
        '"'
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-primary-400 mt-1", children: "Prueba con otros términos" })
    ] }) })
  ] });
}

const $$Astro = createAstro();
const $$PublicLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PublicLayout;
  const { title, description, showPromoBar = true } = Astro2.props;
  const currentPath = Astro2.url.pathname;
  let isAdmin = false;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  if (accessToken) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (user && !authError) {
        try {
          const { data: adminUser, error: adminError } = await supabaseAdmin.from("admin_users").select("id, is_active").eq("auth_user_id", user.id).eq("is_active", true).single();
          if (adminUser && !adminError) {
            isAdmin = true;
          }
        } catch (e) {
        }
      }
    } catch (error) {
    }
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description }, { "default": async ($$result2) => renderTemplate`  ${showPromoBar && renderTemplate`${maybeRenderHead()}<div class="bg-primary-900 text-white text-center py-2 text-xs tracking-widest uppercase"> <span>Envío gratis en pedidos superiores a 100€</span> </div>`} <header class="sticky top-0 z-40 bg-white border-b border-primary-200"> <div class="max-w-[1800px] mx-auto"> <nav class="flex items-center justify-between h-16 px-4 lg:px-8"> <!-- Mobile Menu Button --> <button id="mobile-menu-btn" class="lg:hidden p-2 -ml-2" aria-label="Menú"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </button> <!-- Logo --> <a href="/" class="font-display text-xl lg:text-2xl tracking-[0.2em] uppercase font-semibold">
Fashion Store
</a> <!-- Desktop Navigation --> <div class="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"> <a href="/productos"${addAttribute(`text-sm tracking-wider uppercase hover:text-primary-600 transition-colors ${currentPath.startsWith("/productos") ? "border-b border-current" : ""}`, "class")}>
Colección
</a> <a href="/categoria/novedades"${addAttribute(`text-sm tracking-wider uppercase hover:text-primary-600 transition-colors ${currentPath === "/categoria/novedades" ? "border-b border-current" : ""}`, "class")}>
Novedades
</a> <a href="/categoria/ofertas"${addAttribute(`text-sm tracking-wider uppercase text-red-600 hover:text-red-700 transition-colors ${currentPath === "/categoria/ofertas" ? "border-b border-current" : ""}`, "class")}>
Sale
</a> </div> <!-- Right Actions --> <div class="flex items-center gap-4"> <!-- Admin Link (solo para admins) --> ${isAdmin && renderTemplate`<a href="/admin" class="hidden sm:block px-3 py-2 text-xs tracking-widest uppercase font-medium rounded-full bg-primary-100 text-primary-900 hover:bg-primary-200 transition-all" title="Ir al panel de admin">Admin</a>`} <!-- Live Search --> ${renderComponent($$result2, "LiveSearch", LiveSearch, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@components/islands/LiveSearch", "client:component-export": "default" })} <!-- Account --> <a href="/cuenta" class="hidden sm:block p-2 hover:bg-primary-100 rounded-full transition-colors" aria-label="Mi cuenta"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg> </a> <!-- Cart --> ${renderComponent($$result2, "CartIcon", CartIcon, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@components/islands/CartIcon", "client:component-export": "default" })} </div> </nav> </div> </header>  <div id="mobile-menu" class="fixed inset-0 z-50 hidden"> <div class="absolute inset-0 bg-black/50" id="mobile-menu-overlay"></div> <div class="absolute left-0 top-0 bottom-0 w-80 bg-white transform -translate-x-full transition-transform duration-300" id="mobile-menu-panel"> <div class="flex items-center justify-between p-4 border-b"> <span class="font-display text-lg tracking-widest uppercase">Menú</span> <button id="close-mobile-menu" class="p-2"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> <nav class="p-4 space-y-4"> <a href="/productos" class="block py-3 text-lg border-b border-primary-100">Colección</a> <a href="/categoria/novedades" class="block py-3 text-lg border-b border-primary-100">Novedades</a> <a href="/categoria/ofertas" class="block py-3 text-lg text-red-600 border-b border-primary-100">Sale</a> <a href="/cuenta" class="block py-3 text-lg border-b border-primary-100">Mi Cuenta</a> </nav> </div> </div>  <main class="min-h-screen"> ${renderSlot($$result2, $$slots["default"])} </main>  ${renderComponent($$result2, "CartSlideOver", $$CartSlideOver, {})}  <footer class="bg-primary-950 text-white mt-20"> <div class="max-w-[1800px] mx-auto px-4 lg:px-8 py-16"> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"> <!-- Brand --> <div> <h3 class="font-display text-2xl tracking-widest uppercase mb-4">Fashion Store</h3> <p class="text-primary-400 text-sm leading-relaxed">
Moda premium para el hombre moderno. Calidad, estilo y elegancia en cada prenda.
</p> </div> <!-- Shop --> <div> <h4 class="text-sm tracking-widest uppercase mb-4">Tienda</h4> <ul class="space-y-2 text-primary-400 text-sm"> <li><a href="/productos" class="hover:text-white transition-colors">Colección</a></li> <li><a href="/categoria/novedades" class="hover:text-white transition-colors">Novedades</a></li> <li><a href="/categoria/ofertas" class="hover:text-white transition-colors">Ofertas</a></li> </ul> </div> <!-- Help --> <div> <h4 class="text-sm tracking-widest uppercase mb-4">Ayuda</h4> <ul class="space-y-2 text-primary-400 text-sm"> <li><a href="/envios" class="hover:text-white transition-colors">Envíos y devoluciones</a></li> <li><a href="/contacto" class="hover:text-white transition-colors">Contacto</a></li> <li><a href="/sobre-nosotros" class="hover:text-white transition-colors">Sobre nosotros</a></li> </ul> </div> <!-- Legal --> <div class="lg:hidden"> <h4 class="text-sm tracking-widest uppercase mb-4">Legal</h4> <ul class="space-y-2 text-primary-400 text-sm"> <li><a href="/terminos" class="hover:text-white transition-colors">Términos y condiciones</a></li> <li><a href="/privacidad" class="hover:text-white transition-colors">Política de privacidad</a></li> </ul> </div> <!-- Newsletter --> <div> <h4 class="text-sm tracking-widest uppercase mb-4">Newsletter</h4> <p class="text-primary-400 text-sm mb-4">Suscríbete para recibir ofertas exclusivas</p> <form class="flex"> <input type="email" placeholder="tu@email.com" class="flex-1 bg-primary-900 border border-primary-700 px-4 py-2 text-sm placeholder:text-primary-500 focus:outline-none focus:border-white"> <button type="submit" class="bg-white text-primary-900 px-4 py-2 text-sm font-medium hover:bg-primary-100 transition-colors">
OK
</button> </form> </div> </div> <!-- Bottom --> <div class="border-t border-primary-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"> <p class="text-primary-500 text-xs">© 2026 Fashion Store. Todos los derechos reservados.</p> <div class="hidden lg:flex items-center gap-4 text-primary-500 text-xs"> <a href="/terminos" class="hover:text-white transition-colors">Términos</a> <span>|</span> <a href="/privacidad" class="hover:text-white transition-colors">Privacidad</a> </div> <div class="flex items-center gap-4"> <span class="text-primary-500 text-xs">Pago seguro:</span> <div class="flex gap-2 text-primary-400"> <span class="text-xs border border-primary-700 px-2 py-1">VISA</span> <span class="text-xs border border-primary-700 px-2 py-1">MC</span> <span class="text-xs border border-primary-700 px-2 py-1">AMEX</span> </div> </div> </div> </div> </footer> ` })} ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/layouts/PublicLayout.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/layouts/PublicLayout.astro", void 0);

export { $cart as $, $$PublicLayout as a, addToCart as b, clearCart as c, getCartTimeRemaining as g, removeFromCart as r, startCartExpirationTimer as s, updateQuantity as u };
