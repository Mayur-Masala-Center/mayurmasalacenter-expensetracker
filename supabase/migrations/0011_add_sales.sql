-- Sync printed bills from the billing app into daily sales.
--
-- Both apps share one Supabase project. Every day gets ONE auto-managed sale row in
-- `transactions` (source = 'billing', category = 'Billing') whose amount is the sum of that
-- day's printed bills (bills.status = 'final'). Drafts and cancelled bills are not counted.
-- The row is created / updated / removed automatically whenever a bill is printed, cancelled,
-- re-dated or deleted, so the existing dashboard, sales page, P&L views and Telegram
-- summary pick it up with no code change. Manual sales entries are left untouched.
--
-- The day a bill belongs to matches the billing app: its billing_date, else the (IST) day it
-- was created.

do $$
begin
  if to_regclass('public.bills') is null then
    raise exception 'public.bills not found. This migration expects the billing app tables in the same Supabase project.';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bills' and column_name = 'billing_date'
  ) then
    raise exception 'bills.billing_date is missing. Run the billing app part-2 SQL (migrations_part2_features.sql) first.';
  end if;
end $$;

-- One billing row per day.
create unique index if not exists uq_transactions_billing_day
  on transactions (txn_date) where source = 'billing';

-- Recompute the billing sale for a single day.
create or replace function sync_billing_sales(p_day date) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total numeric(12,2);
  v_count int;
begin
  if p_day is null then
    return;
  end if;

  -- Serialize concurrent bills for the same day so the sum below is never stale.
  perform pg_advisory_xact_lock(hashtext('billing_sales:' || p_day::text));

  select coalesce(sum(total_amount), 0), count(*)
    into v_total, v_count
  from bills
  where status = 'final'
    and coalesce(billing_date::date, (created_at at time zone 'Asia/Kolkata')::date) = p_day;

  if v_count = 0 then
    delete from transactions where source = 'billing' and txn_date = p_day;
  else
    insert into transactions (type, amount, category, description, txn_date, source, created_by)
    values ('sale', v_total, 'Billing',
            v_count || case when v_count = 1 then ' bill' else ' bills' end || ' from billing app',
            p_day, 'billing', 'billing-app')
    on conflict (txn_date) where source = 'billing'
    do update set amount = excluded.amount, description = excluded.description;
  end if;
end;
$$;

create or replace function trg_bills_sync_sales() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old date;
  v_new date;
begin
  if tg_op in ('UPDATE', 'DELETE') then
    v_old := coalesce(old.billing_date::date, (old.created_at at time zone 'Asia/Kolkata')::date);
    perform sync_billing_sales(v_old);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    v_new := coalesce(new.billing_date::date, (new.created_at at time zone 'Asia/Kolkata')::date);
    if tg_op = 'INSERT' or v_new is distinct from v_old then
      perform sync_billing_sales(v_new);
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists bills_sync_sales on bills;
create trigger bills_sync_sales
  after insert or delete or update of status, total_amount, billing_date on bills
  for each row execute function trg_bills_sync_sales();

-- OPTIONAL backfill of bills printed before this migration. Run it only if those days were
-- NOT already entered by hand as sales, otherwise they would be counted twice:
--
--   select sync_billing_sales(d) from (
--     select distinct coalesce(billing_date::date, (created_at at time zone 'Asia/Kolkata')::date) as d
--     from bills where status = 'final'
--   ) days;
