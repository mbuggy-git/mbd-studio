-- Saved brands for Brand Palette, one row per apps purchase.
-- The buyer's personal link (mbd_purchases.access_token) is the identity:
-- the mbd-kit-brands function looks the purchase up by token and merges the
-- browser's library into this row, so the brands follow the link to any device.
create table if not exists public.mbd_kit_brands (
  purchase_id uuid primary key references public.mbd_purchases (id) on delete cascade,
  library     jsonb not null default '[]'::jsonb,  -- SavedBrand[]
  deleted     jsonb not null default '{}'::jsonb,  -- { brandId: deletedAt ms } so a delete sticks across devices
  updated_at  timestamptz not null default now()
);

-- Only the edge function (service role) touches this table.
alter table public.mbd_kit_brands enable row level security;

-- New public tables are no longer granted to the API roles automatically.
grant select, insert, update on public.mbd_kit_brands to service_role;
