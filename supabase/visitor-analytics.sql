-- Run this once in Supabase SQL Editor before using Visitor Analytics.
create table if not exists public.visitor_events (
  id bigint generated always as identity primary key,
  visitor_id text not null,
  path text not null,
  query text,
  customer_id uuid references auth.users(id) on delete set null,
  customer_email text,
  device text,
  country text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists visitor_events_created_at_idx on public.visitor_events (created_at desc);
create index if not exists visitor_events_visitor_id_idx on public.visitor_events (visitor_id);
create index if not exists visitor_events_path_idx on public.visitor_events (path);
alter table public.visitor_events enable row level security;
-- Events are only written by the server-side route using the service key.