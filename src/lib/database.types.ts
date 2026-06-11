export type Role = 'admin' | 'employee' | 'boss';

export type Location = 'Weisses Haus Hotel' | 'Fass und Flamme' | 'Ukrainische Hütte' | 'Bun und Fish';

export const LOCATIONS: Location[] = [
  'Weisses Haus Hotel',
  'Fass und Flamme',
  'Ukrainische Hütte',
  'Bun und Fish',
];

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  location: Location;
  archived: boolean;
  archived_at: string | null;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  note: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  employee_id: string;
  employee_name: string;
  action: 'delete' | 'edit';
  entry_date: string;
  old_check_in: string | null;
  old_check_out: string | null;
  old_note: string | null;
  new_check_in: string | null;
  new_check_out: string | null;
  new_note: string | null;
  performed_by: 'employee' | 'admin';
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      time_entries: {
        Row: TimeEntry;
        Insert: Omit<TimeEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<TimeEntry, 'id' | 'created_at'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
}
