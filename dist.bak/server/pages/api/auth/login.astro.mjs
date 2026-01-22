import { s as supabase } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email y contraseña son requeridos" }),
        { status: 400 }
      );
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 401 }
      );
    }
    cookies.set("sb-auth-token", data.session?.access_token || "", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7
      // 7 days
    });
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error del servidor" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
