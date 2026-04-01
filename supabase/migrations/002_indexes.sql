-- Performance indexes for profiles table at scale
-- Primary key (id) and UNIQUE constraints (stripe_customer_id, stripe_subscription_id)
-- already have implicit indexes. These cover the remaining hot query paths.

-- Subscription status: filtered in usage checks, webhook updates, admin queries
create index if not exists idx_profiles_subscription_status
  on public.profiles (subscription_status);

-- Email: lookup by email (admin, support, deduplication)
create index if not exists idx_profiles_email
  on public.profiles (email);

-- Composite: usage endpoint reads subscription_status + usage columns by id
-- Covers the hot path: SELECT subscription_status, messages_used, voice_seconds_used WHERE id = ?
create index if not exists idx_profiles_id_usage
  on public.profiles (id)
  include (subscription_status, messages_used, voice_seconds_used);

-- Created at: sorting, analytics, pagination
create index if not exists idx_profiles_created_at
  on public.profiles (created_at desc);

-- Partial index: quickly find active subscribers (Stripe webhook reconciliation, admin dashboards)
create index if not exists idx_profiles_active_subscribers
  on public.profiles (stripe_subscription_id)
  where subscription_status = 'active';
