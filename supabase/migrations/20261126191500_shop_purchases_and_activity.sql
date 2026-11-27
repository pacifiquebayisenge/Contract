alter table public.shop_items
  add column if not exists accepted_by uuid references public.profiles(id);

grant select on public.shop_items to service_role;

create or replace function public.apply_shop_action(p_item_id uuid, p_action text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  item public.shop_items%rowtype;
  payer uuid;
  performer uuid;
begin
  select * into item from public.shop_items where id = p_item_id for update;
  if not found or caller is null or caller not in (item.creator_id, item.partner_id) then
    raise exception 'Shop item is unavailable';
  end if;

  performer := case when item.kind = 'offer' then item.creator_id else item.partner_id end;

  -- Publishing leaves the performer open. A proposal never charges the creator.
  if item.kind = 'undecided' then
    if item.status = 'open' and caller = item.partner_id and p_action = 'propose' then
      update public.shop_items set status = 'proposed' where id = item.id;
      return;
    elsif item.status = 'proposed' and p_action = 'decline' then
      update public.shop_items set status = 'open' where id = item.id;
      return;
    elsif item.status = 'proposed' and p_action = 'approve' and caller = item.creator_id then
      item.kind := 'request';
    elsif item.status = 'open' and p_action = 'accept' and caller = item.partner_id then
      item.kind := 'offer';
    end if;
  end if;

  if p_action = 'buy_own' and item.status = 'open' and caller = item.creator_id then
    item.kind := 'request';
  end if;

  payer := case when item.kind = 'offer' then item.partner_id else item.creator_id end;

  if (p_action = 'accept' and item.status = 'open' and caller = item.partner_id)
    or (p_action = 'buy_own' and item.status = 'open' and caller = item.creator_id)
    or (p_action = 'approve' and item.status = 'proposed' and caller = item.creator_id) then
    -- A failed debit leaves the listing open. The item lock prevents double spending.
    update public.profiles set credit = credit - item.price
    where id = payer and credit >= item.price;
    if not found then raise exception 'Not enough credits'; end if;

    update public.shop_items set kind = item.kind, status = 'accepted', accepted_at = now(), accepted_by = caller where id = item.id;
  elsif p_action = 'complete' and item.status = 'accepted' and caller = performer then
    update public.shop_items set status = 'completed' where id = item.id;
  elsif p_action = 'withdraw' and item.status = 'open' and caller = item.creator_id then
    update public.shop_items set status = 'withdrawn' where id = item.id;
  else
    raise exception 'This shop action is unavailable';
  end if;
end;
$$;

revoke all on function public.apply_shop_action(uuid, text) from public, anon, authenticated;
grant execute on function public.apply_shop_action(uuid, text) to authenticated;
