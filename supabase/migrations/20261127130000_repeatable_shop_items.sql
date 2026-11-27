alter table public.shop_items
  add column source_item_id uuid references public.shop_items(id);

-- Reopen existing purchased services as listings, keeping the original purchases intact.
with previous_purchases as materialized (
  select item.*, gen_random_uuid() as listing_id
  from public.shop_items as item
  where item.source_item_id is null and item.status in ('accepted', 'completed')
), reopened as (
  insert into public.shop_items (id, creator_id, partner_id, kind, title, description, price, created_at)
  select listing_id, creator_id, partner_id, 'undecided', title, description, price, created_at
  from previous_purchases
  returning id
)
update public.shop_items as item
set source_item_id = previous.listing_id
from previous_purchases as previous
join reopened on reopened.id = previous.listing_id
where item.id = previous.id;

create function public.purchase_shop_item_at_price(p_item_id uuid, p_action text, p_expected_price integer)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  listing public.shop_items%rowtype;
  purchase_id uuid;
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
