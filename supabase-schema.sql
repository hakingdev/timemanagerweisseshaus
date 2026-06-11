-- Run this in Supabase SQL Editor

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Time entries table
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS time_entries_employee_date ON public.time_entries(employee_id, date);
CREATE INDEX IF NOT EXISTS time_entries_date ON public.time_entries(date);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Time entries policies
CREATE POLICY "Employees can read own entries"
  ON public.time_entries FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "Employees can insert own entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own entries"
  ON public.time_entries FOR UPDATE
  USING (employee_id = auth.uid());

CREATE POLICY "Admins can read all entries"
  ON public.time_entries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create initial admin user (run AFTER creating the user in Supabase Auth)
-- Replace the UUID and email with your actual admin user data
-- INSERT INTO public.profiles (id, email, full_name, role)
-- VALUES ('YOUR-ADMIN-UUID', 'admin@firma.de', 'Administrator', 'admin');
