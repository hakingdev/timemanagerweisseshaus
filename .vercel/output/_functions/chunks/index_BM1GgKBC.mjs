import { c as createComponent } from './astro-component_D_SWUnKz.mjs';
import 'piccolore';
import { p as createRenderInstruction, o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_BbBt-a-r.mjs';
import { $ as $$MainLayout } from './MainLayout_CmLEontu.mjs';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const demoProfile = { full_name: "Anna Müller", role: "employee", email: "anna@firma.de" };
  const MONTH_NAMES = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const now = /* @__PURE__ */ new Date();
  now.getMonth();
  const demoEntries = [
    { date: "2025-06-09", check_in: "08:02", check_out: "17:15" },
    { date: "2025-06-10", check_in: "08:30", check_out: "17:00" },
    { date: "2025-06-11", check_in: "07:55", check_out: null }
  ];
  function calcHours(ci, co) {
    if (!ci || !co) return "—";
    const [ih, im] = ci.split(":").map(Number);
    const [oh, om] = co.split(":").map(Number);
    const m = oh * 60 + om - (ih * 60 + im);
    return m > 0 ? `${Math.floor(m / 60)}h ${m % 60}m` : "—";
  }
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Demo – Mitarbeiter", "user": demoProfile }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page"> <div class="page__header"> <h1>Willkommen, Anna</h1> <span class="badge badge--active">Demo-Modus</span> </div> <div class="alert alert--info" style="margin-bottom:1.5rem">
Dies ist eine Vorschau. <a href="/demo/admin">→ Admin-Ansicht</a> &nbsp;|&nbsp; <a href="/login">→ Anmeldeseite</a> </div> <!-- Time Clock --> <div class="card card--lg" style="margin-bottom:1.5rem"> <div class="time-clock"> <div class="time-clock__time" id="clock">--:--:--</div> <div class="time-clock__date" id="today-date"></div> <div class="time-clock__actions"> <button class="btn btn--success btn--lg" onclick="handleCheckin()">✓ Kommen (Einstempeln)</button> <button class="btn btn--danger btn--lg" onclick="handleCheckout()" id="checkout-btn" style="display:none">✗ Gehen (Ausstempeln)</button> </div> <div class="time-clock__status" id="status-box" style="display:none"> <p id="status-text"></p> </div> </div> </div> <!-- Monthly view --> <div class="card"> <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; flex-wrap:wrap; gap:.75rem"> <h2 class="card__title" style="margin:0">Monatsübersicht</h2> <div class="month-filter"> <select> ${Array.from({ length: 12 }, (_, i) => i + 1).map((m) => renderTemplate`<option${addAttribute(m === now.getMonth() + 1, "selected")}>${MONTH_NAMES[m - 1]}</option>`)} </select> <select> <option>2025</option> <option>2026</option> </select> <span class="badge badge--active">Gesamt: 17h 43m</span> </div> </div> <div class="table-wrapper"> <table> <thead> <tr><th>Datum</th><th>Kommen</th><th>Gehen</th><th>Stunden</th></tr> </thead> <tbody> ${demoEntries.map((e) => renderTemplate`<tr> <td>${new Date(e.date).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}</td> <td>${e.check_in ?? "—"}</td> <td>${e.check_out ?? renderTemplate`<span style="color:#6b7280">—</span>`}</td> <td>${calcHours(e.check_in, e.check_out)}</td> </tr>`)} </tbody> </table> </div> </div> </div> </div> ` })} ${renderScript($$result, "/Users/admin/Documents/time manager/src/pages/demo/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/admin/Documents/time manager/src/pages/demo/index.astro", void 0);

const $$file = "/Users/admin/Documents/time manager/src/pages/demo/index.astro";
const $$url = "/demo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
