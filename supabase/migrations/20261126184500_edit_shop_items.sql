-- Only listing details may be edited directly. The Shop RPC controls its status.
grant update (title, description, price) on public.shop_items to authenticated;

create policy "Creators edit available shop items" on public.shop_items
for update to authenticated
using (auth.uid() = creator_id and status = 'open')
with check (auth.uid() = creator_id and status = 'open');

-- Lock and verify the displayed price before handing the action to the original RPC.
create function public.apply_shop_action_at_price(p_item_id uuid, p_action text, p_expected_price integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_price integer;
begin
  select item.price into current_price from public.shop_items as item
  where item.id = p_item_id and auth.uid() in (item.creator_id, item.partner_id)
  for update;

  if not found or current_price is distinct from p_expected_price then
    raise exception 'The Shop item changed. Refresh before trying again.';
  end if;

  perform public.apply_shop_action(p_item_id, p_action);
end;
$$;

revoke all on function public.apply_shop_action_at_price(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.apply_shop_action_at_price(uuid, text, integer) to authenticated;
