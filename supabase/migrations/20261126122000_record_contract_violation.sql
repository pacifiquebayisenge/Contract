create table public.contract_violations (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (id),
  partner_id uuid not null references public.profiles (id),
  rule_id uuid references public.contract_rules (id) on delete set null,
  rule_title text not null,
  credit_cost integer not null check (credit_cost > 0),
  created_at timestamptz not null default now()
);

alter table public.contract_violations enable row level security;

revoke all on public.contract_violations from public, anon, authenticated;
grant select, insert on public.contract_violations to authenticated;

create policy "Participants can read their violations"
on public.contract_violations for select to authenticated
using ((select auth.uid()) in (actor_id, partner_id));

create policy "Users can log violations they report"
on public.contract_violations for insert to authenticated
with check ((select auth.uid()) = actor_id and actor_id <> partner_id);

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
  insert into public.contract_violations (actor_id, partner_id, rule_id, rule_title, credit_cost)
  values (reporter_id, p_partner_id, p_rule_id, rule_title, violation_cost)
  returning id into violation_id;

  return next;
end;
$$;

revoke all on function public.record_contract_violation(uuid, uuid) from public, anon;
grant execute on function public.record_contract_violation(uuid, uuid) to authenticated;
