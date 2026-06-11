import { createClient } from '@supabase/supabase-js';
import type { Database, Profile } from './database.types';
import type { AstroCookies } from 'astro';

const IS_DEMO = import.meta.env.PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';

// Demo users store (in-memory, resets on restart — fine for preview)
export const DEMO_USERS: Record<string, { password: string; role: 'admin' | 'employee'; name: string; id: string }> = {
  'admin@weisseshaus.de': {
    password: 'WeissesHaus2025!',
    role: 'admin',
    name: 'Administrator',
    id: 'demo-admin-001',
  },
};

// Demo employees (shown in admin panel)
export const DEMO_EMPLOYEES: Profile[] = [
  { id: 'demo-emp-001', email: 'anna.mueller@weisseshaus.de', full_name: 'Anna Müller', role: 'employee', created_at: '2024-01-01' },
  { id: 'demo-emp-002', email: 'klaus.schmidt@weisseshaus.de', full_name: 'Klaus Schmidt', role: 'employee', created_at: '2024-01-01' },
  { id: 'demo-emp-003', email: 'maria.braun@weisseshaus.de', full_name: 'Maria Braun', role: 'employee', created_at: '2024-01-01' },
];

export function getServerSupabase(cookies: AstroCookies) {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  const client = createClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  if (accessToken && refreshToken) {
    client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  }

  return client;
}

export async function requireAuth(cookies: AstroCookies, requiredRole?: 'admin' | 'employee') {
  if (IS_DEMO) {
    const role = cookies.get('demo-role')?.value as 'admin' | 'employee' | undefined;
    const name = cookies.get('demo-name')?.value;
    const email = cookies.get('demo-email')?.value;

    if (!role || !name || !email) return null;
    if (requiredRole === 'admin' && role !== 'admin') return null;

    const profile: Profile = {
      id: role === 'admin' ? 'demo-admin-001' : 'demo-emp-001',
      email,
      full_name: name,
      role,
      created_at: new Date().toISOString(),
    };

    return { user: { id: profile.id, email }, profile, client: null as any };
  }

  const accessToken = cookies.get('sb-access-token')?.value;
  if (!accessToken) return null;

  // Use service role client to bypass RLS
  const adminClient = createClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Verify token is valid
  const { data: { user }, error } = await adminClient.auth.getUser(accessToken);
  if (error || !user) return null;

  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;
  if (requiredRole === 'admin' && profile.role !== 'admin') return null;

  return { user, profile, client: adminClient };
}
