/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { s as supabase } from '../../supabase.41eewI-c.mjs';
import { $ as $$AdminLayout } from '../../AdminLayout.7POnspUO.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, BarChart, Bar } from 'recharts';
/* empty css                                 */
export { renderers } from '../../renderers.mjs';

function SalesAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchAnalytics();
  }, []);
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/analytics?days=7", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        }
      });
      if (!response.ok) {
        throw new Error("Error al cargar analíticas");
      }
      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsx("div", { className: "animate-spin", children: /* @__PURE__ */ jsxs("svg", { className: "w-8 h-8 text-primary-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
      /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
    ] }) }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "p-4 bg-red-50 border border-red-200 text-red-800 rounded", children: error });
  }
  if (!analytics) {
    return /* @__PURE__ */ jsx("div", { className: "p-4 text-primary-600", children: "No hay datos disponibles" });
  }
  const { last7days, byDay } = analytics;
  const chartData = byDay.map((day) => ({
    date: new Date(day.date).toLocaleDateString("es-ES", { weekday: "short", month: "short", day: "numeric" }),
    revenue: day.revenue,
    orders: day.orders,
    items: day.items
  }));
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-primary-200 p-6 rounded", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-primary-600 mb-1", children: "Pedidos" }),
        /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-primary-900", children: last7days.orders }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-primary-500 mt-2", children: "Últimos 7 días" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-primary-200 p-6 rounded", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-primary-600 mb-1", children: "Ingresos" }),
        /* @__PURE__ */ jsxs("p", { className: "text-3xl font-bold text-green-600", children: [
          "€",
          last7days.revenue.toFixed(2)
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-primary-500 mt-2", children: "Total vendido" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-primary-200 p-6 rounded", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-primary-600 mb-1", children: "Promedio/Pedido" }),
        /* @__PURE__ */ jsxs("p", { className: "text-3xl font-bold text-primary-900", children: [
          "€",
          last7days.averageOrder.toFixed(2)
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-primary-500 mt-2", children: "Ticket promedio" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-primary-200 p-6 rounded", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-primary-600 mb-1", children: "Productos" }),
        /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-primary-900", children: last7days.itemsSold }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-primary-500 mt-2", children: "Unidades vendidas" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-primary-200 p-6 rounded", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-4", children: "Ingresos por Día" }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(LineChart, { data: chartData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "date" }),
          /* @__PURE__ */ jsx(YAxis, {}),
          /* @__PURE__ */ jsx(Tooltip, { formatter: (value) => `€${value.toFixed(2)}` }),
          /* @__PURE__ */ jsx(Legend, {}),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "revenue", stroke: "#667eea", name: "Ingresos (€)" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-primary-200 p-6 rounded", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-4", children: "Pedidos y Productos" }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(BarChart, { data: chartData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "date" }),
          /* @__PURE__ */ jsx(YAxis, {}),
          /* @__PURE__ */ jsx(Tooltip, {}),
          /* @__PURE__ */ jsx(Legend, {}),
          /* @__PURE__ */ jsx(Bar, { dataKey: "orders", fill: "#667eea", name: "Pedidos" }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "items", fill: "#764ba2", name: "Productos" })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-primary-200 p-6 rounded", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-4", children: "Detalles por Día" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-primary-200", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-4 font-medium", children: "Fecha" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 px-4 font-medium", children: "Pedidos" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 px-4 font-medium", children: "Ingresos" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 px-4 font-medium", children: "Productos" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 px-4 font-medium", children: "Descuentos" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 px-4 font-medium", children: "Envío" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: byDay.map((day, idx) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-primary-100 hover:bg-primary-50", children: [
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4", children: new Date(day.date).toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          }) }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-right font-medium", children: day.orders }),
          /* @__PURE__ */ jsxs("td", { className: "py-3 px-4 text-right text-green-600 font-medium", children: [
            "€",
            day.revenue.toFixed(2)
          ] }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-right", children: day.items }),
          /* @__PURE__ */ jsxs("td", { className: "py-3 px-4 text-right text-orange-600", children: [
            "€",
            day.discount.toFixed(2)
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "py-3 px-4 text-right", children: [
            "€",
            day.shipping.toFixed(2)
          ] })
        ] }, idx)) })
      ] }) })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Analytics = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Analytics;
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) {
    return Astro2.redirect("/admin/login");
  }
  const { data: adminData, error: adminError } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single();
  if (!adminData || adminData.role !== "admin") {
    return Astro2.redirect("/");
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Anal\xEDticas de Ventas", "data-astro-cid-5a6mzon6": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6" data-astro-cid-5a6mzon6> <div class="flex items-center justify-between" data-astro-cid-5a6mzon6> <div data-astro-cid-5a6mzon6> <h1 class="text-3xl font-bold" data-astro-cid-5a6mzon6>Analíticas de Ventas</h1> <p class="text-primary-600 mt-1" data-astro-cid-5a6mzon6>Estadísticas de ventas y rendimiento</p> </div> </div> ${renderComponent($$result2, "SalesAnalyticsDashboard", SalesAnalyticsDashboard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/islands/SalesAnalyticsDashboard", "client:component-export": "default", "data-astro-cid-5a6mzon6": true })} </div> ` })} `;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/analytics.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/analytics.astro";
const $$url = "/admin/analytics";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Analytics,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
