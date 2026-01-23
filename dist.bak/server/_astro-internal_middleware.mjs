import { d as defineMiddleware, s as sequence } from './index.Choc__CW.mjs';
import { s as supabase, a as supabaseAdmin } from './supabase.41eewI-c.mjs';
import 'es-module-lexer';
import './astro-designed-error-pages.DTX6o-cG.mjs';
import 'piccolore';
import './astro/server._DgZez_d.mjs';
import 'clsx';

const onRequest$1 = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const staticExtensions = [".css", ".js", ".mjs", ".wasm", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico", ".json", ".xml", ".txt"];
  if (staticExtensions.some((ext) => pathname.endsWith(ext))) {
    return next();
  }
  const request = context.request;
  const originalJson = request.json;
  let cachedBody = null;
  request.json = async function() {
    if (!cachedBody) {
      try {
        cachedBody = await originalJson.call(this);
      } catch {
        cachedBody = {};
      }
    }
    return cachedBody;
  };
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAccountRoute = pathname.startsWith("/cuenta") && !pathname.includes("/login") && !pathname.includes("/registro") && !pathname.includes("/callback") && !pathname.includes("/nueva-password");
  if (isAdminRoute || isAccountRoute) {
    const accessToken = context.cookies.get("sb-access-token")?.value;
    const refreshToken = context.cookies.get("sb-refresh-token")?.value;
    const loginRedirect = isAdminRoute ? "/admin/login" : "/cuenta/login";
    if (!accessToken) {
      return context.redirect(`${loginRedirect}?redirect=${pathname}`);
    }
    try {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (error || !user) {
        if (refreshToken) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
          if (refreshError || !refreshData.session) {
            context.cookies.delete("sb-access-token", { path: "/" });
            context.cookies.delete("sb-refresh-token", { path: "/" });
            return context.redirect(`${loginRedirect}?redirect=${pathname}`);
          }
          context.cookies.set("sb-access-token", refreshData.session.access_token, {
            path: "/",
            httpOnly: false,
            secure: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7
          });
          context.cookies.set("sb-refresh-token", refreshData.session.refresh_token, {
            path: "/",
            httpOnly: false,
            secure: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30
          });
          context.locals.user = refreshData.user;
        } else {
          return context.redirect(`${loginRedirect}?redirect=${pathname}`);
        }
      } else {
        context.locals.user = user;
      }
      if (isAdminRoute) {
        const { data: adminUser } = await supabaseAdmin.from("admin_users").select("id, is_active").eq("auth_user_id", user.id).eq("is_active", true).single();
        if (!adminUser) {
          console.warn(`[Auth] Usuario ${user.email} intentó acceder a ruta admin sin permisos`);
          context.cookies.delete("sb-access-token", { path: "/" });
          context.cookies.delete("sb-refresh-token", { path: "/" });
          return context.redirect("/cuenta/login?error=unauthorized");
        }
        context.locals.isAdmin = true;
        context.locals.adminId = adminUser.id;
      }
    } catch (e) {
      console.error("Auth middleware error:", e);
      return context.redirect(`${loginRedirect}?redirect=${pathname}`);
    }
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
