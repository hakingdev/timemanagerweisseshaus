import { c as createComponent } from './astro-component_D_SWUnKz.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_BbBt-a-r.mjs';
import { $ as $$MainLayout } from './MainLayout_CmLEontu.mjs';
import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const $$Edit = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Edit;
  const auth = await requireAuth(Astro2.cookies);
  if (!auth) return Astro2.redirect("/login");
  if (auth.profile.role === "admin") return Astro2.redirect("/admin");
  const { profile, client } = auth;
  const entryId = Astro2.url.searchParams.get("entry") ?? "";
  const year = Astro2.url.searchParams.get("year") ?? "";
  const month = Astro2.url.searchParams.get("month") ?? "";
  const { data: entry } = await client.from("time_entries").select("*").eq("id", entryId).eq("employee_id", profile.id).single();
  if (!entry) return Astro2.redirect("/employee");
  function formatTime(t) {
    return t ? t.slice(0, 5) : "";
  }
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Eintrag bearbeiten", "user": profile }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page"> <div class="page__header"> <h1>Eintrag bearbeiten</h1> <a${addAttribute(`/employee?year=${year}&month=${month}`, "href")} class="btn btn--outline">← Zurück</a> </div> <div class="alert alert--info" style="margin-bottom:1.5rem;font-size:.875rem">
Änderungen werden im Administrationsprotokoll erfasst.
</div> <div class="card" style="max-width:500px"> <form method="POST" action="/api/time/edit-entry"> <input type="hidden" name="id"${addAttribute(entry.id, "value")}> <input type="hidden" name="year"${addAttribute(year, "value")}> <input type="hidden" name="month"${addAttribute(month, "value")}> <div class="form-group"> <label>Datum</label> <input type="date" name="date" required${addAttribute(entry.date, "value")}> </div> <div class="form-group"> <label>Kommen (Beginn)</label> <input type="time" name="check_in"${addAttribute(formatTime(entry.check_in), "value")}> </div> <div class="form-group"> <label>Gehen (Ende)</label> <input type="time" name="check_out"${addAttribute(formatTime(entry.check_out), "value")}> </div> <div class="form-group"> <label>Bemerkung</label> <input type="text" name="note"${addAttribute(entry.note ?? "", "value")} placeholder="optional..."> </div> <div style="display:flex;gap:1rem;justify-content:flex-end"> <a${addAttribute(`/employee?year=${year}&month=${month}`, "href")} class="btn btn--outline">Abbrechen</a> <button type="submit" class="btn btn--success">✓ Speichern</button> </div> </form> </div> </div> </div> ` })}`;
}, "/Users/admin/Documents/time manager/src/pages/employee/edit.astro", void 0);

const $$file = "/Users/admin/Documents/time manager/src/pages/employee/edit.astro";
const $$url = "/employee/edit";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Edit,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
