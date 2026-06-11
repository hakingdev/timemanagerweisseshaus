import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const POST = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies, "admin");
  if (!auth) return redirect("/login");
  const { client } = auth;
  const form = await request.formData();
  const employeeId = form.get("employee_id")?.toString() ?? "";
  const year = form.get("year")?.toString() ?? "";
  const month = form.get("month")?.toString() ?? "";
  const idsRaw = form.get("ids")?.toString() ?? "";
  const checkIn = form.get("check_in")?.toString() || null;
  const checkOut = form.get("check_out")?.toString() || null;
  const note = form.get("note")?.toString() || null;
  const back = `/admin/employees/${employeeId}?year=${year}&month=${month}`;
  const ids = idsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) {
    return redirect(back + "&error=" + encodeURIComponent("Keine Einträge ausgewählt"));
  }
  const updates = {};
  if (checkIn) updates.check_in = checkIn + ":00";
  if (checkOut) updates.check_out = checkOut + ":00";
  if (note !== null && note !== "") updates.note = note;
  if (Object.keys(updates).length === 0) {
    return redirect(back + "&error=" + encodeURIComponent("Keine Änderungen angegeben"));
  }
  const { error } = await client.from("time_entries").update(updates).in("id", ids).eq("employee_id", employeeId);
  if (error) {
    return redirect(back + "&error=" + encodeURIComponent(error.message));
  }
  return redirect(back + "&msg=" + encodeURIComponent(`✓ ${ids.length} Einträge aktualisiert`));
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
