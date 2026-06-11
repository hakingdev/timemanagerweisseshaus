import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../../../lib/auth';
import type { Database } from '../../../lib/database.types';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies, 'admin');
  if (!auth) return redirect('/login');

  const form = await request.formData();
  const email = form.get('email')?.toString().trim() ?? '';
  const password = form.get('password')?.toString() ?? '';
  const full_name = form.get('full_name')?.toString().trim() ?? '';
  const location = form.get('location')?.toString() ?? 'Weisses Haus Hotel';
  const role     = (form.get('role')?.toString() ?? 'employee') as 'employee' | 'boss';

  // Service role client to create users
  const adminClient = createClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return redirect('/admin/employees/new?error=' + encodeURIComponent(error?.message ?? 'Fehler beim Anlegen'));
  }

  const { error: profileError } = await adminClient.from('profiles').insert({
    id: data.user.id,
    email,
    full_name,
    role,
    location,
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(data.user.id);
    return redirect('/admin/employees/new?error=' + encodeURIComponent(profileError.message));
  }

  return redirect('/admin?msg=' + encodeURIComponent(`${full_name} wurde erfolgreich angelegt`));
};
