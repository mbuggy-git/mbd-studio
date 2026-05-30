-- Purchase log for mbd.studio paywall.
-- Written to by the mbd-stripe-webhook Edge Function (service-role key, bypasses RLS)
-- on checkout.session.completed.

create table if not exists public.mbd_purchases (
  id                uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  customer_email    text not null,
  product_slug      text not null default 'ai-workflows',
  amount_paid       integer not null default 0,   -- amount in cents (Stripe amount_total)
  currency          text not null default 'usd',
  marketing_opt_in  boolean not null default false,
  created_at        timestamptz not null default now()
);

-- Webhook looks rows up by session id for its idempotency check.
create index if not exists mbd_purchases_stripe_session_id_idx
  on public.mbd_purchases (stripe_session_id);

-- Service-role key (used by the webhook) bypasses RLS, but enable it so the
-- table isn't exposed to the anon/public API by default.
alter table public.mbd_purchases enable row level security;
