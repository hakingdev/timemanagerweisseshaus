import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies, 'admin');
  if (!auth) return redirect('/login');

  const { client } = auth;
  const form = await request.formData();
  const id = form.get('id')?.toString() ?? '';

  if (!id) return redirect('/admin?error=' + encodeURIComponent('Ungültige ID'));

  const { data: emp } = await client.from('profiles').select('full_name').eq('id', id).single();

  await client.from('profiles').update({
    archived: true,
    archived_at: new Date().toISOString(),
  }).eq('id', id);

  return redirect('/admin?msg=' + encodeURIComponent(`${emp?.full_name ?? 'Mitarbeiter'} wurde archiviert`));
};
