import { s as supabase } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ cookies, url }) => {
  const userType = url.searchParams.get("type") || "customer";
  try {
    await supabase.auth.signOut();
    cookies.delete("sb-auth-token", { path: "/" });
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });
    const redirectUrl = userType === "admin" ? "/admin/login" : "/cuenta/login";
    return new Response(null, {
      status: 302,
      headers: {
        "Location": redirectUrl
      }
    });
  } catch (error) {
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "/cuenta/login"
      }
    });
  }
};
const POST = async ({ cookies, request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const userType = body.type || "customer";
    await supabase.auth.signOut();
    cookies.delete("sb-auth-token", { path: "/" });
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });
    const redirectUrl = userType === "admin" ? "/admin/login" : "/cuenta/login";
    return new Response(
      JSON.stringify({ success: true, redirectUrl }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error del servidor", redirectUrl: "/cuenta/login" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
