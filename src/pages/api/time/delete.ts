import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies);
  if (!auth) return redirect('/login');

  const { profile, client } = auth;
  const form = await request.formData();
  const id = form.get('id')?.toString() ?? '';

  await client
    .from('time_entries')
    .delete()
    .eq('id', id)
    .eq('employee_id', profile.id);

  return redirect('/employee?msg=' + encodeURIComponent('Eintrag gelöscht'));
};
