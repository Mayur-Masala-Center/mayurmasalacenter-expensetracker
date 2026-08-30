-- Attendance tracking
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  date date not null,
  status text not null default 'present' check (status in ('present', 'absent')),
  created_at timestamptz not null default now(),
  unique (staff_id, date)
);

create index if not exists idx_attendance_date on attendance (date);
create index if not exists idx_attendance_staff on attendance (staff_id);

alter table staff enable row level security;
alter table attendance enable row level security;

create policy "authenticated all staff" on staff
  for all using (auth.role() = 'authenticated');

create policy "authenticated all attendance" on attendance
  for all using (auth.role() = 'authenticated');