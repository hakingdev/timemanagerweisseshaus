import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../../../lib/auth';
import type { Database } from '../../../lib/database.types';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies, 'admin');
  if (!auth) return redirect('/login');

  const form = await request.formData();
  const id   = form.get('id')?.toString() ?? '';
  const name = form.get('name')?.toString() ?? 'Mitarbeiter';

  if (!id) return redirect('/admin?error=' + encodeURIComponent('Ungültige ID'));

  const adminClient = createClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Only allow purging archived employees
  const { data: emp } = await adminClient
    .from('profiles').select('archived').eq('id', id).single();

  if (!emp?.archived) {
    return redirect('/admin?error=' + encodeURIComponent('Nur archivierte Mitarbeiter können endgültig gelöscht werden'));
  }

  // Delete all time entries
  await adminClient.from('time_entries').delete().eq('employee_id', id);

  // Delete audit logs
  await adminClient.from('audit_logs').delete().eq('employee_id', id);

  // Delete profile
  await adminClient.from('profiles').delete().eq('id', id);

  // Delete from Supabase Auth
  await adminClient.auth.admin.deleteUser(id);

  return redirect('/admin?msg=' + encodeURIComponent(`${name} wurde endgültig gelöscht`));
};
