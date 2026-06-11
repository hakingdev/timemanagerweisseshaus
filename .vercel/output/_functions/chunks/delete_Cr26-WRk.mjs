import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const POST = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies);
  if (!auth) return redirect("/login");
  const { profile, client } = auth;
  const form = await request.formData();
  const id = form.get("id")?.toString() ?? "";
  await client.from("time_entries").delete().eq("id", id).eq("employee_id", profile.id);
  return redirect("/employee?msg=" + encodeURIComponent("Eintrag gelöscht"));
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
