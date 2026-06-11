import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const POST = async ({ cookies, redirect }) => {
  const auth = await requireAuth(cookies);
  if (!auth) return redirect("/login");
  const { profile, client } = auth;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const nowTime = (/* @__PURE__ */ new Date()).toTimeString().slice(0, 8);
  await client.from("time_entries").update({ check_out: nowTime }).eq("employee_id", profile.id).eq("date", today).is("check_out", null);
  return redirect("/employee");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
