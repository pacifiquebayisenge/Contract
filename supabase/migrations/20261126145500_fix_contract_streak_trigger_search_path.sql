-- The existing trigger refers to user_events without qualifying its schema.
alter function public.log_streak_changes()
  set search_path = pg_catalog, public, pg_temp;
