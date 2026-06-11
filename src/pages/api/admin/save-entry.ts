import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies, 'admin');
  if (!auth) return redirect('/login');

  const { client } = auth;
  const form = await request.formData();
  const id          = form.get('id')?.toString() || null;
  const employeeId  = form.get('employee_id')?.toString() ?? '';
  const date        = form.get('date')?.toString() ?? '';
  const check_in    = form.get('check_in')?.toString() || null;
  const check_out   = form.get('check_out')?.toString() || null;
  const note        = form.get('note')?.toString().trim() || null;
  const year        = form.get('year')?.toString() ?? '';
  const month       = form.get('month')?.toString() ?? '';

  const back = `/admin/employees/${employeeId}?year=${year}&month=${month}`;

  if (!date || !employeeId) {
    return redirect(back + '&error=' + encodeURIComponent('Datum fehlt'));
  }

  if (check_in && check_out) {
    const [ih, im] = check_in.split(':').map(Number);
    const [oh, om] = check_out.split(':').map(Number);
    if ((oh * 60 + om) <= (ih * 60 + im)) {
      return redirect(back + '&error=' + encodeURIComponent('Gehen muss nach Kommen liegen'));
    }
  }

  const checkInTime  = check_in  ? check_in  + ':00' : null;
  const checkOutTime = check_out ? check_out + ':00' : null;

  let error;

  if (id) {
    // Update existing entry
    const result = await client
      .from('time_entries')
      .update({ date, check_in: checkInTime, check_out: checkOutTime, note })
      .eq('id', id);
    error = result.error;
  } else {
    // Check if entry already exists for this date + employee
    const { data: existing } = await client
      .from('time_entries')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('date', date)
      .single();

    if (existing) {
      const result = await client
        .from('time_entries')
        .update({ check_in: checkInTime, check_out: checkOutTime, note })
        .eq('id', existing.id);
      error = result.error;
    } else {
      const result = await client
        .from('time_entries')
        .insert({ employee_id: employeeId, date, check_in: checkInTime, check_out: checkOutTime, note });
      error = result.error;
    }
  }

  if (error) {
    return redirect(back + '&error=' + encodeURIComponent(error.message));
  }

  return redirect(back + '&msg=' + encodeURIComponent('Gespeichert ✓'));
};
