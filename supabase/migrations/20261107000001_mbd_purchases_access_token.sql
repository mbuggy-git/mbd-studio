-- Kit purchases carry a personal, non-expiring access token. The buyer's
-- confirmation email links to https://mbd.studio/kit/<token>, which the
-- mbd-kit-access function validates before opening the apps.
alter table public.mbd_purchases
  add column if not exists access_token text unique;

create index if not exists mbd_purchases_customer_email_idx
  on public.mbd_purchases (lower(customer_email));
