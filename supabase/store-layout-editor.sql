-- Bloxhop Store Layout Editor
-- Run this once in the Supabase SQL editor.

alter table public.products
  add column if not exists display_order integer,
  add column if not exists mobile_display_order integer,
  add column if not exists grid_span text not null default 'normal'
    check (grid_span in ('normal', 'wide', 'large'));

with ordered_products as (
  select id, row_number() over (order by id asc) as position
  from public.products
)
update public.products p
set display_order = coalesce(p.display_order, ordered_products.position),
    mobile_display_order = coalesce(p.mobile_display_order, ordered_products.position)
from ordered_products
where p.id = ordered_products.id;

create table if not exists public.store_sections (
  section_key text primary key,
  display_order integer not null,
  mobile_display_order integer,
  enabled boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_sections_valid_key check (section_key in ('catalog', 'store_info', 'faq'))
);

insert into public.store_sections (section_key, display_order, mobile_display_order, enabled)
values
  ('catalog', 1, 1, true),
  ('store_info', 2, 2, true),
  ('faq', 3, 3, true)
on conflict (section_key) do nothing;

alter table public.store_sections enable row level security;

drop policy if exists "Public can read store layout" on public.store_sections;
create policy "Public can read store layout"
on public.store_sections for select
using (true);

-- All changes are made through the server-side admin route using the service role.