import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const auth = await requireAuth(cookies);
  if (!auth) return redirect('/login');

  const { profile, client } = auth;
  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 8);

  const { data: existing } = await client
    .from('time_entries')
    .select('id, check_in')
    .eq('employee_id', profile.id)
    .eq('date', today)
    .single();

  if (!existing) {
    await client.from('time_entries').insert({
      employee_id: profile.id,
      date: today,
      check_in: nowTime,
      check_out: null,
      note: null,
    });
  }

  return redirect('/employee');
};
