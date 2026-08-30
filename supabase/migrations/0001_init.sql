-- Mayur Masala Center — core schema
create extension if not exists "pgcrypto";

create type txn_type as enum ('sale', 'purchase', 'expense');

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  type txn_type not null,
  amount numeric(12,2) not null check (amount >= 0),
  category text,                    -- e.g. "Garam Masala", "Raw Material", "Electricity"
  description text,
  txn_date date not null default current_date,
  source text not null default 'web',   -- 'web' | 'telegram'
  created_by text,                       -- auth.uid() text OR telegram user id
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_type_date on transactions (type, txn_date);

-- Telegram whitelist
create table if not exists allowed_telegram_users (
  telegram_id bigint primary key,
  name text,
  role text default 'staff',        -- 'admin' | 'staff'
  added_at timestamptz default now()
);

-- Example: insert yourself
-- insert into allowed_telegram_users (telegram_id, name, role) values (123456789, 'Owner', 'admin');

-- ---------- Financial-year helper (India: Apr 1 – Mar 31) ----------
create or replace function fin_year(d date) returns text as $$
  select case
    when extract(month from d) >= 4
      then extract(year from d)::text || '-' || (extract(year from d)::int + 1)::text
    else (extract(year from d)::int - 1)::text || '-' || extract(year from d)::text
  end;
$$ language sql immutable;

-- ---------- Rollup views ----------
create or replace view v_monthly_summary as
select
  date_trunc('month', txn_date)::date as period,
  type,
  sum(amount) as total,
  count(*) as txn_count
from transactions
group by 1, 2;

create or replace view v_yearly_summary as
select
  date_trunc('year', txn_date)::date as period,
  type,
  sum(amount) as total,
  count(*) as txn_count
from transactions
group by 1, 2;

create or replace view v_fy_summary as
select
  fin_year(txn_date) as fin_year,
  type,
  sum(amount) as total,
  count(*) as txn_count
from transactions
group by 1, 2;

create or replace view v_today_summary as
select type, sum(amount) as total, count(*) as txn_count
from transactions
where txn_date = current_date
group by 1;

-- ---------- Row Level Security ----------
alter table transactions enable row level security;
alter table allowed_telegram_users enable row level security;

-- Any authenticated (logged-in) staff user can read/write transactions.
create policy "authenticated read" on transactions
  for select using (auth.role() = 'authenticated');
create policy "authenticated insert" on transactions
  for insert with check (auth.role() = 'authenticated');
create policy "authenticated update" on transactions
  for update using (auth.role() = 'authenticated');
create policy "authenticated delete" on transactions
  for delete using (auth.role() = 'authenticated');

-- allowed_telegram_users: only manageable via service_role (used by admin/bot backend), not exposed to client.
create policy "no client access" on allowed_telegram_users
  for all using (false);
