import { c as createComponent } from './astro-component_D_SWUnKz.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead } from './entrypoint_BbBt-a-r.mjs';
import { $ as $$MainLayout } from './MainLayout_CmLEontu.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Login;
  const error = Astro2.url.searchParams.get("error");
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Anmelden" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="auth-page"> <div class="auth-page__card"> <div class="auth-page__logo"> <div style="display:inline-flex;align-items:center;gap:.5rem;margin-bottom:1rem;padding:.5rem 1rem;background:#F1F3F4;border-radius:999px"> <span style="width:10px;height:10px;border-radius:50%;background:#1565D8;display:inline-block"></span> <span style="font-size:.8125rem;font-weight:700;color:#3C4043;letter-spacing:.02em">WEISSES HAUS GMBH</span> </div> <h1 style="font-size:1.625rem">Willkommen zurück</h1> <p>Melden Sie sich mit Ihren Zugangsdaten an</p> </div> ${error && renderTemplate`<div class="alert alert--error">${error}</div>`} <form method="POST" action="/api/auth/login"> <div class="form-group"> <label for="email">E-Mail-Adresse</label> <input type="email" id="email" name="email" required autocomplete="email" placeholder="name@weisseshaus.de"> </div> <div class="form-group"> <label for="password">Passwort</label> <input type="password" id="password" name="password" required autocomplete="current-password" placeholder="••••••••"> </div> <button type="submit" class="btn btn--primary btn--full btn--lg">Anmelden</button> </form> </div> </div> ` })}`;
}, "/Users/admin/Documents/time manager/src/pages/login.astro", void 0);
const $$file = "/Users/admin/Documents/time manager/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
