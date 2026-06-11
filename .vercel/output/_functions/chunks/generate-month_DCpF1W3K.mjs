import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const POST = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies, "admin");
  if (!auth) return redirect("/login");
  const { client } = auth;
  const form = await request.formData();
  const employeeId = form.get("employee_id")?.toString() ?? "";
  const year = parseInt(form.get("year")?.toString() ?? "");
  const month = parseInt(form.get("month")?.toString() ?? "");
  const startTime = form.get("start_time")?.toString() ?? "09:00";
  const endTime = form.get("end_time")?.toString() ?? "17:00";
  const breakMinutes = parseInt(form.get("break_minutes")?.toString() ?? "0");
  const overwrite = form.get("overwrite")?.toString() === "true";
  const back = `/admin/employees/${employeeId}?year=${year}&month=${month}`;
  if (!employeeId || !year || !month) {
    return redirect(back + "&error=" + encodeURIComponent("Ungültige Eingabe"));
  }
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  if (endMins <= startMins) {
    return redirect(back + "&error=" + encodeURIComponent("Arbeitsende muss nach Arbeitsbeginn liegen"));
  }
  const grossMins = endMins - startMins;
  const breakMins = Math.max(0, breakMinutes);
  const daysInMonth = new Date(year, month, 0).getDate();
  const workingDays = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) {
      workingDays.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    }
  }
  if (workingDays.length === 0) {
    return redirect(back + "&error=" + encodeURIComponent("Keine Arbeitstage gefunden"));
  }
  const totalHours = ((grossMins - breakMins) * workingDays.length / 60).toFixed(1);
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextM = month === 12 ? 1 : month + 1;
  const nextY = month === 12 ? year + 1 : year;
  const monthEnd = `${nextY}-${String(nextM).padStart(2, "0")}-01`;
  const { data: existing } = await client.from("time_entries").select("date").eq("employee_id", employeeId).gte("date", monthStart).lt("date", monthEnd);
  const existingDates = new Set((existing ?? []).map((e) => e.date));
  if (overwrite) {
    await client.from("time_entries").delete().eq("employee_id", employeeId).gte("date", monthStart).lt("date", monthEnd);
  }
  const toInsert = [];
  for (const dateStr of workingDays) {
    if (!overwrite && existingDates.has(dateStr)) continue;
    toInsert.push({
      employee_id: employeeId,
      date: dateStr,
      check_in: `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}:00`,
      check_out: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`,
      note: breakMins > 0 ? `Pause ${breakMins} Min.` : null
    });
  }
  if (toInsert.length > 0) {
    const { error } = await client.from("time_entries").insert(toInsert);
    if (error) {
      return redirect(back + "&error=" + encodeURIComponent(error.message));
    }
  }
  return redirect(back + "&msg=" + encodeURIComponent(
    `✓ ${toInsert.length} Tage generiert (${startTime}–${endTime}, ${totalHours}h netto/Monat)`
  ));
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
