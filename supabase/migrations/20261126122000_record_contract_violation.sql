alter table public.user_events add column if not exists rule_title text;

create policy "Participants can read recorded violations"
on public.user_events for select to authenticated
using (event_type = 'violation' and (select auth.uid()) in (actor_id, target_id));

create policy "Reporters can insert their violation events"
on public.user_events for insert to authenticated
with check (event_type = 'violation' and (select auth.uid()) = actor_id and actor_id <> target_id);

create function public.record_contract_violation(p_rule_id uuid, p_partner_id uuid)
returns table (credit integer, violation integer, rule_title text, violation_id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  reporter_id uuid := auth.uid();
  violation_cost constant integer := 100;
begin
  if reporter_id is null or p_partner_id is null or reporter_id = p_partner_id then
    raise exception 'A signed-in reporter and another profile are required';
  end if;

  select rule.title into strict rule_title
  from public.contract_rules as rule
  where rule.id = p_rule_id;

  -- Use the current database values so simultaneous violations both count.
  update public.profiles as partner
  set credit = partner.credit - violation_cost,
      violation = partner.violation + 1
  where partner.id = p_partner_id
  returning partner.credit, partner.violation into strict credit, violation;

  -- Keep the title in history even if the rule is renamed or deleted.
  insert into public.user_events (actor_id, target_id, event_type, amount, balance, rule_title)
  values (reporter_id, p_partner_id, 'violation', -violation_cost, credit, rule_title)
  returning id into violation_id;

  return next;
end;
$$;

revoke all on function public.record_contract_violation(uuid, uuid) from public, anon;
grant execute on function public.record_contract_violation(uuid, uuid) to authenticated;
