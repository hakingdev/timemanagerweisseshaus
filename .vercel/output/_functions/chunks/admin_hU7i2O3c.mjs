import { c as createComponent } from './astro-component_D_SWUnKz.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead } from './entrypoint_BbBt-a-r.mjs';
import { $ as $$MainLayout } from './MainLayout_CmLEontu.mjs';

const $$Admin = createComponent(($$result, $$props, $$slots) => {
  const adminProfile = { full_name: "Thomas Weber", role: "admin", email: "admin@firma.de" };
  const employees = [
    { id: "1", full_name: "Anna Müller", email: "anna@firma.de", present: true },
    { id: "2", full_name: "Klaus Schmidt", email: "klaus@firma.de", present: true },
    { id: "3", full_name: "Maria Braun", email: "maria@firma.de", present: false },
    { id: "4", full_name: "Felix Wagner", email: "felix@firma.de", present: false }
  ];
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Demo – Admin", "user": adminProfile }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page"> <div class="page__header"> <h1>Admin-Bereich</h1> <a href="#" class="btn btn--primary">+ Mitarbeiter anlegen</a> </div> <div class="alert alert--info" style="margin-bottom:1.5rem">
Demo-Modus &nbsp;|&nbsp; <a href="/demo">→ Mitarbeiter-Ansicht</a> &nbsp;|&nbsp; <a href="/login">→ Anmeldeseite</a> </div> <!-- Stats --> <div class="stats-row"> <div class="stat-card"> <div class="stat-card__label">Mitarbeiter gesamt</div> <div class="stat-card__value">4</div> </div> <div class="stat-card"> <div class="stat-card__label">Heute anwesend</div> <div class="stat-card__value">2</div> </div> <div class="stat-card"> <div class="stat-card__label">Heute erfasst</div> <div class="stat-card__value">3</div> </div> </div> <!-- Employees --> <div class="card" style="margin-bottom:1.5rem"> <h2 class="card__title">Mitarbeiterliste</h2> <div class="employee-grid"> ${employees.map((emp) => renderTemplate`<div class="employee-card"> <div> <div class="employee-card__name">${emp.full_name}</div> <div class="employee-card__email">${emp.email}</div> </div> <div> ${emp.present ? renderTemplate`<span><span class="status-dot status-dot--green"></span>Anwesend</span>` : renderTemplate`<span><span class="status-dot status-dot--gray"></span>Abwesend</span>`} </div> <div class="employee-card__actions"> <a href="/demo/employee-detail" class="btn btn--outline btn--sm">Details</a> <a href="/demo/report" class="btn btn--primary btn--sm">📄 Bericht</a> </div> </div>`)} </div> </div> </div> </div> ` })}`;
}, "/Users/admin/Documents/time manager/src/pages/demo/admin.astro", void 0);

const $$file = "/Users/admin/Documents/time manager/src/pages/demo/admin.astro";
const $$url = "/demo/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Admin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
