import { c as createComponent } from './astro-component_D_SWUnKz.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_BbBt-a-r.mjs';
import { $ as $$MainLayout } from './MainLayout_CmLEontu.mjs';
import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const $$Audit = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Audit;
  const auth = await requireAuth(Astro2.cookies, "admin");
  if (!auth) return Astro2.redirect("/login");
  const { client, profile } = auth;
  const { data: logs } = await client.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
  function fmt(t) {
    return t ? t.slice(0, 5) : "—";
  }
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  function fmtEntryDate(d) {
    return new Date(d).toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Änderungsprotokoll", "user": profile }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page"> <div class="page__header"> <h1>Änderungsprotokoll</h1> <a href="/admin" class="btn btn--outline">← Zurück</a> </div> <div class="card"> ${logs && logs.length > 0 ? renderTemplate`<div class="table-wrapper"> <table> <thead> <tr> <th>Zeitstempel</th> <th>Mitarbeiter</th> <th>Aktion</th> <th>Datum des Eintrags</th> <th>Vorher</th> <th>Nachher</th> <th>Wer</th> </tr> </thead> <tbody> ${logs.map((log) => renderTemplate`<tr${addAttribute(log.action === "delete" ? "background:#fff5f5" : "", "style")}> <td style="font-size:.8125rem;white-space:nowrap">${fmtDate(log.created_at)}</td> <td style="font-weight:600">${log.employee_name}</td> <td> ${log.action === "delete" ? renderTemplate`<span style="color:#e02424;font-weight:700">🗑 Gelöscht</span>` : renderTemplate`<span style="color:#1a56db;font-weight:700">✏️ Bearbeitet</span>`} </td> <td style="white-space:nowrap">${fmtEntryDate(log.entry_date)}</td> <td style="font-size:.8125rem;color:#6b7280"> ${fmt(log.old_check_in)}–${fmt(log.old_check_out)} ${log.old_note && renderTemplate`<span style="display:block;font-size:.75rem">${log.old_note}</span>`} </td> <td style="font-size:.8125rem;color:#374151"> ${log.action === "delete" ? renderTemplate`<span style="color:#e02424">—</span>` : renderTemplate`<span>${fmt(log.new_check_in)}–${fmt(log.new_check_out)} ${log.new_note && renderTemplate`<span style="display:block;font-size:.75rem">${log.new_note}</span>`} </span>`} </td> <td> ${log.performed_by === "employee" ? renderTemplate`<span class="badge badge--employee">Mitarbeiter</span>` : renderTemplate`<span class="badge badge--admin">Admin</span>`} </td> </tr>`)} </tbody> </table> </div>` : renderTemplate`<p style="color:#6b7280;text-align:center;padding:3rem">Noch keine Änderungen protokolliert</p>`} </div> </div> </div> ` })}`;
}, "/Users/admin/Documents/time manager/src/pages/admin/audit.astro", void 0);

const $$file = "/Users/admin/Documents/time manager/src/pages/admin/audit.astro";
const $$url = "/admin/audit";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Audit,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
