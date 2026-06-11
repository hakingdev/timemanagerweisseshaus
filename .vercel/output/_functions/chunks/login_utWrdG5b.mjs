import { createClient } from '@supabase/supabase-js';

const POST = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = form.get("email")?.toString().trim() ?? "";
  const password = form.get("password")?.toString() ?? "";
  if (!email || !password) {
    return redirect("/login?error=" + encodeURIComponent("Bitte E-Mail und Passwort eingeben"));
  }
  const client = createClient(
    "https://fgxvkqfeogmcamgqndli.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZneHZrcWZlb2dtY2FtZ3FuZGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMjEzMTksImV4cCI6MjA5NjY5NzMxOX0.86SnWpSyRf9wPHaxZyLcALsTWeuND9EKU8X_Jhrel7Q",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return redirect("/login?error=" + encodeURIComponent(error?.message ?? "Kein Session"));
  }
  const maxAge = 60 * 60 * 24 * 7;
  cookies.set("sb-access-token", data.session.access_token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge
  });
  cookies.set("sb-refresh-token", data.session.refresh_token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge
  });
  const adminClient = createClient(
    "https://fgxvkqfeogmcamgqndli.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZneHZrcWZlb2dtY2FtZ3FuZGxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEyMTMxOSwiZXhwIjoyMDk2Njk3MzE5fQ.j3FOgNZs9e4eiGh7WWDWXgivXoj-l2EyQzNDehbEH2I"
  );
  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", data.user.id).single();
  return redirect(profile?.role === "admin" ? "/admin" : "/employee");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
