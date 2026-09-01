-- Run this entire file in the Supabase SQL Editor.
create table if not exists public.announcement_campaigns (
 id uuid primary key default gen_random_uuid(), subject text not null, title text not null,
 product_name text not null, image_url text not null, message text not null, secondary_text text,
 cta_text text not null default 'Get It Now', cta_url text not null,
 recipient_count integer not null default 0, successful_count integer not null default 0,
 failed_count integer not null default 0, status text not null default 'preparing',
 idempotency_key text not null unique, created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), sent_at timestamptz
);
alter table public.announcement_campaigns add column if not exists processed_count integer not null default 0;
alter table public.announcement_campaigns add column if not exists current_batch integer not null default 0;
alter table public.announcement_campaigns add column if not exists total_batches integer not null default 0;
alter table public.announcement_campaigns add column if not exists retry_attempts integer not null default 0;
alter table public.announcement_campaigns add column if not exists started_at timestamptz;
alter table public.announcement_campaigns add column if not exists completed_at timestamptz;
alter table public.announcement_campaigns add column if not exists updated_at timestamptz not null default now();
alter table public.announcement_campaigns drop constraint if exists announcement_campaigns_status_check;
alter table public.announcement_campaigns add constraint announcement_campaigns_status_check
 check(status in ('preparing','queued','sending','completed','completed_with_errors','failed'));
update public.announcement_campaigns set
 processed_count=successful_count+failed_count,
 completed_at=coalesce(completed_at,sent_at),
 status=case status when 'sent' then 'completed' when 'partial' then 'completed_with_errors' else status end
where status in ('sent','partial');

create table if not exists public.announcement_campaign_recipients (
 id bigserial primary key, campaign_id uuid not null references public.announcement_campaigns(id) on delete cascade,
 email text not null, masked_email text not null, status text not null default 'queued'
 check(status in ('queued','processing','sent','failed')), safe_error text, batch_number integer,
 attempt_count integer not null default 0, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), processed_at timestamptz, unique(campaign_id,email)
);
create table if not exists public.announcement_campaign_activity (
 id bigserial primary key, campaign_id uuid not null references public.announcement_campaigns(id) on delete cascade,
 event_type text not null, message text not null, detail text, masked_email text,
 created_at timestamptz not null default now()
);
create index if not exists announcement_campaigns_created_idx on public.announcement_campaigns(created_at desc);
create index if not exists announcement_recipients_queue_idx on public.announcement_campaign_recipients(campaign_id,status,id);
create index if not exists announcement_activity_campaign_idx on public.announcement_campaign_activity(campaign_id,created_at desc);
create unique index if not exists announcement_one_active_campaign_idx
 on public.announcement_campaigns((true)) where status in ('preparing','queued','sending');
alter table public.announcement_campaigns enable row level security;
alter table public.announcement_campaign_recipients enable row level security;
alter table public.announcement_campaign_activity enable row level security;

create or replace function public.claim_announcement_batch(p_campaign_id uuid,p_batch_size integer)
returns table(id bigint,email text,masked_email text,batch_number integer)
language plpgsql security definer set search_path=public as $$
declare next_batch integer;
begin
 update public.announcement_campaigns
 set status='sending',started_at=coalesce(started_at,now()),current_batch=current_batch+1,updated_at=now()
 where announcement_campaigns.id=p_campaign_id and status in ('preparing','queued','sending')
 returning current_batch into next_batch;
 if next_batch is null then return; end if;
 return query
 with picked as (
  select r.id from public.announcement_campaign_recipients r
  where r.campaign_id=p_campaign_id and r.status='queued'
  order by r.id for update skip locked limit greatest(1,least(p_batch_size,100))
 ), changed as (
  update public.announcement_campaign_recipients r set status='processing',
   attempt_count=r.attempt_count+1,batch_number=next_batch,updated_at=now()
  from picked where r.id=picked.id returning r.id,r.email,r.masked_email
 )
 select changed.id,changed.email,changed.masked_email,next_batch from changed;
end $$;

create or replace function public.record_announcement_result(p_recipient_id bigint,p_success boolean,p_error text)
returns void language plpgsql security definer set search_path=public as $$
declare c_id uuid;m_email text;
begin
 update public.announcement_campaign_recipients set
  status=case when p_success then 'sent' else 'failed' end,
  safe_error=case when p_success then null else left(coalesce(p_error,'Provider request failed'),180) end,
  processed_at=now(),updated_at=now()
 where id=p_recipient_id and status='processing'
 returning campaign_id,masked_email into c_id,m_email;
 if c_id is null then return; end if;
 update public.announcement_campaigns set processed_count=processed_count+1,
  successful_count=successful_count+case when p_success then 1 else 0 end,
  failed_count=failed_count+case when p_success then 0 else 1 end,updated_at=now()
 where id=c_id;
 insert into public.announcement_campaign_activity(campaign_id,event_type,message,detail,masked_email)
 values(c_id,case when p_success then 'accepted' else 'failed' end,
  case when p_success then 'Email accepted by provider' else 'Email request failed' end,
  case when p_success then null else left(coalesce(p_error,'Provider request failed'),180) end,m_email);
end $$;

create or replace function public.finish_announcement_campaign(p_campaign_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare remaining integer;failures integer;changed integer;
begin
 select count(*) into remaining from public.announcement_campaign_recipients
  where campaign_id=p_campaign_id and status in ('queued','processing');
 if remaining>0 then return; end if;
 select failed_count into failures from public.announcement_campaigns where id=p_campaign_id;
 update public.announcement_campaigns set
  status=case when failures>0 then 'completed_with_errors' else 'completed' end,
  completed_at=now(),sent_at=now(),updated_at=now()
 where id=p_campaign_id and status in ('preparing','queued','sending');
 get diagnostics changed=row_count;
 if changed>0 then insert into public.announcement_campaign_activity(campaign_id,event_type,message,detail)
 values(p_campaign_id,'completed',case when failures>0 then 'Campaign completed with errors' else 'Campaign completed' end,
  case when failures>0 then failures||' provider requests failed' else 'All provider requests were accepted' end);end if;
end $$;
revoke all on function public.claim_announcement_batch(uuid,integer) from public,anon,authenticated;
revoke all on function public.record_announcement_result(bigint,boolean,text) from public,anon,authenticated;
revoke all on function public.finish_announcement_campaign(uuid) from public,anon,authenticated;
