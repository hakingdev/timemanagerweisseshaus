import { c as createComponent } from './astro-component_D_SWUnKz.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_BbBt-a-r.mjs';
import { $ as $$MainLayout } from './MainLayout_CmLEontu.mjs';
import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const $$Report = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Report;
  const auth = await requireAuth(Astro2.cookies, "admin");
  if (!auth) return Astro2.redirect("/login");
  const { client, profile } = auth;
  const now = /* @__PURE__ */ new Date();
  const employeeId = Astro2.url.searchParams.get("employee") ?? "";
  const year = parseInt(Astro2.url.searchParams.get("year") ?? String(now.getFullYear()));
  const month = parseInt(Astro2.url.searchParams.get("month") ?? String(now.getMonth() + 1));
  const { data: employees } = await client.from("profiles").select("*").eq("role", "employee").order("full_name");
  const selectedEmployee = employees?.find((e) => e.id === employeeId) ?? employees?.[0] ?? null;
  const MONTH_NAMES = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Berichte", "user": profile }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page"> <div class="page__header"> <h1>Monatsberichte (PDF)</h1> <a href="/admin" class="btn btn--outline">← Zurück</a> </div> <div class="card" style="max-width:600px"> <h2 class="card__title">Arbeitszeitnachweis generieren</h2> <form method="GET" action="/api/admin/generate-pdf" target="_blank"> <div class="form-group"> <label for="employee">Mitarbeiter</label> <select id="employee" name="employee" required> ${employees?.map((emp) => renderTemplate`<option${addAttribute(emp.id, "value")}${addAttribute(emp.id === selectedEmployee?.id, "selected")}>${emp.full_name}</option>`)} </select> </div> <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem"> <div class="form-group"> <label for="month">Monat</label> <select id="month" name="month"> ${Array.from({ length: 12 }, (_, i) => i + 1).map((m) => renderTemplate`<option${addAttribute(m, "value")}${addAttribute(m === month, "selected")}>${MONTH_NAMES[m - 1]}</option>`)} </select> </div> <div class="form-group"> <label for="year">Jahr</label> <select id="year" name="year"> ${[now.getFullYear() - 1, now.getFullYear()].map((y) => renderTemplate`<option${addAttribute(y, "value")}${addAttribute(y === year, "selected")}>${y}</option>`)} </select> </div> </div> <button type="submit" class="btn btn--primary btn--full btn--lg">📄 PDF herunterladen</button> </form> </div> <!-- Batch export all employees --> <div class="card" style="max-width:600px; margin-top:1.5rem"> <h2 class="card__title">Alle Mitarbeiter exportieren</h2> <p style="color:#6b7280;font-size:.875rem;margin-bottom:1rem">
Generiert für jeden Mitarbeiter eine separate PDF-Datei.
</p> <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem"> ${employees?.map((emp) => renderTemplate`<a${addAttribute(`/api/admin/generate-pdf?employee=${emp.id}&month=${month}&year=${year}`, "href")} target="_blank" class="btn btn--outline">
📄 ${emp.full_name} </a>`)} </div> </div> </div> </div> ` })}`;
}, "/Users/admin/Documents/time manager/src/pages/admin/report.astro", void 0);

const $$file = "/Users/admin/Documents/time manager/src/pages/admin/report.astro";
const $$url = "/admin/report";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Report,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
