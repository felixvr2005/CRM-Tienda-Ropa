import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './_@astrojs-ssr-adapter.aHRKeu_p.mjs';
import { manifest } from './manifest_CjAz15e6.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/analytics.astro.mjs');
const _page2 = () => import('./pages/admin/categorias/nueva.astro.mjs');
const _page3 = () => import('./pages/admin/categorias/_id_.astro.mjs');
const _page4 = () => import('./pages/admin/categorias.astro.mjs');
const _page5 = () => import('./pages/admin/devoluciones/debug-_id_.astro.mjs');
const _page6 = () => import('./pages/admin/devoluciones/_id_.astro.mjs');
const _page7 = () => import('./pages/admin/devoluciones.astro.mjs');
const _page8 = () => import('./pages/admin/login.astro.mjs');
const _page9 = () => import('./pages/admin/pedidos/_ordernumber_.astro.mjs');
const _page10 = () => import('./pages/admin/pedidos.astro.mjs');
const _page11 = () => import('./pages/admin/productos/create-edit.astro.mjs');
const _page12 = () => import('./pages/admin/productos/nuevo.astro.mjs');
const _page13 = () => import('./pages/admin/productos/_id_.astro.mjs');
const _page14 = () => import('./pages/admin/productos.astro.mjs');
const _page15 = () => import('./pages/admin/reports.astro.mjs');
const _page16 = () => import('./pages/admin/settings.astro.mjs');
const _page17 = () => import('./pages/admin/variantes/_productid_.astro.mjs');
const _page18 = () => import('./pages/admin.astro.mjs');
const _page19 = () => import('./pages/api/admin/analytics.astro.mjs');
const _page20 = () => import('./pages/api/admin/confirm-return.astro.mjs');
const _page21 = () => import('./pages/api/admin/export.astro.mjs');
const _page22 = () => import('./pages/api/admin/fix-order-totals.astro.mjs');
const _page23 = () => import('./pages/api/admin/images.astro.mjs');
const _page24 = () => import('./pages/api/admin/orders/update-status.astro.mjs');
const _page25 = () => import('./pages/api/admin/orders/update-tracking.astro.mjs');
const _page26 = () => import('./pages/api/admin/product-types/sizes.astro.mjs');
const _page27 = () => import('./pages/api/admin/products/save.astro.mjs');
const _page28 = () => import('./pages/api/admin/products/sync-stripe-prices.astro.mjs');
const _page29 = () => import('./pages/api/admin/products/variants.astro.mjs');
const _page30 = () => import('./pages/api/admin/products/_id_.astro.mjs');
const _page31 = () => import('./pages/api/admin/products.astro.mjs');
const _page32 = () => import('./pages/api/admin/report.astro.mjs');
const _page33 = () => import('./pages/api/admin/returns/send-label.astro.mjs');
const _page34 = () => import('./pages/api/admin/returns/_id_/refund.astro.mjs');
const _page35 = () => import('./pages/api/admin/returns/_id_/status.astro.mjs');
const _page36 = () => import('./pages/api/admin/settings.astro.mjs');
const _page37 = () => import('./pages/api/admin/upload-image.astro.mjs');
const _page38 = () => import('./pages/api/admin/variant-images/_imageid_.astro.mjs');
const _page39 = () => import('./pages/api/admin/variant-images.astro.mjs');
const _page40 = () => import('./pages/api/admin/variants/_variantid_.astro.mjs');
const _page41 = () => import('./pages/api/auth/change-password.astro.mjs');
const _page42 = () => import('./pages/api/auth/login.astro.mjs');
const _page43 = () => import('./pages/api/auth/logout.astro.mjs');
const _page44 = () => import('./pages/api/cart/merge.astro.mjs');
const _page45 = () => import('./pages/api/cart.astro.mjs');
const _page46 = () => import('./pages/api/checkout/create-session.astro.mjs');
const _page47 = () => import('./pages/api/checkout.astro.mjs');
const _page48 = () => import('./pages/api/contact.astro.mjs');
const _page49 = () => import('./pages/api/coupons/validate.astro.mjs');
const _page50 = () => import('./pages/api/emails/order-confirmation.astro.mjs');
const _page51 = () => import('./pages/api/invoices/credit-note.astro.mjs');
const _page52 = () => import('./pages/api/invoices/generate.astro.mjs');
const _page53 = () => import('./pages/api/newsletter/subscribe.astro.mjs');
const _page54 = () => import('./pages/api/orders/cancel.astro.mjs');
const _page55 = () => import('./pages/api/orders/request-return.astro.mjs');
const _page56 = () => import('./pages/api/search/products.astro.mjs');
const _page57 = () => import('./pages/api/stock/release.astro.mjs');
const _page58 = () => import('./pages/api/stock/reserve.astro.mjs');
const _page59 = () => import('./pages/api/webhooks/stripe.astro.mjs');
const _page60 = () => import('./pages/carrito.astro.mjs');
const _page61 = () => import('./pages/categoria/novedades.astro.mjs');
const _page62 = () => import('./pages/categoria/ofertas.astro.mjs');
const _page63 = () => import('./pages/categoria/_slug_.astro.mjs');
const _page64 = () => import('./pages/checkout/success.astro.mjs');
const _page65 = () => import('./pages/checkout.astro.mjs');
const _page66 = () => import('./pages/contacto.astro.mjs');
const _page67 = () => import('./pages/cuenta/cambiar-contraseña.astro.mjs');
const _page68 = () => import('./pages/cuenta/devoluciones/_id_.astro.mjs');
const _page69 = () => import('./pages/cuenta/devoluciones.astro.mjs');
const _page70 = () => import('./pages/cuenta/direcciones.astro.mjs');
const _page71 = () => import('./pages/cuenta/favoritos.astro.mjs');
const _page72 = () => import('./pages/cuenta/login.astro.mjs');
const _page73 = () => import('./pages/cuenta/nueva-password.astro.mjs');
const _page74 = () => import('./pages/cuenta/pedidos/_ordernumber_.astro.mjs');
const _page75 = () => import('./pages/cuenta/pedidos.astro.mjs');
const _page76 = () => import('./pages/cuenta/perfil.astro.mjs');
const _page77 = () => import('./pages/cuenta/registro.astro.mjs');
const _page78 = () => import('./pages/cuenta.astro.mjs');
const _page79 = () => import('./pages/envios.astro.mjs');
const _page80 = () => import('./pages/privacidad.astro.mjs');
const _page81 = () => import('./pages/productos/_slug_.astro.mjs');
const _page82 = () => import('./pages/productos.astro.mjs');
const _page83 = () => import('./pages/sobre-nosotros.astro.mjs');
const _page84 = () => import('./pages/terminos.astro.mjs');
const _page85 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/admin/analytics.astro", _page1],
    ["src/pages/admin/categorias/nueva.astro", _page2],
    ["src/pages/admin/categorias/[id].astro", _page3],
    ["src/pages/admin/categorias/index.astro", _page4],
    ["src/pages/admin/devoluciones/debug-[id].astro", _page5],
    ["src/pages/admin/devoluciones/[id].astro", _page6],
    ["src/pages/admin/devoluciones/index.astro", _page7],
    ["src/pages/admin/login.astro", _page8],
    ["src/pages/admin/pedidos/[orderNumber].astro", _page9],
    ["src/pages/admin/pedidos/index.astro", _page10],
    ["src/pages/admin/productos/create-edit.astro", _page11],
    ["src/pages/admin/productos/nuevo.astro", _page12],
    ["src/pages/admin/productos/[id].astro", _page13],
    ["src/pages/admin/productos/index.astro", _page14],
    ["src/pages/admin/reports.astro", _page15],
    ["src/pages/admin/settings.astro", _page16],
    ["src/pages/admin/variantes/[productId].astro", _page17],
    ["src/pages/admin/index.astro", _page18],
    ["src/pages/api/admin/analytics.ts", _page19],
    ["src/pages/api/admin/confirm-return.ts", _page20],
    ["src/pages/api/admin/export.ts", _page21],
    ["src/pages/api/admin/fix-order-totals.ts", _page22],
    ["src/pages/api/admin/images.ts", _page23],
    ["src/pages/api/admin/orders/update-status.ts", _page24],
    ["src/pages/api/admin/orders/update-tracking.ts", _page25],
    ["src/pages/api/admin/product-types/sizes.ts", _page26],
    ["src/pages/api/admin/products/save.ts", _page27],
    ["src/pages/api/admin/products/sync-stripe-prices.ts", _page28],
    ["src/pages/api/admin/products/variants.ts", _page29],
    ["src/pages/api/admin/products/[id].ts", _page30],
    ["src/pages/api/admin/products/index.ts", _page31],
    ["src/pages/api/admin/report.ts", _page32],
    ["src/pages/api/admin/returns/send-label.ts", _page33],
    ["src/pages/api/admin/returns/[id]/refund.ts", _page34],
    ["src/pages/api/admin/returns/[id]/status.ts", _page35],
    ["src/pages/api/admin/settings.ts", _page36],
    ["src/pages/api/admin/upload-image.ts", _page37],
    ["src/pages/api/admin/variant-images/[imageId].ts", _page38],
    ["src/pages/api/admin/variant-images/index.ts", _page39],
    ["src/pages/api/admin/variants/[variantId].ts", _page40],
    ["src/pages/api/auth/change-password.ts", _page41],
    ["src/pages/api/auth/login.ts", _page42],
    ["src/pages/api/auth/logout.ts", _page43],
    ["src/pages/api/cart/merge.ts", _page44],
    ["src/pages/api/cart/index.ts", _page45],
    ["src/pages/api/checkout/create-session.ts", _page46],
    ["src/pages/api/checkout.ts", _page47],
    ["src/pages/api/contact.ts", _page48],
    ["src/pages/api/coupons/validate.ts", _page49],
    ["src/pages/api/emails/order-confirmation.ts", _page50],
    ["src/pages/api/invoices/credit-note.ts", _page51],
    ["src/pages/api/invoices/generate.ts", _page52],
    ["src/pages/api/newsletter/subscribe.ts", _page53],
    ["src/pages/api/orders/cancel.ts", _page54],
    ["src/pages/api/orders/request-return.ts", _page55],
    ["src/pages/api/search/products.ts", _page56],
    ["src/pages/api/stock/release.ts", _page57],
    ["src/pages/api/stock/reserve.ts", _page58],
    ["src/pages/api/webhooks/stripe.ts", _page59],
    ["src/pages/carrito.astro", _page60],
    ["src/pages/categoria/novedades.astro", _page61],
    ["src/pages/categoria/ofertas.astro", _page62],
    ["src/pages/categoria/[slug].astro", _page63],
    ["src/pages/checkout/success.astro", _page64],
    ["src/pages/checkout/index.astro", _page65],
    ["src/pages/contacto.astro", _page66],
    ["src/pages/cuenta/cambiar-contraseña.astro", _page67],
    ["src/pages/cuenta/devoluciones/[id].astro", _page68],
    ["src/pages/cuenta/devoluciones.astro", _page69],
    ["src/pages/cuenta/direcciones.astro", _page70],
    ["src/pages/cuenta/favoritos.astro", _page71],
    ["src/pages/cuenta/login.astro", _page72],
    ["src/pages/cuenta/nueva-password.astro", _page73],
    ["src/pages/cuenta/pedidos/[orderNumber].astro", _page74],
    ["src/pages/cuenta/pedidos/index.astro", _page75],
    ["src/pages/cuenta/perfil.astro", _page76],
    ["src/pages/cuenta/registro.astro", _page77],
    ["src/pages/cuenta/index.astro", _page78],
    ["src/pages/envios.astro", _page79],
    ["src/pages/privacidad.astro", _page80],
    ["src/pages/productos/[slug].astro", _page81],
    ["src/pages/productos/index.astro", _page82],
    ["src/pages/sobre-nosotros.astro", _page83],
    ["src/pages/terminos.astro", _page84],
    ["src/pages/index.astro", _page85]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///C:/Users/Felix/Desktop/CRM-Tienda%20Ropa/dist/client/",
    "server": "file:///C:/Users/Felix/Desktop/CRM-Tienda%20Ropa/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
