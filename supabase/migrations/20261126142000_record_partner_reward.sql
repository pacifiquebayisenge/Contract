create function public.record_partner_reward(
  p_partner_id uuid,
  p_amount integer,
  p_description text
)
returns table (reward_id uuid, credit bigint)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  giver uuid := auth.uid();
  description text := btrim(p_description);
begin
  if giver is null or p_partner_id is null or giver = p_partner_id then
    raise exception 'A signed-in giver and another profile are required';
  end if;

  if p_amount is null or p_amount not between 100 and 1000 or p_amount % 100 <> 0
    or description is null or description = '' then
    raise exception 'A valid reward amount and description are required';
  end if;

  -- The existing credit trigger still logs the change for Stats.
  update public.profiles as partner
  set credit = partner.credit + p_amount
  where partner.id = p_partner_id
  returning partner.credit into strict credit;

  insert into public.credit_increases (id, giver_id, receiver_id, amount, description, created_at)
  values (gen_random_uuid(), giver, p_partner_id, p_amount, description, now())
  returning id into reward_id;

  return next;
end;
$$;

revoke all on function public.record_partner_reward(uuid, integer, text) from public, anon;
grant execute on function public.record_partner_reward(uuid, integer, text) to authenticated;
