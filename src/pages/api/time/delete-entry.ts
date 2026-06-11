import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies);
  if (!auth) return redirect('/login');
  if (auth.profile.role === 'admin') return redirect('/admin');

  const { client, profile } = auth;
  const form  = await request.formData();
  const id    = form.get('id')?.toString() ?? '';
  const year  = form.get('year')?.toString() ?? '';
  const month = form.get('month')?.toString() ?? '';

  const back = `/employee?year=${year}&month=${month}`;

  // Fetch entry before deleting to log it
  const { data: entry } = await client
    .from('time_entries')
    .select('*')
    .eq('id', id)
    .eq('employee_id', profile.id)
    .single();

  if (!entry) return redirect(back + '&error=' + encodeURIComponent('Eintrag nicht gefunden'));

  await client.from('time_entries').delete().eq('id', id).eq('employee_id', profile.id);

  // Write audit log
  await client.from('audit_logs').insert({
    employee_id:   profile.id,
    employee_name: profile.full_name,
    action:        'delete',
    entry_date:    entry.date,
    old_check_in:  entry.check_in,
    old_check_out: entry.check_out,
    old_note:      entry.note,
    new_check_in:  null,
    new_check_out: null,
    new_note:      null,
    performed_by:  'employee',
  });

  return redirect(back + '&msg=' + encodeURIComponent('Eintrag gelöscht'));
};
