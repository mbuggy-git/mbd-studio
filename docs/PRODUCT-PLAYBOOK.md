# Product playbook — selling a PDF on mbd.studio

How the paid-download pipeline works and, more importantly, the exact checklist
for launching the next product. Written 2026-07 after shipping the first two
products (AI Workflows, Claude & Me).

## How a purchase flows

```
Buyer on product page (e.g. /get-the-goods/figma-to-claude)
  → "Get the Guide" button POSTs { slug } to the mbd-create-checkout Edge Function
  → function looks up the product's Stripe price ID (from a Supabase secret)
    and creates a Stripe Checkout session (metadata.product_slug = slug)
  → buyer pays on Stripe's hosted checkout page
  → Stripe fires checkout.session.completed at the mbd-stripe-webhook Edge Function
  → webhook: verifies signature → idempotency check → creates a 7-day signed
    download URL from the private mbd-products Storage bucket → logs the row in
    mbd_purchases → emails the link via Resend (from hello@mbd.studio)
  → meanwhile Stripe redirects the buyer to /thank-you ("check your email")
```

## The moving parts

| Piece | Where | Notes |
|---|---|---|
| Product pages + catalog | `src/app/pages/AiWorkflowsPage.tsx`, `FigmaToClaudePage.tsx`, `src/app/components/GetTheGoods.tsx`, routes in `src/app/App.tsx` | Deployed by pushing to `main` (Vercel) |
| Checkout function | `supabase/functions/mbd-create-checkout/index.ts` | Slug → price-ID allowlist lives here |
| Webhook function | `supabase/functions/mbd-stripe-webhook/index.ts` | Slug → PDF/email-copy map lives here |
| Product PDFs | Supabase Storage, private bucket `mbd-products` (also mirrored locally in `products/`, which is gitignored — never commit them) | Buyers get 7-day signed URLs |
| Purchase log | Supabase table `mbd_purchases` (migration `supabase/migrations/20260530070421_create_mbd_purchases.sql`) | RLS enabled; only the webhook (service role) writes. Includes `marketing_opt_in` from Stripe's consent checkbox |
| Prices/products | Stripe Dashboard | One Product + Price per PDF |
| Email | Resend, domain mbd.studio, sender `hello@mbd.studio` | Plain HTML template inside the webhook function |

Secrets (set via `npx supabase secrets set NAME=value`, values in the usual
password manager — never in the repo):

- `MBD_STRIPE_SECRET_KEY` — Stripe API key (shared by both functions)
- `MBD_STRIPE_WEBHOOK_SECRET` — signing secret of the Stripe webhook endpoint
- `MBD_STRIPE_PRICE_ID` — price for `ai-workflows`
- `MBD_STRIPE_PRICE_ID_CLAUDE` — price for `figma-to-claude`
- `MBD_SUPABASE_SERVICE_ROLE_KEY` — lets the webhook write the table + sign URLs
- `MBD_RESEND_API_KEY` — Resend

## Launch checklist for the next product

Pick a slug first (kebab-case, e.g. `motion-basics`) — it's the URL, the Stripe
metadata, and the key in both functions.

**1. Upload the PDF**
Supabase Dashboard → Storage → `mbd-products` bucket → upload the final PDF.
Keep the bucket private. Note the exact filename.

**2. Create the price in Stripe**
Stripe Dashboard → Products → Add product (name, $ price, one-time). Copy the
price ID (`price_…`).

**3. Store the price ID as a secret**

```bash
npx supabase secrets set MBD_STRIPE_PRICE_ID_<PRODUCT>=price_xxx
```

**4. Register the product in both Edge Functions**

- `supabase/functions/mbd-create-checkout/index.ts` — add to `PRICE_ENV_BY_SLUG`:
  `"<slug>": "MBD_STRIPE_PRICE_ID_<PRODUCT>"`.
- `supabase/functions/mbd-stripe-webhook/index.ts` — add to `PRODUCTS`:
  `pdfPath` (filename from step 1), `title`, `emailSubject`, `ctaLabel`.

Deploy both (the `--no-verify-jwt` flag matters — Stripe calls the webhook
unauthenticated, and the checkout function is called with only the anon key):

```bash
npx supabase functions deploy mbd-create-checkout --no-verify-jwt
npx supabase functions deploy mbd-stripe-webhook --no-verify-jwt
```

No Stripe Dashboard webhook changes needed — the existing endpoint
(`…/functions/v1/mbd-stripe-webhook`, event `checkout.session.completed`)
covers every product because the slug travels in the session metadata.

**5. Build the site pages**

- Copy `src/app/pages/FigmaToClaudePage.tsx` (the newer of the two product
  pages) as the starting point; set `PRODUCT_SLUG` to the new slug. The buy
  button must POST `{ slug: PRODUCT_SLUG }` to `mbd-create-checkout`.
- Add a card to the `products` array in `src/app/components/GetTheGoods.tsx`
  (cover image goes in `src/assets/`).
- Add the route in `src/app/App.tsx`:
  `/get-the-goods/<slug>` → the new page.
- Commit and push — Vercel deploys.

**6. Test the whole loop before announcing**

- [ ] Buy button redirects to Stripe Checkout with the right product/price.
- [ ] Cancel from Stripe returns to the product page (`cancel_url` uses the slug).
- [ ] Complete a real purchase (cheapest sanity check: buy it yourself and
      refund in the Stripe Dashboard afterwards).
- [ ] Redirected to `/thank-you`.
- [ ] Email arrives from hello@mbd.studio with the right title/subject/CTA.
- [ ] Download link works and is the right PDF.
- [ ] Row appears in `mbd_purchases` with the right `product_slug`.
- [ ] Function logs are clean: Supabase Dashboard → Edge Functions → logs for
      both functions.

## Operational notes

- **Buyer lost the email / link expired:** create a fresh signed URL in the
  Supabase Dashboard (Storage → `mbd-products` → file → Create signed URL,
  7 days) and reply from hello@mbd.studio. Purchases are verifiable in
  `mbd_purchases` by email.
- **Idempotency:** the webhook skips sessions it has already processed
  (unique `stripe_session_id`), so Stripe retries are harmless.
- **Unknown slug safety nets:** checkout falls back to `ai-workflows` if the
  body is missing/unknown; the webhook falls back the same way. If a buyer
  ever reports getting the wrong PDF, check that both maps have the slug.
- **Marketing list:** `marketing_opt_in` in `mbd_purchases` records Stripe's
  promotional-consent checkbox — filter on it before adding anyone to a list.
- **Repo vs deployed truth:** the Edge Function source in this repo is only
  the record; what runs is whatever was last `supabase functions deploy`ed.
  After editing a function, always deploy *and* commit so they stay in sync.
  (`npx supabase functions download <name>` fetches the deployed source if
  they ever drift.)
