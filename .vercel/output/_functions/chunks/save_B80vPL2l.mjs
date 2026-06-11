import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const POST = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies);
  if (!auth) return redirect("/login");
  const { profile, client } = auth;
  const form = await request.formData();
  const date = form.get("date")?.toString() ?? "";
  const check_in = form.get("check_in")?.toString() || null;
  const check_out = form.get("check_out")?.toString() || null;
  const note = form.get("note")?.toString().trim() || null;
  if (!date || !check_in) {
    return redirect("/employee?error=" + encodeURIComponent("Datum und Kommen-Zeit sind pflicht"));
  }
  if (check_in && check_out) {
    const [ih, im] = check_in.split(":").map(Number);
    const [oh, om] = check_out.split(":").map(Number);
    if (oh * 60 + om <= ih * 60 + im) {
      return redirect("/employee?error=" + encodeURIComponent("Gehen-Zeit muss nach Kommen-Zeit liegen"));
    }
  }
  const checkInTime = check_in + ":00";
  const checkOutTime = check_out ? check_out + ":00" : null;
  const { data: existing } = await client.from("time_entries").select("id").eq("employee_id", profile.id).eq("date", date).single();
  let error;
  if (existing) {
    const result = await client.from("time_entries").update({ check_in: checkInTime, check_out: checkOutTime, note }).eq("id", existing.id);
    error = result.error;
  } else {
    const result = await client.from("time_entries").insert({
      employee_id: profile.id,
      date,
      check_in: checkInTime,
      check_out: checkOutTime,
      note
    });
    error = result.error;
  }
  if (error) {
    console.error("Save error:", error.message);
    return redirect("/employee?error=" + encodeURIComponent(error.message));
  }
  const [savedYear, savedMonth] = date.split("-");
  return redirect(`/employee?msg=${encodeURIComponent("Eintrag gespeichert ✓")}&year=${savedYear}&month=${parseInt(savedMonth)}`);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
