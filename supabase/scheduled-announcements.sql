create table if not exists public.scheduled_announcements (
  id uuid primary key default gen_random_uuid(),
  announcement jsonb not null,
  recipients text[] not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled','sending','completed','failed','cancelled')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  error text
);
create index if not exists scheduled_announcements_due_idx
  on public.scheduled_announcements(status, scheduled_at);
alter table public.scheduled_announcements enable row level security;