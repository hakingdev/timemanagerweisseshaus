import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const POST = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies, "admin");
  if (!auth) return redirect("/login");
  const { client } = auth;
  const form = await request.formData();
  const id = form.get("id")?.toString() ?? "";
  const employeeId = form.get("employee_id")?.toString() ?? "";
  const year = form.get("year")?.toString() ?? "";
  const month = form.get("month")?.toString() ?? "";
  const back = `/admin/employees/${employeeId}?year=${year}&month=${month}`;
  const [{ data: entry }, { data: emp }] = await Promise.all([
    client.from("time_entries").select("*").eq("id", id).single(),
    client.from("profiles").select("full_name").eq("id", employeeId).single()
  ]);
  if (!entry) return redirect(back + "&error=" + encodeURIComponent("Eintrag nicht gefunden"));
  await client.from("time_entries").delete().eq("id", id);
  await client.from("audit_logs").insert({
    employee_id: employeeId,
    employee_name: emp?.full_name ?? "",
    action: "delete",
    entry_date: entry.date,
    old_check_in: entry.check_in,
    old_check_out: entry.check_out,
    old_note: entry.note,
    new_check_in: null,
    new_check_out: null,
    new_note: null,
    performed_by: "admin"
  });
  return redirect(back + "&msg=" + encodeURIComponent("Eintrag gelöscht"));
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
