-- Run this in the Supabase SQL Editor before using the customer support inbox.
create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default 'Customer support',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender text not null check (sender in ('customer', 'staff')),
  body text not null check (char_length(body) between 1 and 4000),
  staff_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists support_conversations_customer_updated_idx on public.support_conversations(customer_id, updated_at desc);
create index if not exists support_messages_conversation_created_idx on public.support_messages(conversation_id, created_at asc);
alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;
-- Run this additional line in Supabase SQL Editor for the transcript email cooldown.
alter table public.support_conversations add column if not exists transcript_sent_at timestamptz;
-- Run this in Supabase SQL Editor before using screenshot attachments.
alter table public.support_messages add column if not exists attachment_path text;
insert into storage.buckets (id, name, public) values ('support-attachments', 'support-attachments', false) on conflict (id) do nothing;