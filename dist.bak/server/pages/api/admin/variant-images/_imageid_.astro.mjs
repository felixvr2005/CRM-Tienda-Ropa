import { a as supabaseAdmin } from '../../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const DELETE = async ({ params, cookies }) => {
  const accessToken = cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const { imageId } = params;
    if (!imageId) {
      return new Response(JSON.stringify({ error: "ID de imagen requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("Eliminando imagen:", imageId);
    const { data: image, error: getError } = await supabaseAdmin.from("variant_images").select("image_url").eq("id", imageId).single();
    if (getError) {
      console.error("Error al obtener imagen:", getError);
    }
    const { error } = await supabaseAdmin.from("variant_images").delete().eq("id", imageId);
    if (error) {
      console.error("Error al eliminar imagen:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (image?.image_url) {
      const fileName = image.image_url.split("/").pop();
      if (fileName) {
        await supabaseAdmin.storage.from("product-images").remove([fileName]).catch(console.error);
      }
    }
    return new Response(
      JSON.stringify({ success: true, message: "Imagen eliminada" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error en DELETE /api/admin/variant-images:", err);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const PATCH = async ({ params, request, cookies }) => {
  const accessToken = cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const { imageId } = params;
    const body = await request.json();
    const { variant_id, is_primary } = body;
    if (!imageId || !variant_id) {
      return new Response(
        JSON.stringify({ error: "imageId y variant_id son requeridos" }),
        { status: 400 }
      );
    }
    if (is_primary) {
      await supabaseAdmin.from("variant_images").update({ is_primary: false }).eq("variant_id", variant_id);
    }
    const { error } = await supabaseAdmin.from("variant_images").update({ is_primary: is_primary || false }).eq("id", imageId);
    if (error) {
      console.error("Error al actualizar imagen:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500
      });
    }
    return new Response(
      JSON.stringify({ success: true, message: "Imagen actualizada" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error en PATCH /api/admin/variant-images:", err);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PATCH,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
