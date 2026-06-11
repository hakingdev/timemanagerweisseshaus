import { createClient } from '@supabase/supabase-js';
import { r as requireAuth } from './auth_BkhGAYOe.mjs';

const POST = async ({ request, cookies, redirect }) => {
  const auth = await requireAuth(cookies, "admin");
  if (!auth) return redirect("/login");
  const form = await request.formData();
  const email = form.get("email")?.toString().trim() ?? "";
  const password = form.get("password")?.toString() ?? "";
  const full_name = form.get("full_name")?.toString().trim() ?? "";
  const location = form.get("location")?.toString() ?? "Weisses Haus Hotel";
  const adminClient = createClient(
    "https://fgxvkqfeogmcamgqndli.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZneHZrcWZlb2dtY2FtZ3FuZGxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEyMTMxOSwiZXhwIjoyMDk2Njk3MzE5fQ.j3FOgNZs9e4eiGh7WWDWXgivXoj-l2EyQzNDehbEH2I"
  );
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (error || !data.user) {
    return redirect("/admin/employees/new?error=" + encodeURIComponent(error?.message ?? "Fehler beim Anlegen"));
  }
  const { error: profileError } = await adminClient.from("profiles").insert({
    id: data.user.id,
    email,
    full_name,
    role: "employee",
    location
  });
  if (profileError) {
    await adminClient.auth.admin.deleteUser(data.user.id);
    return redirect("/admin/employees/new?error=" + encodeURIComponent(profileError.message));
  }
  return redirect("/admin?msg=" + encodeURIComponent(`${full_name} wurde erfolgreich angelegt`));
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
