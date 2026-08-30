-- Purchase vendors tracking
create table if not exists purchase_vendors (
  id uuid primary key default gen_random_uuid(),
  vendor_name text not null,
  whatsapp_number text,
  description text,
  amount numeric(12,2) not null check (amount >= 0),
  paid_amount numeric(12,2) not null default 0,
  status text not null default 'unpaid' check (status in ('paid', 'unpaid', 'partial')),
  date date not null default current_date,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists idx_purchase_vendors_name on purchase_vendors (vendor_name);
create index if not exists idx_purchase_vendors_date on purchase_vendors (date);
create index if not exists idx_purchase_vendors_status on purchase_vendors (status);

alter table purchase_vendors enable row level security;

drop policy if exists "authenticated all purchase_vendors" on purchase_vendors;

create policy "authenticated all purchase_vendors" on purchase_vendors
  for all using (auth.role() = 'authenticated');