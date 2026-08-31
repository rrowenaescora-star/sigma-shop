-- Run this once in Supabase SQL Editor.
-- It records every deduction on the order and updates the shop capital in one
-- database transaction, so duplicate payment webhooks cannot deduct twice.

alter table public.orders
  add column if not exists capital_deducted_at timestamptz,
  add column if not exists capital_deducted_amount numeric(12, 2);

create or replace function public.deduct_capital_for_paid_order(p_order_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  order_record public.orders%rowtype;
  current_capital numeric(12, 2);
  deduction numeric(12, 2) := 0;
begin
  select * into order_record
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order % was not found.', p_order_id;
  end if;

  if lower(coalesce(order_record.payment_status, '')) <> 'paid' then
    raise exception 'Order % is not paid.', p_order_id;
  end if;

  if order_record.capital_deducted_at is not null then
    return jsonb_build_object(
      'deducted', false,
      'reason', 'already_deducted',
      'amount', order_record.capital_deducted_amount
    );
  end if;

  select coalesce(sum(coalesce(p.cost_value, 0) * coalesce((item.value ->> 'quantity')::numeric, 1)), 0)
  into deduction
  from jsonb_array_elements(coalesce(order_record.items, '[]'::jsonb)) as item(value)
  join public.products p on p.id = (item.value ->> 'id')::bigint;

  select global_capital into current_capital
  from public.shop_settings
  order by id
  limit 1
  for update;

  if current_capital is null then
    raise exception 'Shop capital settings were not found.';
  end if;

  update public.shop_settings
  set global_capital = current_capital - deduction,
      updated_at = now()
  where id = (select id from public.shop_settings order by id limit 1);

  update public.orders
  set capital_deducted_at = now(),
      capital_deducted_amount = deduction
  where id = p_order_id;

  return jsonb_build_object(
    'deducted', true,
    'amount', deduction,
    'remaining_capital', current_capital - deduction
  );
end;
$$;

revoke all on function public.deduct_capital_for_paid_order(bigint) from public;
grant execute on function public.deduct_capital_for_paid_order(bigint) to service_role;