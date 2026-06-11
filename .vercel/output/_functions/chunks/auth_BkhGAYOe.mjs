import { createClient } from '@supabase/supabase-js';

const DEMO_EMPLOYEES = [
  { id: "demo-emp-001", email: "anna.mueller@weisseshaus.de", full_name: "Anna Müller", role: "employee", created_at: "2024-01-01" },
  { id: "demo-emp-002", email: "klaus.schmidt@weisseshaus.de", full_name: "Klaus Schmidt", role: "employee", created_at: "2024-01-01" },
  { id: "demo-emp-003", email: "maria.braun@weisseshaus.de", full_name: "Maria Braun", role: "employee", created_at: "2024-01-01" }
];
async function requireAuth(cookies, requiredRole) {
  const accessToken = cookies.get("sb-access-token")?.value;
  if (!accessToken) return null;
  const adminClient = createClient(
    "https://fgxvkqfeogmcamgqndli.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZneHZrcWZlb2dtY2FtZ3FuZGxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEyMTMxOSwiZXhwIjoyMDk2Njk3MzE5fQ.j3FOgNZs9e4eiGh7WWDWXgivXoj-l2EyQzNDehbEH2I"
  );
  const { data: { user }, error } = await adminClient.auth.getUser(accessToken);
  if (error || !user) return null;
  const { data: profile } = await adminClient.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;
  if (requiredRole === "admin" && profile.role !== "admin") return null;
  return { user, profile, client: adminClient };
}

export { DEMO_EMPLOYEES as D, requireAuth as r };
