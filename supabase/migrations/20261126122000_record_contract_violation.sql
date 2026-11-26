alter table public.user_events add column if not exists rule_title text;

create or replace function public.log_violation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.violation > old.violation then
    insert into public.user_events (actor_id, target_id, event_type, created_at)
    values (auth.uid(), new.id, 'violation', clock_timestamp());
  end if;

  return new;
end;
$$;

drop function if exists public.record_contract_violation(uuid, uuid);

create function public.record_contract_violation(p_rule_id uuid, p_partner_id uuid)
returns table (credit bigint, violation bigint, rule_title text, violation_id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  reporter_id uuid := auth.uid();
  violation_cost constant integer := 100;
  started_at timestamptz;
begin
  if reporter_id is null or p_partner_id is null or reporter_id = p_partner_id then
    raise exception 'A signed-in reporter and another profile are required';
  end if;

  select rule.title into strict rule_title
  from public.contract_rules as rule
  where rule.id = p_rule_id;

  started_at := clock_timestamp();

  -- Both existing triggers run in this transaction, so a logging failure rolls back the charge.
  update public.profiles as partner
  set credit = partner.credit - violation_cost,
      violation = partner.violation + 1
  where partner.id = p_partner_id
  returning partner.credit, partner.violation into strict credit, violation;

  -- Enrich the Violation created by this transaction, leaving the credit event intact.
  update public.user_events as activity
  set amount = -violation_cost,
      rule_title = record_contract_violation.rule_title
  where activity.actor_id = reporter_id
    and activity.target_id = p_partner_id
    and activity.event_type = 'violation'
    and activity.created_at >= started_at
    and activity.rule_title is null
    and activity.xmin = pg_current_xact_id()::xid
  returning activity.id into strict violation_id;

  return next;
end;
$$;

revoke all on function public.record_contract_violation(uuid, uuid) from public, anon;
grant execute on function public.record_contract_violation(uuid, uuid) to authenticated;
