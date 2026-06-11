import pkg from 'jspdf';
const jsPDF = (pkg as any).default ?? pkg;
import type { TimeEntry, Profile } from './database.types';

const MONTH_NAMES_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const WEEKDAYS_DE = ['So','Mo','Di','Mi','Do','Fr','Sa'];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minutesToTime(m: number): string {
  return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
}

export function generateMonthlyPDF(
  employee: Profile,
  entries: TimeEntry[],
  year: number,
  month: number
): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW  = 210;
  const pageH  = 297;
  const mL     = 12;   // left margin
  const mR     = 12;   // right margin
  const mT     = 10;   // top margin
  const mB     = 10;   // bottom margin
  const cW     = pageW - mL - mR;  // 186mm content width

  const daysInMonth = new Date(year, month, 0).getDate();

  // Fixed heights
  const titleH    = 8;
  const gapH      = 3;
  const tblHdrH   = 6;
  const summeH    = 6;
  const footerH   = 14;   // monatsstunden + signature

  const infoH  = 18;   // 3 × 6mm
  const fixedH = mT + titleH + infoH + gapH + tblHdrH + summeH + footerH + mB;
  const rowH   = Math.min(8.0, (pageH - fixedH) / daysInMonth);

  // Columns: Datum, Beginn, Ende, Pause, Auftrag/Objekt, Zeit
  const cols = [
    { header: 'Datum',            w: 30 },
    { header: 'Beginn',           w: 20 },
    { header: 'Ende',             w: 20 },
    { header: 'Pause',            w: 16 },
    { header: 'Auftrag / Objekt', w: 63 },
    { header: 'Zeit',             w: 37 },
  ];

  let y = mT;

  // ── TITLE ───────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0,0,0);
  doc.text('Weisses Haus - Stundenzettel', pageW / 2, y + 5, { align: 'center' });
  y += titleH;

  // ── INFO BLOCK ──────────────────────────────────────────
  doc.setFontSize(8.5);
  const lX = mL, vX = mL + 24, lnEnd = mL + 90, rowSp = 6;

  const infoRows = [
    { label: 'Name:',          value: employee.full_name },
    { label: 'Zeitraum:',      value: `${MONTH_NAMES_DE[month-1]} ${year}` },
    { label: 'Arbeitsstätte:', value: employee.location ?? '' },
  ];
  for (const r of infoRows) {
    doc.setFont('helvetica','bold');
    doc.text(r.label, lX, y + 4);
    doc.setFont('helvetica','normal');
    doc.line(vX, y + 4.5, lnEnd, y + 4.5);
    doc.text(r.value, vX + 1, y + 4);
    y += rowSp;
  }
  y += gapH;

  // ── TABLE HEADER ────────────────────────────────────────
  doc.setFillColor(210, 210, 210);
  doc.rect(mL, y, cW, tblHdrH, 'F');
  doc.setFont('helvetica','bold');
  doc.setFontSize(9);
  doc.setTextColor(0,0,0);

  let x = mL;
  for (const col of cols) {
    doc.rect(x, y, col.w, tblHdrH, 'S');
    doc.text(col.header, x + col.w/2, y + 4.2, { align: 'center' });
    x += col.w;
  }
  y += tblHdrH;

  // ── DATA ROWS ───────────────────────────────────────────
  doc.setFont('helvetica','normal');
  doc.setFontSize(9);

  const entryMap = new Map(entries.map(e => [e.date, e]));
  let totalMinutes = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const date    = new Date(dateStr);
    const weekday = WEEKDAYS_DE[date.getDay()];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const entry   = entryMap.get(dateStr);

    let checkIn = '', checkOut = '', zeitStr = '', pauseStr = '';
    if (entry?.check_in)  checkIn  = entry.check_in.slice(0,5);
    if (entry?.check_out) checkOut = entry.check_out.slice(0,5);
    if (checkIn && checkOut) {
      const gross = timeToMinutes(checkOut) - timeToMinutes(checkIn);
      // extract pause minutes from note if stored as "Pause X Min."
      const pauseMatch = entry?.note?.match(/Pause\s+(\d+)\s*Min/i);
      const pauseMins = pauseMatch ? parseInt(pauseMatch[1]) : 0;
      if (pauseMins > 0) pauseStr = `${pauseMins} Min.`;
      const net = gross - pauseMins;
      if (net > 0) { zeitStr = minutesToTime(net); totalMinutes += net; }
    }

    const datumStr = `${weekday} ${String(day).padStart(2,'0')}.${String(month).padStart(2,'0')}.${year}`;
    const auftrag  = employee.location ?? '';
    const rowData  = [datumStr, checkIn, checkOut, pauseStr, auftrag, zeitStr];

    if (isWeekend) {
      doc.setFillColor(235, 235, 235);
      doc.rect(mL, y, cW, rowH, 'F');
    }

    x = mL;
    for (let i = 0; i < cols.length; i++) {
      doc.rect(x, y, cols[i].w, rowH, 'S');
      if (rowData[i]) doc.text(String(rowData[i]), x + 1.5, y + rowH * 0.65);
      x += cols[i].w;
    }
    y += rowH;
  }

  // ── SUMME ROW ───────────────────────────────────────────
  doc.setFillColor(210, 210, 210);
  doc.rect(mL, y, cW, summeH, 'F');
  doc.setFont('helvetica','bold');
  doc.setFontSize(9);
  doc.setTextColor(0,0,0);

  const sumColW = cols.slice(0,5).reduce((a,c)=>a+c.w,0);
  doc.rect(mL, y, sumColW, summeH, 'S');
  doc.text('Summe Arbeitszeit', mL + 1.5, y + 4.2);
  doc.rect(mL + sumColW, y, cols[5].w, summeH, 'S');
  doc.text(minutesToTime(totalMinutes) + ' Std.', mL + sumColW + 1.5, y + 4.2);
  y += summeH;

  // ── FOOTER ──────────────────────────────────────────────
  y += 4;
  doc.setFont('helvetica','normal');
  doc.setFontSize(8.5);
  doc.text(`Monatsstunden gesamt: `, mL, y);
  doc.setFont('helvetica','bold');
  doc.text(minutesToTime(totalMinutes) + ' Stunden', mL + 48, y);

  y += 8;
  doc.setFont('helvetica','normal');
  doc.setFontSize(8);
  doc.line(mL, y, mL + 60, y);
  doc.line(mL + 80, y, mL + 140, y);
  doc.text('Datum / Unterschrift Mitarbeiter', mL, y + 3.5);
  doc.text('Datum / Unterschrift Arbeitgeber', mL + 80, y + 3.5);

  return doc.output('arraybuffer') as unknown as Uint8Array;
}
