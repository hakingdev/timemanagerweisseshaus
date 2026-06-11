import { c as createComponent } from './astro-component_D_SWUnKz.mjs';
import 'piccolore';
import { v as renderHead, h as addAttribute, k as renderTemplate, w as renderSlot } from './entrypoint_BbBt-a-r.mjs';
import 'clsx';

const $$MainLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$MainLayout;
  const { title = "Zeiterfassung", user } = Astro2.props;
  return renderTemplate`<html lang="de"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} – Zeiterfassung</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body> ${user && renderTemplate`<nav class="navbar"> <a${addAttribute(user.role === "admin" ? "/admin" : "/employee", "href")} class="navbar__brand"> <span class="navbar__brand-dot"></span> <span class="navbar__brand-text">Weisses Haus GmbH</span> </a> <div class="navbar__nav"> <span class="navbar__user"> ${user.full_name} <span${addAttribute(`badge badge--${user.role}`, "class")} style="margin-left:.4rem">${user.role === "admin" ? "Admin" : "Mitarbeiter"}</span> </span> <a href="/api/auth/logout" class="btn btn--outline btn--sm">Abmelden</a> </div> </nav>`} <main> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "/Users/admin/Documents/time manager/src/layouts/MainLayout.astro", void 0);

export { $$MainLayout as $ };
