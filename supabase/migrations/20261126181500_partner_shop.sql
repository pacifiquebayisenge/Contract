create table public.shop_items (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id),
  partner_id uuid not null references public.profiles(id),
  kind text not null check (kind in ('offer', 'request')),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  description text not null check (char_length(btrim(description)) between 1 and 500),
  price integer not null check (price between 1 and 100000),
  status text not null default 'open' check (status in ('open', 'accepted', 'completed', 'withdrawn')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  check (creator_id <> partner_id)
);

alter table public.shop_items enable row level security;
revoke all on public.shop_items from public, anon, authenticated;
grant select, insert (creator_id, partner_id, kind, title, description, price)
  on public.shop_items to authenticated;

create policy "Participants read shop items" on public.shop_items
for select to authenticated using (auth.uid() in (creator_id, partner_id));

create policy "Creators publish shop items" on public.shop_items
for insert to authenticated with check (auth.uid() = creator_id and status = 'open');

alter function public.log_credit_changes() set search_path = pg_catalog, public, pg_temp;

create function public.apply_shop_action(p_item_id uuid, p_action text)
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

  payer := case when item.kind = 'offer' then item.partner_id else item.creator_id end;
  performer := case when item.kind = 'offer' then item.creator_id else item.partner_id end;

  if p_action = 'accept' and item.status = 'open' and caller = item.partner_id then
    -- A failed debit leaves the listing open. The item lock prevents double spending.
    update public.profiles set credit = credit - item.price
    where id = payer and credit >= item.price;
    if not found then raise exception 'Not enough credits'; end if;

    update public.shop_items set status = 'accepted', accepted_at = now() where id = item.id;
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
