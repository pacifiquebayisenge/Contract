alter table public.shop_items add column if not exists scheduled_on date;

create or replace function public.schedule_shop_purchase(p_item_id uuid, p_scheduled_on date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.shop_items
  set scheduled_on = p_scheduled_on
  where id = p_item_id and status = 'accepted'
    and auth.uid() in (creator_id, partner_id);

  if not found then
    raise exception 'This Shop task is no longer available to schedule.';
  end if;
end;
$$;

revoke all on function public.schedule_shop_purchase(uuid, date) from public, anon, authenticated;
grant execute on function public.schedule_shop_purchase(uuid, date) to authenticated;
