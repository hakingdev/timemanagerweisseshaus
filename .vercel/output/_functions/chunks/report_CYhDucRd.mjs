import { c as createComponent } from './astro-component_D_SWUnKz.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_BbBt-a-r.mjs';
import { $ as $$MainLayout } from './MainLayout_CmLEontu.mjs';

const $$Report = createComponent(($$result, $$props, $$slots) => {
  const adminProfile = { full_name: "Thomas Weber", role: "admin", email: "admin@firma.de" };
  const MONTH_NAMES = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const now = /* @__PURE__ */ new Date();
  const employees = [
    { id: "1", full_name: "Anna Müller" },
    { id: "2", full_name: "Klaus Schmidt" },
    { id: "3", full_name: "Maria Braun" },
    { id: "4", full_name: "Felix Wagner" }
  ];
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Demo – Berichte", "user": adminProfile }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page"> <div class="page__header"> <h1>Monatsberichte (PDF)</h1> <a href="/demo/admin" class="btn btn--outline">← Zurück</a> </div> <div class="alert alert--info" style="margin-bottom:1.5rem">
Demo-Modus — PDF-Download ist im echten Betrieb mit Supabase verfügbar
</div> <div class="card" style="max-width:600px; margin-bottom:1.5rem"> <h2 class="card__title">Arbeitszeitnachweis generieren</h2> <div class="form-group"> <label>Mitarbeiter</label> <select> ${employees.map((e) => renderTemplate`<option${addAttribute(e.id, "value")}>${e.full_name}</option>`)} </select> </div> <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem"> <div class="form-group"> <label>Monat</label> <select> ${Array.from({ length: 12 }, (_, i) => i + 1).map((m) => renderTemplate`<option${addAttribute(m === now.getMonth() + 1, "selected")}>${MONTH_NAMES[m - 1]}</option>`)} </select> </div> <div class="form-group"> <label>Jahr</label> <select><option>2025</option><option>2026</option></select> </div> </div> <button class="btn btn--primary btn--full btn--lg" onclick="alert('Im Demo-Modus nicht verfügbar. Bitte Supabase verbinden.')">
📄 PDF herunterladen
</button> </div> <div class="card" style="max-width:600px"> <h2 class="card__title">Alle Mitarbeiter – Juni 2025</h2> <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem"> ${employees.map((emp) => renderTemplate`<button class="btn btn--outline" onclick="alert('Im Demo-Modus nicht verfügbar.')">
📄 ${emp.full_name} </button>`)} </div> </div> </div> </div> ` })}`;
}, "/Users/admin/Documents/time manager/src/pages/demo/report.astro", void 0);

const $$file = "/Users/admin/Documents/time manager/src/pages/demo/report.astro";
const $$url = "/demo/report";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Report,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
