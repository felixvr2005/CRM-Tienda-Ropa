import { v2 } from 'cloudinary';
export { renderers } from '../../../renderers.mjs';

v2.config({
  cloud_name: process.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { folder = "productos", timestamp } = body;
    const signature = v2.utils.api_sign_request({
      folder,
      timestamp,
      upload_preset: "tienda_productos"
    }, process.env.CLOUDINARY_API_SECRET || "");
    return new Response(
      JSON.stringify({ signature }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generando firma:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error al generar firma"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
