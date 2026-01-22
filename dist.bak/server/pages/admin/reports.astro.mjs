/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../AdminLayout.7POnspUO.mjs';
import { s as supabase, a as supabaseAdmin } from '../../supabase.41eewI-c.mjs';
/* empty css                               */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Reports = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Reports;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return Astro2.redirect("/admin/login");
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    return Astro2.redirect("/admin/login");
  }
  const { data: adminUser } = await supabaseAdmin.from("admin_users").select("id, is_active, email").eq("auth_user_id", user.id).eq("is_active", true).single();
  if (!adminUser) {
    console.warn(`[Security] Usuario ${user.email} intent\xF3 acceder a reportes sin permisos`);
    Astro2.cookies.delete("sb-access-token", { path: "/" });
    Astro2.cookies.delete("sb-refresh-token", { path: "/" });
    return Astro2.redirect("/cuenta/login?error=unauthorized");
  }
  const defaultAdminEmail = adminUser.email;
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Panel de Reportes - Administrador", "data-astro-cid-sam2tfmh": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="admin-reports-container" data-astro-cid-sam2tfmh> <!-- Header --> <div class="reports-header" data-astro-cid-sam2tfmh> <h1 data-astro-cid-sam2tfmh>📊 Panel de Reportes y Análisis</h1> <p data-astro-cid-sam2tfmh>Genera y descarga reportes de ventas, pedidos y envíos en diferentes períodos</p> </div> <!-- Sección de Generación de Reportes --> <section class="reports-section" data-astro-cid-sam2tfmh> <div class="section-title" data-astro-cid-sam2tfmh>📋 Generar y Enviar Reporte</div> <div class="report-form" data-astro-cid-sam2tfmh> <div class="form-group" data-astro-cid-sam2tfmh> <label for="report-period" data-astro-cid-sam2tfmh>Período del Reporte:</label> <select id="report-period" data-astro-cid-sam2tfmh> <option value="day" data-astro-cid-sam2tfmh>Reporte Diario</option> <option value="week" data-astro-cid-sam2tfmh>Reporte Semanal</option> <option value="month" selected data-astro-cid-sam2tfmh>Reporte Mensual</option> <option value="year" data-astro-cid-sam2tfmh>Reporte Anual</option> <option value="custom" data-astro-cid-sam2tfmh>Período Personalizado</option> </select> </div> <div class="form-group" id="custom-dates" style="display: none;" data-astro-cid-sam2tfmh> <label for="start-date" data-astro-cid-sam2tfmh>Fecha de Inicio:</label> <input type="date" id="start-date" data-astro-cid-sam2tfmh> <label for="end-date" data-astro-cid-sam2tfmh>Fecha de Fin:</label> <input type="date" id="end-date" data-astro-cid-sam2tfmh> </div> <div class="form-group" data-astro-cid-sam2tfmh> <label for="admin-email" data-astro-cid-sam2tfmh>Correo del Administrador:</label> <input type="email" id="admin-email" placeholder="admin@example.com"${addAttribute(defaultAdminEmail, "value")} data-astro-cid-sam2tfmh> </div> <div class="button-group" data-astro-cid-sam2tfmh> <button class="btn btn-primary" id="send-report" data-astro-cid-sam2tfmh>
Enviar Reporte
</button> <button class="btn btn-secondary" id="preview-report" data-astro-cid-sam2tfmh>
👁️ Vista Previa
</button> </div> </div> </section> <!-- Sección de Descarga de Datos --> <section class="reports-section" data-astro-cid-sam2tfmh> <div class="section-title" data-astro-cid-sam2tfmh>💾 Descargar Datos</div> <div class="export-form" data-astro-cid-sam2tfmh> <div class="form-group" data-astro-cid-sam2tfmh> <label for="export-period" data-astro-cid-sam2tfmh>Período para Descargar:</label> <select id="export-period" data-astro-cid-sam2tfmh> <option value="day" data-astro-cid-sam2tfmh>Hoy</option> <option value="week" data-astro-cid-sam2tfmh>Esta Semana</option> <option value="month" selected data-astro-cid-sam2tfmh>Este Mes</option> <option value="year" data-astro-cid-sam2tfmh>Este Año</option> <option value="custom" data-astro-cid-sam2tfmh>Personalizado</option> </select> </div> <div class="form-group" id="export-custom-dates" style="display: none;" data-astro-cid-sam2tfmh> <label for="export-start-date" data-astro-cid-sam2tfmh>Fecha de Inicio:</label> <input type="date" id="export-start-date" data-astro-cid-sam2tfmh> <label for="export-end-date" data-astro-cid-sam2tfmh>Fecha de Fin:</label> <input type="date" id="export-end-date" data-astro-cid-sam2tfmh> </div> <div class="format-options" data-astro-cid-sam2tfmh> <label data-astro-cid-sam2tfmh>Formato de Descarga:</label> <div class="radio-group" data-astro-cid-sam2tfmh> <label data-astro-cid-sam2tfmh> <input type="radio" name="export-format" value="csv" checked data-astro-cid-sam2tfmh> <span data-astro-cid-sam2tfmh>CSV (Excel)</span> </label> <label data-astro-cid-sam2tfmh> <input type="radio" name="export-format" value="json" data-astro-cid-sam2tfmh> <span data-astro-cid-sam2tfmh>JSON</span> </label> </div> </div> <button class="btn btn-success" id="download-data" data-astro-cid-sam2tfmh>
⬇️ Descargar Datos
</button> </div> </section> <!-- Sección de Vista Previa --> <section class="reports-section" id="preview-section" style="display: none;" data-astro-cid-sam2tfmh> <div class="section-title" data-astro-cid-sam2tfmh>👁️ Vista Previa del Reporte</div> <div id="preview-content" class="preview-content" data-astro-cid-sam2tfmh></div> </section> <!-- Sección de Historial --> <section class="reports-section" data-astro-cid-sam2tfmh> <div class="section-title" data-astro-cid-sam2tfmh>📜 Reportes Recientes</div> <div class="recent-reports" data-astro-cid-sam2tfmh> <p class="text-center" data-astro-cid-sam2tfmh>Aquí aparecerán los reportes que hayas generado recientemente</p> </div> </section> </div> ` })}  ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/reports.astro?astro&type=script&index=0&lang.ts")} `;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/reports.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/reports.astro";
const $$url = "/admin/reports";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Reports,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
