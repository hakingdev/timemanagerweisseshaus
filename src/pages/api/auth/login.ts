import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = form.get('email')?.toString().trim() ?? '';
  const password = form.get('password')?.toString() ?? '';

  if (!email || !password) {
    return redirect('/login?error=' + encodeURIComponent('Bitte E-Mail und Passwort eingeben'));
  }

  const client = createClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );

  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return redirect('/login?error=' + encodeURIComponent(error?.message ?? 'Kein Session'));
  }

  const maxAge = 60 * 60 * 24 * 7;
  cookies.set('sb-access-token', data.session.access_token, {
    path: '/', httpOnly: true, sameSite: 'lax', maxAge
  });
  cookies.set('sb-refresh-token', data.session.refresh_token, {
    path: '/', httpOnly: true, sameSite: 'lax', maxAge
  });

  // Use service role key to bypass RLS for profile lookup
  const adminClient = createClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  return redirect(profile?.role === 'admin' ? '/admin' : '/employee');
};
