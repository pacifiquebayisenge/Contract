create or replace function public.purchase_shop_item_at_price(p_item_id uuid, p_action text, p_expected_price integer)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  listing public.shop_items%rowtype;
  purchase_id uuid;
  payer uuid;
  last_purchase timestamptz;
begin
  select * into listing
  from public.shop_items
  where id = p_item_id and source_item_id is null
    and caller in (creator_id, partner_id)
  for update;

  if not found or listing.price is distinct from p_expected_price then
    raise exception 'The Shop item changed. Refresh before trying again.';
  end if;

  if p_action is null or p_action not in ('accept', 'approve', 'buy_own') then
    raise exception 'This shop action is unavailable';
  end if;

  -- The listing lock also serializes cooldown checks for concurrent purchases.
  payer := case
    when p_action in ('approve', 'buy_own') or listing.kind = 'request' then listing.creator_id
    else listing.partner_id
  end;

  select max(purchase.accepted_at) into last_purchase
  from public.shop_items as purchase
  where purchase.source_item_id = listing.id
    and (case when purchase.kind = 'offer' then purchase.partner_id else purchase.creator_id end) = payer;

  if last_purchase + interval '24 hours' > clock_timestamp() then
    raise exception 'This item can only be purchased once every 24 hours';
  end if;

  -- Keep the listing available and snapshot the details of each individual purchase.
  insert into public.shop_items (source_item_id, creator_id, partner_id, kind, title, description, price, status)
  values (listing.id, listing.creator_id, listing.partner_id, listing.kind, listing.title,
          listing.description, listing.price, listing.status)
  returning id into purchase_id;

  -- A rejected action rolls back the purchase row as well as any balance changes.
  perform public.apply_shop_action(purchase_id, p_action);

  if listing.status = 'proposed' then
    update public.shop_items set status = 'open' where id = listing.id;
  end if;

  return purchase_id;
end;
$$;

revoke all on function public.purchase_shop_item_at_price(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.purchase_shop_item_at_price(uuid, text, integer) to authenticated;
