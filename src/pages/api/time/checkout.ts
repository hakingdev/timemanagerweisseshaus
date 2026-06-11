import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const auth = await requireAuth(cookies);
  if (!auth) return redirect('/login');

  const { profile, client } = auth;
  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 8);

  await client
    .from('time_entries')
    .update({ check_out: nowTime })
    .eq('employee_id', profile.id)
    .eq('date', today)
    .is('check_out', null);

  return redirect('/employee');
};
