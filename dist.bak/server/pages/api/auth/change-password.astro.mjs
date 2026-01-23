import { s as supabase } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

async function POST({ request }) {
  try {
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ message: "Faltan parámetros" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: request.headers.get("x-user-email"),
      password: currentPassword
    });
    if (authError) {
      return new Response(
        JSON.stringify({ message: "La contraseña actual es incorrecta" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (updateError) {
      return new Response(
        JSON.stringify({ message: "Error al actualizar contraseña" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ message: "Contraseña actualizada correctamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en change-password:", error);
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
