alter table public.user_events add column if not exists rule_title text;

create or replace function public.log_violation()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  details jsonb := nullif(current_setting('ugovor.violation_details', true), '')::jsonb;
begin
  if new.violation > old.violation then
    -- Legacy profile updates still log a generic violation.
    insert into public.user_events (id, actor_id, target_id, event_type, amount, rule_title, created_at)
    values (
      coalesce((details ->> 'id')::uuid, gen_random_uuid()),
      auth.uid(),
      new.id,
      'violation',
      (details ->> 'amount')::integer,
      details ->> 'rule_title',
      now()
    );
  end if;

  return new;
end;
$$;

create function public.record_contract_violation(p_rule_id uuid, p_partner_id uuid)
returns table (credit bigint, violation bigint, rule_title text, violation_id uuid)
language plpgsql
security invoker
set search_path = ''
set ugovor.violation_details = ''
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

  -- Pass the event details to the existing trigger only for this function call.
  violation_id := gen_random_uuid();
  perform set_config('ugovor.violation_details', jsonb_build_object(
    'id', violation_id,
    'amount', -violation_cost,
    'rule_title', rule_title
  )::text, true);

  -- Both existing triggers run in this transaction, so a logging failure rolls back the charge.
  update public.profiles as partner
  set credit = partner.credit - violation_cost,
      violation = partner.violation + 1
  where partner.id = p_partner_id
  returning partner.credit, partner.violation into strict credit, violation;

  return next;
end;
$$;

revoke all on function public.record_contract_violation(uuid, uuid) from public, anon;
grant execute on function public.record_contract_violation(uuid, uuid) to authenticated;
