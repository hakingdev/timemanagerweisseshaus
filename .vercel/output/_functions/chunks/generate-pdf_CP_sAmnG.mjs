import { r as requireAuth } from './auth_BkhGAYOe.mjs';
import pkg from 'jspdf';

const jsPDF = pkg.default ?? pkg;
const MONTH_NAMES_DE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WEEKDAYS_DE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minutesToTime(m) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
function generateMonthlyPDF(employee, entries, year, month) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const mL = 12;
  const mR = 12;
  const mT = 10;
  const mB = 10;
  const cW = pageW - mL - mR;
  const daysInMonth = new Date(year, month, 0).getDate();
  const titleH = 8;
  const gapH = 3;
  const tblHdrH = 6;
  const summeH = 6;
  const footerH = 14;
  const infoH = 18;
  const fixedH = mT + titleH + infoH + gapH + tblHdrH + summeH + footerH + mB;
  const rowH = Math.min(8, (pageH - fixedH) / daysInMonth);
  const cols = [
    { header: "Datum", w: 30 },
    { header: "Beginn", w: 20 },
    { header: "Ende", w: 20 },
    { header: "Pause", w: 16 },
    { header: "Auftrag / Objekt", w: 63 },
    { header: "Zeit", w: 37 }
  ];
  let y = mT;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text("Weisses Haus - Stundenzettel", pageW / 2, y + 5, { align: "center" });
  y += titleH;
  doc.setFontSize(8.5);
  const lX = mL, vX = mL + 24, lnEnd = mL + 90, rowSp = 6;
  const infoRows = [
    { label: "Name:", value: employee.full_name },
    { label: "Zeitraum:", value: `${MONTH_NAMES_DE[month - 1]} ${year}` },
    { label: "Arbeitsstätte:", value: employee.location ?? "" }
  ];
  for (const r of infoRows) {
    doc.setFont("helvetica", "bold");
    doc.text(r.label, lX, y + 4);
    doc.setFont("helvetica", "normal");
    doc.line(vX, y + 4.5, lnEnd, y + 4.5);
    doc.text(r.value, vX + 1, y + 4);
    y += rowSp;
  }
  y += gapH;
  doc.setFillColor(210, 210, 210);
  doc.rect(mL, y, cW, tblHdrH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  let x = mL;
  for (const col of cols) {
    doc.rect(x, y, col.w, tblHdrH, "S");
    doc.text(col.header, x + col.w / 2, y + 4.2, { align: "center" });
    x += col.w;
  }
  y += tblHdrH;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const entryMap = new Map(entries.map((e) => [e.date, e]));
  let totalMinutes = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const date = new Date(dateStr);
    const weekday = WEEKDAYS_DE[date.getDay()];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const entry = entryMap.get(dateStr);
    let checkIn = "", checkOut = "", zeitStr = "", pauseStr = "";
    if (entry?.check_in) checkIn = entry.check_in.slice(0, 5);
    if (entry?.check_out) checkOut = entry.check_out.slice(0, 5);
    if (checkIn && checkOut) {
      const gross = timeToMinutes(checkOut) - timeToMinutes(checkIn);
      const pauseMatch = entry?.note?.match(/Pause\s+(\d+)\s*Min/i);
      const pauseMins = pauseMatch ? parseInt(pauseMatch[1]) : 0;
      if (pauseMins > 0) pauseStr = `${pauseMins} Min.`;
      const net = gross - pauseMins;
      if (net > 0) {
        zeitStr = minutesToTime(net);
        totalMinutes += net;
      }
    }
    const datumStr = `${weekday} ${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
    const auftrag = employee.location ?? "";
    const rowData = [datumStr, checkIn, checkOut, pauseStr, auftrag, zeitStr];
    if (isWeekend) {
      doc.setFillColor(235, 235, 235);
      doc.rect(mL, y, cW, rowH, "F");
    }
    x = mL;
    for (let i = 0; i < cols.length; i++) {
      doc.rect(x, y, cols[i].w, rowH, "S");
      if (rowData[i]) doc.text(String(rowData[i]), x + 1.5, y + rowH * 0.65);
      x += cols[i].w;
    }
    y += rowH;
  }
  doc.setFillColor(210, 210, 210);
  doc.rect(mL, y, cW, summeH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const sumColW = cols.slice(0, 5).reduce((a, c) => a + c.w, 0);
  doc.rect(mL, y, sumColW, summeH, "S");
  doc.text("Summe Arbeitszeit", mL + 1.5, y + 4.2);
  doc.rect(mL + sumColW, y, cols[5].w, summeH, "S");
  doc.text(minutesToTime(totalMinutes) + " Std.", mL + sumColW + 1.5, y + 4.2);
  y += summeH;
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Monatsstunden gesamt: `, mL, y);
  doc.setFont("helvetica", "bold");
  doc.text(minutesToTime(totalMinutes) + " Stunden", mL + 48, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.line(mL, y, mL + 60, y);
  doc.line(mL + 80, y, mL + 140, y);
  doc.text("Datum / Unterschrift Mitarbeiter", mL, y + 3.5);
  doc.text("Datum / Unterschrift Arbeitgeber", mL + 80, y + 3.5);
  return doc.output("arraybuffer");
}

const GET = async ({ url, cookies }) => {
  const auth = await requireAuth(cookies, "admin");
  if (!auth) return new Response("Unauthorized", { status: 401 });
  const { client } = auth;
  const employeeId = url.searchParams.get("employee") ?? "";
  const year = parseInt(url.searchParams.get("year") ?? String((/* @__PURE__ */ new Date()).getFullYear()));
  const month = parseInt(url.searchParams.get("month") ?? String((/* @__PURE__ */ new Date()).getMonth() + 1));
  const { data: employee } = await client.from("profiles").select("*").eq("id", employeeId).single();
  if (!employee) return new Response("Mitarbeiter nicht gefunden", { status: 404 });
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const { data: entries } = await client.from("time_entries").select("*").eq("employee_id", employeeId).gte("date", monthStart).lt("date", monthEnd).order("date", { ascending: true });
  const pdfBytes = generateMonthlyPDF(employee, entries ?? [], year, month);
  const MONTH_NAMES_DE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const filename = `Arbeitszeitnachweis_${employee.full_name.replace(/\s+/g, "_")}_${MONTH_NAMES_DE[month - 1]}_${year}.pdf`;
  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
