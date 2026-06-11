import { c as createComponent } from './astro-component_D_SWUnKz.mjs';
import 'piccolore';
import './entrypoint_BbBt-a-r.mjs';
import 'clsx';
import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const auth = await requireAuth(Astro2.cookies);
  if (!auth) return Astro2.redirect("/login");
  if (auth.profile.role === "admin") return Astro2.redirect("/admin");
  return Astro2.redirect("/employee");
}, "/Users/admin/Documents/time manager/src/pages/index.astro", void 0);

const $$file = "/Users/admin/Documents/time manager/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
