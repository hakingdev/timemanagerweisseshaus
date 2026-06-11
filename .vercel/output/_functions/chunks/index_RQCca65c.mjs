import { c as createComponent } from './astro-component_D_SWUnKz.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_BbBt-a-r.mjs';
import { $ as $$MainLayout } from './MainLayout_CmLEontu.mjs';
import { r as requireAuth, D as DEMO_EMPLOYEES } from './auth_BkhGAYOe.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const auth = await requireAuth(Astro2.cookies, "admin");
  if (!auth) return Astro2.redirect("/login");
  const { profile, client } = auth;
  const isDemo = false;
  const now = /* @__PURE__ */ new Date();
  const todayStr = now.toISOString().split("T")[0];
  let employees = DEMO_EMPLOYEES;
  let checkedInIds = /* @__PURE__ */ new Set(["demo-emp-001", "demo-emp-002"]);
  let todayCount = 3;
  {
    const { data: dbEmployees } = await client.from("profiles").select("*").eq("role", "employee").order("full_name");
    employees = dbEmployees ?? [];
    const { data: todayEntries } = await client.from("time_entries").select("employee_id, check_in, check_out").eq("date", todayStr);
    checkedInIds = new Set((todayEntries ?? []).filter((e) => e.check_in && !e.check_out).map((e) => e.employee_id));
    todayCount = (todayEntries ?? []).length;
  }
  const msg = Astro2.url.searchParams.get("msg");
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Admin – Weisses Haus", "user": profile }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page"> <div class="page__header"> <h1>Admin-Bereich</h1> <div style="display:flex;gap:.75rem"> <a href="/admin/audit" class="btn btn--outline">📋 Änderungsprotokoll</a> <a href="/admin/employees/new" class="btn btn--primary">+ Mitarbeiter anlegen</a> </div> </div> ${msg && renderTemplate`<div class="alert alert--success">${msg}</div>`} ${isDemo} <!-- Stats --> <div class="stats-row"> <div class="stat-card"> <div class="stat-card__label">Mitarbeiter gesamt</div> <div class="stat-card__value">${employees.length}</div> </div> <div class="stat-card"> <div class="stat-card__label">Heute anwesend</div> <div class="stat-card__value">${checkedInIds.size}</div> </div> <div class="stat-card"> <div class="stat-card__label">Heute erfasst</div> <div class="stat-card__value">${todayCount}</div> </div> </div> <!-- Employees --> <div class="card"> <h2 class="card__title">Mitarbeiterliste</h2> ${employees.length > 0 ? renderTemplate`<div class="employee-grid"> ${employees.map((emp) => renderTemplate`<div class="employee-card"> <div> <div class="employee-card__name">${emp.full_name}</div> <div class="employee-card__email">${emp.email}</div> <div style="font-size:.8125rem;color:#1a56db;margin-top:.2rem">📍 ${emp.location ?? "—"}</div> </div> <div> ${checkedInIds.has(emp.id) ? renderTemplate`<span><span class="status-dot status-dot--green"></span>Anwesend</span>` : renderTemplate`<span><span class="status-dot status-dot--gray"></span>Abwesend</span>`} </div> <div class="employee-card__actions"> <a${addAttribute(`/admin/employees/${emp.id}`, "href")} class="btn btn--outline btn--sm">Details</a> <a${addAttribute(`/admin/report?employee=${emp.id}`, "href")} class="btn btn--primary btn--sm">📄 Bericht</a> </div> </div>`)} </div>` : renderTemplate`<p style="color:#6b7280; text-align:center; padding:2rem">Noch keine Mitarbeiter angelegt</p>`} </div> </div> </div> ` })}`;
}, "/Users/admin/Documents/time manager/src/pages/admin/index.astro", void 0);
const $$file = "/Users/admin/Documents/time manager/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
