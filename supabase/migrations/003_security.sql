-- =============================================================
-- Security hardening migration
-- =============================================================

-- 1. Column-level privileges: users can only update safe fields
--    Prevents users from setting subscription_status = 'active'
--    or resetting messages_used = 0 via direct Supabase REST API.
-- =============================================================
revoke update on public.profiles from authenticated;
grant update (full_name, phone, newsletter) on public.profiles to authenticated;

-- 2. Remove dead RLS policy (service_role bypasses RLS entirely)
-- =============================================================
drop policy if exists "Service role full access" on public.profiles;

-- 3. Prevent direct profile creation by authenticated users
--    Profiles are created by the handle_new_user trigger only.
-- =============================================================
create policy "Prevent direct profile creation"
  on public.profiles for insert
  to authenticated
  with check (false);

-- 4. Webhook events table for idempotency
--    Prevents processing the same Stripe event twice.
-- =============================================================
create table if not exists public.webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamp with time zone default now()
);

-- Auto-cleanup: delete events older than 7 days to keep table small
create index if not exists idx_webhook_events_processed_at
  on public.webhook_events (processed_at);

-- No RLS on webhook_events — only accessed by service role
alter table public.webhook_events enable row level security;

-- 5. Update subscription_status check to include new statuses
-- =============================================================
alter table public.profiles drop constraint if exists profiles_subscription_status_check;
alter table public.profiles add constraint profiles_subscription_status_check
  check (subscription_status in ('active', 'inactive', 'past_due', 'canceled', 'paused'));
