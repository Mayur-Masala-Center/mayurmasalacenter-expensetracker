-- Update views to use purchase_vendors table for purchase calculations
-- This combines purchase_vendors with transactions for profit/loss calculations

-- Drop existing views
drop view if exists v_monthly_summary;
drop view if exists v_yearly_summary;
drop view if exists v_fy_summary;

-- Monthly summary: combine transactions with purchase_vendors
create or replace view v_monthly_summary as
select
  date_trunc('month', date)::date as period,
  type,
  sum(amount) as total,
  count(*) as txn_count
from (
  select txn_date as date, 'sale' as type, amount from transactions where type = 'sale'
  union all
  select date::date as date, 'purchase' as type, amount from purchase_vendors
  union all
  select txn_date as date, 'expense' as type, amount from transactions where type = 'expense'
) combined
group by period, type;

-- Yearly summary
create or replace view v_yearly_summary as
select
  date_trunc('year', date)::date as period,
  type,
  sum(amount) as total,
  count(*) as txn_count
from (
  select txn_date as date, 'sale' as type, amount from transactions where type = 'sale'
  union all
  select date::date as date, 'purchase' as type, amount from purchase_vendors
  union all
  select txn_date as date, 'expense' as type, amount from transactions where type = 'expense'
) combined
group by period, type;

-- Financial year summary (Apr-Mar)
create or replace view v_fy_summary as
select
  fin_year(date) as fin_year,
  type,
  sum(amount) as total,
  count(*) as txn_count
from (
  select txn_date as date, 'sale' as type, amount from transactions where type = 'sale'
  union all
  select date::date as date, 'purchase' as type, amount from purchase_vendors
  union all
  select txn_date as date, 'expense' as type, amount from transactions where type = 'expense'
) combined
group by fin_year, type;
