import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';

const MONTH_NAMES_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const WEEKDAYS_DE = ['So','Mo','Di','Mi','Do','Fr','Sa'];

// Gantt time range: 05:00 – 23:00, 30-min slots = 36 slots
const GANTT_START = 5;   // 05:00
const GANTT_END   = 23;  // 23:00
const SLOT_MINS   = 30;
const SLOTS       = (GANTT_END - GANTT_START) * (60 / SLOT_MINS); // 36

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minutesToHHMM(mins: number): string {
  if (mins <= 0) return '—';
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
function colLetter(n: number): string {
  let s = '';
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

// Distinct colors per employee (blue, green, orange, purple, teal, red, indigo)
const EMP_COLORS = ['FF1565D8','FF2E7D32','FFE65100','FF6A1B9A','FF00695C','FFC62828','FF283593'];
const EMP_COLORS_LIGHT = ['FFE8F0FE','FFE8F5E9','FFFFF3E0','FFF3E5F5','FFE0F2F1','FFFFEBEE','FFE8EAF6'];

export const GET: APIRoute = async ({ url, cookies }) => {
  const auth = await requireAuth(cookies, 'admin');
  if (!auth) return new Response('Unauthorized', { status: 401 });

  const adminClient = createClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const year  = parseInt(url.searchParams.get('year')  ?? String(new Date().getFullYear()));
  const month = parseInt(url.searchParams.get('month') ?? String(new Date().getMonth() + 1));
  const employeeIds = url.searchParams.getAll('employees');

  if (employeeIds.length === 0)
    return new Response('Keine Mitarbeiter ausgewählt', { status: 400 });

  const monthStart  = `${year}-${String(month).padStart(2,'0')}-01`;
  const nextMonth   = month === 12 ? 1 : month + 1;
  const nextYear    = month === 12 ? year + 1 : year;
  const monthEnd    = `${nextYear}-${String(nextMonth).padStart(2,'0')}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();

  const { data: employees } = await adminClient
    .from('profiles').select('*').in('id', employeeIds).order('full_name');
  const empList = employees ?? [];

  const { data: entries } = await adminClient
    .from('time_entries').select('*')
    .in('employee_id', employeeIds)
    .gte('date', monthStart).lt('date', monthEnd);

  // Build lookup: employeeId -> date -> entry
  const entryMap = new Map<string, Map<string, { check_in: string|null; check_out: string|null; note: string|null }>>();
  for (const e of entries ?? []) {
    if (!entryMap.has(e.employee_id)) entryMap.set(e.employee_id, new Map());
    entryMap.get(e.employee_id)!.set(e.date, { check_in: e.check_in, check_out: e.check_out, note: e.note });
  }

  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Weisses Haus GmbH';

  // ── SHEET 1: DATA TABLE ─────────────────────────────────
  const dataSheet = workbook.addWorksheet('Arbeitszeiten');

  // Title
  const titleMergeEnd = 2 + empList.length * 3;
  dataSheet.mergeCells(1, 1, 1, titleMergeEnd);
  const titleCell = dataSheet.getCell(1, 1);
  titleCell.value = `Arbeitszeiten ${MONTH_NAMES_DE[month-1]} ${year} – Weisses Haus GmbH`;
  titleCell.font = { bold: true, size: 13, color: { argb: 'FF1565D8' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  dataSheet.getRow(1).height = 26;

  // Header: Datum | Tag | [Kommen Gehen Stunden] per emp
  const hRow = dataSheet.getRow(2);
  hRow.getCell(1).value = 'Datum';
  hRow.getCell(2).value = 'Tag';
  let col = 3;
  for (let i = 0; i < empList.length; i++) {
    dataSheet.mergeCells(2, col, 2, col + 2);
    const c = hRow.getCell(col);
    c.value = empList[i].full_name;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EMP_COLORS[i % EMP_COLORS.length] } };
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    col += 3;
  }
  hRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
  hRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
  hRow.getCell(1).alignment = { horizontal: 'center' };
  hRow.getCell(2).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
  hRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
  hRow.getCell(2).alignment = { horizontal: 'center' };
  dataSheet.getRow(2).height = 22;

  // Subheader: Kommen / Gehen / Stunden
  const sRow = dataSheet.getRow(3);
  sRow.getCell(1).value = '';
  sRow.getCell(2).value = '';
  col = 3;
  for (let i = 0; i < empList.length; i++) {
    ['Kommen','Gehen','Stunden'].forEach((lbl, j) => {
      const c = sRow.getCell(col + j);
      c.value = lbl;
      c.font = { bold: true, size: 9 };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EMP_COLORS_LIGHT[i % EMP_COLORS_LIGHT.length] } };
      c.alignment = { horizontal: 'center' };
    });
    col += 3;
  }
  dataSheet.getRow(3).height = 16;

  // Column widths
  dataSheet.getColumn(1).width = 13;
  dataSheet.getColumn(2).width = 5;
  col = 3;
  for (const _ of empList) {
    dataSheet.getColumn(col).width = 9;
    dataSheet.getColumn(col + 1).width = 9;
    dataSheet.getColumn(col + 2).width = 10;
    col += 3;
  }

  const totalMins = new Array(empList.length).fill(0);

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const weekday = WEEKDAYS_DE[new Date(dateStr).getDay()];
    const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;
    const rowNum = 3 + day;
    const row = dataSheet.getRow(rowNum);

    const dCell = row.getCell(1);
    dCell.value = `${String(day).padStart(2,'0')}.${String(month).padStart(2,'0')}.${year}`;
    dCell.font = { size: 9, bold: isWeekend };
    dCell.alignment = { horizontal: 'center' };

    const wCell = row.getCell(2);
    wCell.value = weekday;
    wCell.font = { size: 9, color: isWeekend ? { argb: 'FF9CA3AF' } : undefined };
    wCell.alignment = { horizontal: 'center' };

    if (isWeekend) {
      for (let c = 1; c <= titleMergeEnd; c++) {
        row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      }
    }

    col = 3;
    for (let i = 0; i < empList.length; i++) {
      const entry = entryMap.get(empList[i].id)?.get(dateStr);
      let kommen = '', gehen = '', stunden = '';

      if (entry?.check_in && entry?.check_out) {
        kommen = entry.check_in.slice(0, 5);
        gehen  = entry.check_out.slice(0, 5);
        const pauseMatch = entry.note?.match(/Pause\s+(\d+)\s*Min/i);
        const pauseMins = pauseMatch ? parseInt(pauseMatch[1]) : 0;
        const gross = timeToMinutes(gehen) - timeToMinutes(kommen);
        const net = Math.max(0, gross - pauseMins);
        totalMins[i] += net;
        stunden = minutesToHHMM(net);
      } else if (entry?.check_in) {
        kommen = entry.check_in.slice(0, 5);
      }

      row.getCell(col).value = kommen;
      row.getCell(col).font = { size: 9 };
      row.getCell(col).alignment = { horizontal: 'center' };

      row.getCell(col + 1).value = gehen;
      row.getCell(col + 1).font = { size: 9 };
      row.getCell(col + 1).alignment = { horizontal: 'center' };

      const sCell = row.getCell(col + 2);
      sCell.value = stunden;
      sCell.font = { size: 9, bold: !!stunden };
      sCell.alignment = { horizontal: 'center' };
      if (stunden) {
        sCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EMP_COLORS_LIGHT[i % EMP_COLORS_LIGHT.length] } };
      }
      col += 3;
    }
    row.height = 15;
  }

  // Totals row
  const totRow = dataSheet.getRow(4 + daysInMonth);
  dataSheet.mergeCells(4 + daysInMonth, 1, 4 + daysInMonth, 2);
  totRow.getCell(1).value = 'GESAMT';
  totRow.getCell(1).font = { bold: true, size: 10 };
  totRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
  col = 3;
  for (let i = 0; i < empList.length; i++) {
    dataSheet.mergeCells(4 + daysInMonth, col, 4 + daysInMonth, col + 1);
    const tc = totRow.getCell(col);
    tc.value = minutesToHHMM(totalMins[i]);
    tc.font = { bold: true, size: 10, color: { argb: EMP_COLORS[i % EMP_COLORS.length] } };
    tc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EMP_COLORS_LIGHT[i % EMP_COLORS_LIGHT.length] } };
    tc.alignment = { horizontal: 'center' };
    col += 3;
  }
  totRow.height = 22;

  // ── SHEET 2: GANTT (colored cells) ───────────────────────
  const ganttSheet = workbook.addWorksheet('Gantt-Diagramm');

  // Title
  const ganttCols = 2 + SLOTS;
  ganttSheet.mergeCells(1, 1, 1, ganttCols);
  const gTitle = ganttSheet.getCell(1, 1);
  gTitle.value = `Gantt-Diagramm ${MONTH_NAMES_DE[month-1]} ${year} – Weisses Haus GmbH`;
  gTitle.font = { bold: true, size: 13, color: { argb: 'FF1565D8' } };
  gTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  ganttSheet.getRow(1).height = 26;

  // Legend row
  const legRow = ganttSheet.getRow(2);
  legRow.getCell(1).value = 'Legende:';
  legRow.getCell(1).font = { bold: true, size: 9 };
  for (let i = 0; i < empList.length; i++) {
    const lc = legRow.getCell(3 + i * 2);
    ganttSheet.mergeCells(2, 3 + i * 2, 2, 4 + i * 2);
    lc.value = empList[i].full_name;
    lc.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
    lc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EMP_COLORS[i % EMP_COLORS.length] } };
    lc.alignment = { horizontal: 'center' };
  }
  ganttSheet.getRow(2).height = 16;

  // Column headers: Datum | Tag | [05:00 05:30 06:00 ...]
  const ghRow = ganttSheet.getRow(3);
  ghRow.getCell(1).value = 'Datum';
  ghRow.getCell(2).value = 'Tag';
  for (let s = 0; s < SLOTS; s++) {
    const totalMinsSlot = GANTT_START * 60 + s * SLOT_MINS;
    const hh = Math.floor(totalMinsSlot / 60);
    const mm = totalMinsSlot % 60;
    const c = ghRow.getCell(3 + s);
    c.value = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
    c.font = { bold: true, size: 7, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
    c.alignment = { horizontal: 'center' };
  }
  ghRow.getCell(1).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
  ghRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
  ghRow.getCell(1).alignment = { horizontal: 'center' };
  ghRow.getCell(2).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
  ghRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
  ghRow.getCell(2).alignment = { horizontal: 'center' };
  ganttSheet.getRow(3).height = 18;

  // One row per employee per day
  let ganttRowNum = 4;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const weekday = WEEKDAYS_DE[new Date(dateStr).getDay()];
    const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;

    // One row per employee (merge date/tag cells across all employee rows for this day)
    const empRows = empList.length;
    if (empRows > 1) {
      ganttSheet.mergeCells(ganttRowNum, 1, ganttRowNum + empRows - 1, 1);
      ganttSheet.mergeCells(ganttRowNum, 2, ganttRowNum + empRows - 1, 2);
    }

    const dateLabelCell = ganttSheet.getCell(ganttRowNum, 1);
    dateLabelCell.value = `${String(day).padStart(2,'0')}.${String(month).padStart(2,'0')}`;
    dateLabelCell.font = { size: 8, bold: true };
    dateLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
    dateLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isWeekend ? 'FFE5E7EB' : 'FFF9FAFB' } };

    const wdCell2 = ganttSheet.getCell(ganttRowNum, 2);
    wdCell2.value = weekday;
    wdCell2.font = { size: 8, color: isWeekend ? { argb: 'FF9CA3AF' } : undefined };
    wdCell2.alignment = { horizontal: 'center', vertical: 'middle' };
    wdCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isWeekend ? 'FFE5E7EB' : 'FFF9FAFB' } };

    for (let i = 0; i < empList.length; i++) {
      const row = ganttSheet.getRow(ganttRowNum + i);
      const entry = entryMap.get(empList[i].id)?.get(dateStr);

      let startMin = 0, endMin = 0;
      if (entry?.check_in)  startMin = timeToMinutes(entry.check_in.slice(0,5));
      if (entry?.check_out) endMin   = timeToMinutes(entry.check_out.slice(0,5));

      for (let s = 0; s < SLOTS; s++) {
        const slotStart = GANTT_START * 60 + s * SLOT_MINS;
        const slotEnd   = slotStart + SLOT_MINS;
        const cell = row.getCell(3 + s);

        const isWorking = startMin > 0 && endMin > 0 && slotStart >= startMin && slotEnd <= endMin;
        const isWeekendSlot = isWeekend;

        if (isWorking) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EMP_COLORS[i % EMP_COLORS.length] } };
          // Show time at start and end slots
          if (slotStart === startMin) {
            cell.value = entry!.check_in!.slice(0,5);
            cell.font = { size: 7, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'left' };
          } else if (slotEnd === endMin) {
            cell.value = entry!.check_out!.slice(0,5);
            cell.font = { size: 7, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'right' };
          }
        } else if (isWeekendSlot) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        }

        // Hour separator
        if (s % 2 === 0) {
          cell.border = { left: { style: 'thin', color: { argb: 'FFD1D5DB' } } };
        }
      }
      row.height = 14;
    }
    ganttRowNum += empList.length;
  }

  // Column widths for gantt
  ganttSheet.getColumn(1).width = 9;
  ganttSheet.getColumn(2).width = 5;
  for (let s = 0; s < SLOTS; s++) ganttSheet.getColumn(3 + s).width = 4;

  // Freeze header columns
  ganttSheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 3 }];
  dataSheet.views  = [{ state: 'frozen', xSplit: 0, ySplit: 3 }];

  // ── SHEET 3: ÜBERSICHT (one row per day, all employees overlaid) ──
  const overSheet = workbook.addWorksheet('Übersicht');

  // Title
  overSheet.mergeCells(1, 1, 1, 2 + SLOTS);
  const oTitle = overSheet.getCell(1, 1);
  oTitle.value = `Gesamtübersicht ${MONTH_NAMES_DE[month-1]} ${year} – alle Mitarbeiter`;
  oTitle.font = { bold: true, size: 13, color: { argb: 'FF1565D8' } };
  oTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  overSheet.getRow(1).height = 26;

  // Legend
  const oLeg = overSheet.getRow(2);
  oLeg.getCell(1).value = 'Legende:';
  oLeg.getCell(1).font = { bold: true, size: 9 };
  let legCol = 2;
  for (let i = 0; i < empList.length; i++) {
    const lc = oLeg.getCell(legCol);
    overSheet.mergeCells(2, legCol, 2, legCol + 1);
    lc.value = empList[i].full_name;
    lc.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
    lc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EMP_COLORS[i % EMP_COLORS.length] } };
    lc.alignment = { horizontal: 'center' };
    legCol += 2;
  }
  overSheet.getRow(2).height = 16;

  // Time header
  const oHdr = overSheet.getRow(3);
  oHdr.getCell(1).value = 'Datum';
  oHdr.getCell(2).value = 'Tag';
  for (let s = 0; s < SLOTS; s++) {
    const slotMin = GANTT_START * 60 + s * SLOT_MINS;
    const hh = Math.floor(slotMin / 60), mm = slotMin % 60;
    const c = oHdr.getCell(3 + s);
    c.value = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
    c.font = { bold: true, size: 7, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
    c.alignment = { horizontal: 'center' };
  }
  oHdr.getCell(1).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
  oHdr.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
  oHdr.getCell(1).alignment = { horizontal: 'center' };
  oHdr.getCell(2).font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
  oHdr.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
  oHdr.getCell(2).alignment = { horizontal: 'center' };
  overSheet.getRow(3).height = 18;

  // One row per day — all employees overlaid
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const weekday = WEEKDAYS_DE[new Date(dateStr).getDay()];
    const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;
    const oRow = overSheet.getRow(3 + day);

    const odCell = oRow.getCell(1);
    odCell.value = `${String(day).padStart(2,'0')}.${String(month).padStart(2,'0')}`;
    odCell.font = { size: 8, bold: true };
    odCell.alignment = { horizontal: 'center' };
    odCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isWeekend ? 'FFE5E7EB' : 'FFF9FAFB' } };

    const owCell = oRow.getCell(2);
    owCell.value = weekday;
    owCell.font = { size: 8, color: isWeekend ? { argb: 'FF9CA3AF' } : undefined };
    owCell.alignment = { horizontal: 'center' };
    owCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isWeekend ? 'FFE5E7EB' : 'FFF9FAFB' } };

    // For each slot, find which employees are working — last one wins for color,
    // but we show initials to indicate overlap
    for (let s = 0; s < SLOTS; s++) {
      const slotStart = GANTT_START * 60 + s * SLOT_MINS;
      const slotEnd   = slotStart + SLOT_MINS;
      const cell = oRow.getCell(3 + s);

      const working = empList.filter((emp, i) => {
        const entry = entryMap.get(emp.id)?.get(dateStr);
        if (!entry?.check_in || !entry?.check_out) return false;
        const st = timeToMinutes(entry.check_in.slice(0,5));
        const en = timeToMinutes(entry.check_out.slice(0,5));
        return slotStart >= st && slotEnd <= en;
      });

      if (working.length === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isWeekend ? 'FFF3F4F6' : 'FFFFFFFF' } };
      } else if (working.length === 1) {
        const idx = empList.indexOf(working[0]);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EMP_COLORS[idx % EMP_COLORS.length] } };
      } else {
        // Multiple employees — use striped look (darker mix color) + show count
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        cell.value = working.length;
        cell.font = { size: 7, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center' };
      }

      if (s % 2 === 0) {
        cell.border = { left: { style: 'thin', color: { argb: 'FFD1D5DB' } } };
      }
    }
    oRow.height = 16;
  }

  overSheet.getColumn(1).width = 9;
  overSheet.getColumn(2).width = 5;
  for (let s = 0; s < SLOTS; s++) overSheet.getColumn(3 + s).width = 4;
  overSheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 3 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `Arbeitszeiten_${MONTH_NAMES_DE[month-1]}_${year}.xlsx`;

  return new Response(buffer as Buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};
