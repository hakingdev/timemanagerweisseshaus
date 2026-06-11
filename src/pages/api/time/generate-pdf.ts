import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import { generateMonthlyPDF } from '../../../lib/pdf';

export const GET: APIRoute = async ({ url, cookies }) => {
  const auth = await requireAuth(cookies);
  if (!auth) return new Response('Unauthorized', { status: 401 });

  const { profile, client } = auth;
  const year  = parseInt(url.searchParams.get('year')  ?? String(new Date().getFullYear()));
  const month = parseInt(url.searchParams.get('month') ?? String(new Date().getMonth() + 1));

  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth  = month === 12 ? 1 : month + 1;
  const nextYear   = month === 12 ? year + 1 : year;
  const monthEnd   = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  const { data: entries } = await client
    .from('time_entries')
    .select('*')
    .eq('employee_id', profile.id)
    .gte('date', monthStart)
    .lt('date', monthEnd)
    .order('date', { ascending: true });

  const pdfBytes = await generateMonthlyPDF(profile, entries ?? [], year, month);

  const MONTH_NAMES_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const filename = `Arbeitszeitnachweis_${profile.full_name.replace(/\s+/g, '_')}_${MONTH_NAMES_DE[month-1]}_${year}.pdf`;

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};
