import { c as createComponent } from './astro-component_D_SWUnKz.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_BbBt-a-r.mjs';
import { $ as $$MainLayout } from './MainLayout_CmLEontu.mjs';
import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const LOCATIONS = [
  "Weisses Haus Hotel",
  "Fass und Flamme",
  "Ukrainische Hütte",
  "Bun und Fish"
];

const $$New = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$New;
  const auth = await requireAuth(Astro2.cookies, "admin");
  if (!auth) return Astro2.redirect("/login");
  const error = Astro2.url.searchParams.get("error");
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Mitarbeiter anlegen", "user": auth.profile }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page"> <div class="page__header"> <h1>Neuen Mitarbeiter anlegen</h1> <a href="/admin" class="btn btn--outline">← Zurück</a> </div> ${error && renderTemplate`<div class="alert alert--error">${error}</div>`} <div class="card" style="max-width:500px"> <form method="POST" action="/api/admin/create-employee"> <div class="form-group"> <label for="full_name">Vollständiger Name</label> <input type="text" id="full_name" name="full_name" required placeholder="Max Mustermann"> </div> <div class="form-group"> <label for="email">E-Mail-Adresse</label> <input type="email" id="email" name="email" required placeholder="max@firma.de"> </div> <div class="form-group"> <label for="location">Arbeitsstätte</label> <select id="location" name="location" required> ${LOCATIONS.map((loc) => renderTemplate`<option${addAttribute(loc, "value")}>${loc}</option>`)} </select> </div> <div class="form-group"> <label for="password">Passwort</label> <input type="password" id="password" name="password" required minlength="8" placeholder="Mindestens 8 Zeichen"> </div> <div style="display:flex; gap:1rem; justify-content:flex-end"> <a href="/admin" class="btn btn--outline">Abbrechen</a> <button type="submit" class="btn btn--primary">Anlegen</button> </div> </form> </div> </div> </div> ` })}`;
}, "/Users/admin/Documents/time manager/src/pages/admin/employees/new.astro", void 0);

const $$file = "/Users/admin/Documents/time manager/src/pages/admin/employees/new.astro";
const $$url = "/admin/employees/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
