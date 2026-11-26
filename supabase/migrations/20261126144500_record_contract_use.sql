alter table public.user_events
  add column if not exists contract_use_number integer,
  add column if not exists contract_credit_cost integer;

create function public.record_contract_use(p_partner_id uuid)
returns table (streak smallint, credit bigint, event_id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  reporter uuid := auth.uid();
  day_start timestamptz :=
    date_trunc('day', now() at time zone 'Europe/Brussels') at time zone 'Europe/Brussels';
  current_streak smallint;
  previous_use integer;
  next_use integer;
  cost integer;
begin
  if reporter is null or p_partner_id is null or reporter = p_partner_id then
    raise exception 'A signed-in reporter and another profile are required';
  end if;

  -- Serialize registrations for this profile, including simultaneous taps on two devices.
  select partner.streak into strict current_streak
  from public.profiles as partner
  where partner.id = p_partner_id
  for update;

  select coalesce(activity.contract_use_number, current_streak) into previous_use
  from public.user_events as activity
  where activity.target_id = p_partner_id
    and activity.event_type = 'streak_use'
    and activity.created_at >= day_start
  order by activity.created_at desc, activity.contract_use_number desc nulls last
  limit 1;

  next_use := coalesce(previous_use, 0) + 1;
  cost := case when next_use > 3 then 100 else 0 end;

  -- On a new day, reset a stale profile counter before the existing trigger logs the use.
  if current_streak >= next_use then
    update public.profiles set streak = 0 where id = p_partner_id;
  end if;

  update public.profiles as partner
  set streak = next_use, credit = partner.credit - cost
  where partner.id = p_partner_id
  returning partner.streak, partner.credit into strict streak, credit;

  -- Enrich the trigger's event in the same transaction as the counter and charge.
  update public.user_events as activity
  set contract_use_number = next_use, contract_credit_cost = cost
  where activity.actor_id = reporter
    and activity.target_id = p_partner_id
    and activity.event_type = 'streak_use'
    and activity.contract_use_number is null
    and activity.xmin = pg_current_xact_id()::xid
  returning activity.id into strict event_id;

  return next;
end;
$$;

revoke all on function public.record_contract_use(uuid) from public, anon;
grant execute on function public.record_contract_use(uuid) to authenticated;
