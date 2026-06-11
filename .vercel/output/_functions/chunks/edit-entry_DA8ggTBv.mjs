import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const POST = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies);
  if (!auth) return redirect("/login");
  if (auth.profile.role === "admin") return redirect("/admin");
  const { client, profile } = auth;
  const form = await request.formData();
  const id = form.get("id")?.toString() ?? "";
  const year = form.get("year")?.toString() ?? "";
  const month = form.get("month")?.toString() ?? "";
  const date = form.get("date")?.toString() ?? "";
  const checkIn = form.get("check_in")?.toString() || null;
  const checkOut = form.get("check_out")?.toString() || null;
  const note = form.get("note")?.toString() || null;
  const back = `/employee?year=${year}&month=${month}`;
  const { data: entry } = await client.from("time_entries").select("*").eq("id", id).eq("employee_id", profile.id).single();
  if (!entry) return redirect(back + "&error=" + encodeURIComponent("Eintrag nicht gefunden"));
  const { error } = await client.from("time_entries").update({
    date,
    check_in: checkIn ? checkIn + ":00" : null,
    check_out: checkOut ? checkOut + ":00" : null,
    note
  }).eq("id", id).eq("employee_id", profile.id);
  if (error) return redirect(back + "&error=" + encodeURIComponent(error.message));
  await client.from("audit_logs").insert({
    employee_id: profile.id,
    employee_name: profile.full_name,
    action: "edit",
    entry_date: entry.date,
    old_check_in: entry.check_in,
    old_check_out: entry.check_out,
    old_note: entry.note,
    new_check_in: checkIn ? checkIn + ":00" : null,
    new_check_out: checkOut ? checkOut + ":00" : null,
    new_note: note,
    performed_by: "employee"
  });
  return redirect(back + "&msg=" + encodeURIComponent("Änderungen gespeichert"));
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
