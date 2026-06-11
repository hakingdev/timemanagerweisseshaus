import { c as createComponent } from './astro-component_D_SWUnKz.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute, q as Fragment } from './entrypoint_BbBt-a-r.mjs';
import { $ as $$MainLayout } from './MainLayout_CmLEontu.mjs';
import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const auth = await requireAuth(Astro2.cookies);
  if (!auth) return Astro2.redirect("/login");
  if (auth.profile.role === "admin") return Astro2.redirect("/admin");
  const { profile, client } = auth;
  const now = /* @__PURE__ */ new Date();
  const year = parseInt(Astro2.url.searchParams.get("year") ?? String(now.getFullYear()));
  const month = parseInt(Astro2.url.searchParams.get("month") ?? String(now.getMonth() + 1));
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const { data: monthEntries } = await client.from("time_entries").select("*").eq("employee_id", profile.id).gte("date", monthStart).lt("date", monthEnd).order("date", { ascending: false });
  const msg = Astro2.url.searchParams.get("msg");
  const error = Astro2.url.searchParams.get("error");
  const MONTH_NAMES = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  function formatTime(t) {
    return t ? t.slice(0, 5) : "—";
  }
  function calcHours(ci, co) {
    if (!ci || !co) return "—";
    const [ih, im] = ci.split(":").map(Number);
    const [oh, om] = co.split(":").map(Number);
    const m = oh * 60 + om - (ih * 60 + im);
    return m > 0 ? `${Math.floor(m / 60)}h ${m % 60}m` : "—";
  }
  let totalMinutes = 0;
  for (const e of monthEntries ?? []) {
    if (e.check_in && e.check_out) {
      const [ih, im] = e.check_in.split(":").map(Number);
      const [oh, om] = e.check_out.split(":").map(Number);
      const m = oh * 60 + om - (ih * 60 + im);
      if (m > 0) totalMinutes += m;
    }
  }
  const todayStr = now.toISOString().split("T")[0];
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Mein Bereich", "user": profile }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page"> <div class="page__header"> <h1>Willkommen, ${profile.full_name.split(" ")[0]}</h1> </div> ${msg && renderTemplate`<div class="alert alert--success" style="margin-bottom:1rem">${msg}</div>`} ${error && renderTemplate`<div class="alert alert--error" style="margin-bottom:1rem">${error}</div>`} <!-- Manual time entry form --> <div class="card card--lg" style="margin-bottom:1.5rem"> <h2 class="card__title">Arbeitszeit eintragen</h2> <form method="POST" action="/api/time/save"> <div class="entry-form-grid"> <div class="form-group entry-form-grid__date"> <label for="date">Datum</label> <input type="date" id="date" name="date" required${addAttribute(todayStr, "value")}${addAttribute(todayStr, "max")}> </div> <div class="form-group entry-form-grid__in"> <label for="check_in">Kommen</label> <input type="time" id="check_in" name="check_in" required> </div> <div class="form-group entry-form-grid__out"> <label for="check_out">Gehen</label> <input type="time" id="check_out" name="check_out"> </div> <div class="form-group entry-form-grid__note"> <label for="note">Bemerkung (optional)</label> <input type="text" id="note" name="note" placeholder="z.B. Homeoffice..."> </div> <div class="entry-form-grid__btn"> <button type="submit" class="btn btn--primary btn--lg btn--full">Speichern</button> </div> </div> </form> </div> <!-- Monthly view — read only for employees --> <div class="card"> <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; flex-wrap:wrap; gap:.75rem"> <h2 class="card__title" style="margin:0">Monatsübersicht</h2> <div class="month-filter"> <form method="GET"> <select name="month" onchange="this.form.submit()"> ${Array.from({ length: 12 }, (_, i) => i + 1).map((m) => renderTemplate`<option${addAttribute(m, "value")}${addAttribute(m === month, "selected")}>${MONTH_NAMES[m - 1]}</option>`)} </select> <select name="year" onchange="this.form.submit()"> ${[now.getFullYear() - 1, now.getFullYear()].map((y) => renderTemplate`<option${addAttribute(y, "value")}${addAttribute(y === year, "selected")}>${y}</option>`)} </select> </form> <span class="badge badge--active">Gesamt: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m</span> </div> </div> ${monthEntries && monthEntries.length > 0 ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="table-wrapper"> <table class="table-mobile-cards"> <thead> <tr><th>Datum</th><th>Kommen</th><th>Gehen</th><th>Stunden</th><th>Bemerkung</th><th>Aktionen</th></tr> </thead> <tbody> ${monthEntries.map((e) => renderTemplate`<tr> <td data-label="">${new Date(e.date).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}</td> <td data-label="Kommen">${formatTime(e.check_in)}</td> <td data-label="Gehen">${formatTime(e.check_out)}</td> <td data-label="Stunden">${calcHours(e.check_in, e.check_out)}</td> <td data-label="Bemerkung" style="color:#6b7280; font-size:.8125rem">${e.note ?? ""}</td> <td> <div style="display:flex;gap:.4rem"> <a${addAttribute(`/employee/edit?entry=${e.id}&year=${year}&month=${month}`, "href")} class="btn btn--outline btn--sm">✏️ Bearbeiten</a> <form method="POST" action="/api/time/delete-entry" style="display:inline"> <input type="hidden" name="id"${addAttribute(e.id, "value")}> <input type="hidden" name="year"${addAttribute(year, "value")}> <input type="hidden" name="month"${addAttribute(month, "value")}> <button type="submit" class="btn btn--outline btn--sm" onclick="return confirm('Eintrag löschen? Der Administrator wird benachrichtigt.')" style="color:#e02424;border-color:#e02424">✕ Löschen</button> </form> </div> </td> </tr>`)} </tbody> <tfoot> <tr style="border-top:2px solid #d1d5db; background:#f9fafb"> <td colspan="3" style="padding:.75rem 1rem; font-weight:700; font-size:.875rem">Gesamt ${MONTH_NAMES[month - 1]} ${year}</td> <td style="padding:.75rem 1rem; font-weight:700; font-size:.875rem">${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m</td> <td colspan="2"></td> </tr> </tfoot> </table> </div> <div class="mobile-total"> <span>Gesamt ${MONTH_NAMES[month - 1]} ${year}</span> <span>${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m</span> </div> ` })}` : renderTemplate`<p style="color:#6b7280; text-align:center; padding:2rem">Keine Einträge für diesen Monat</p>`} </div> </div> </div> ` })}`;
}, "/Users/admin/Documents/time manager/src/pages/employee/index.astro", void 0);

const $$file = "/Users/admin/Documents/time manager/src/pages/employee/index.astro";
const $$url = "/employee";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
