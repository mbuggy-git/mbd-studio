# MBD Studio Client Portal

A private, read-only portal at **mbd.studio/client** where a client signs in with
MBD Studio credentials and sees their current uninvoiced hours, uninvoiced total,
and detailed time entries — pulled live from Harvest. The client never touches
Harvest; it's only the back-end data source.

## How it works

- **Frontend:** two React pages in the existing Vite app —
  `src/app/pages/ClientLoginPage.tsx` (`/client/login`) and
  `src/app/pages/ClientPortalPage.tsx` (`/client`).
- **Backend:** Vercel serverless functions in `api/portal/` —
  `login`, `logout`, `session`, and `uninvoiced` (the Harvest proxy).
  Shared helpers live in `api/_lib/` (underscore-prefixed = not exposed as endpoints).
- **Auth:** two accounts, both defined by env vars: a client account
  (`CLIENT_LOGIN_EMAIL` / `CLIENT_PASSWORD_HASH`, locked to `HARVEST_CLIENT_ID`)
  and an optional admin account (`ADMIN_LOGIN_EMAIL` / `ADMIN_PASSWORD_HASH`).
  A successful login sets a signed, HttpOnly, SameSite=Lax session cookie
  (Secure in production), valid 7 days, carrying the account's role. All Harvest
  data requests require it.
- **Admin role:** an admin session gets a "Viewing client" dropdown on the portal
  (fed by admin-only `/api/portal/clients`, listing active Harvest clients) and may
  pass `?client=<id>` to `/api/portal/uninvoiced` to view any client's numbers.
  Client sessions cannot choose a client — the param is ignored for them, and the
  `PORTAL_EARLIEST_DATE` clamp applies only when viewing the default client.
- **Harvest:** all calls happen server-side using `HARVEST_ACCESS_TOKEN` +
  `HARVEST_ACCOUNT_ID`. Data is filtered to `HARVEST_CLIENT_ID` (unbilled,
  billable entries only) and stripped down to date / project / task /
  description / hours plus summary totals. The browser can never choose a
  client ID, and rates/other clients are never returned.
- `vercel.json` was updated so the SPA rewrite excludes `/api/` routes.

## Setup

### 1. Harvest Personal Access Token

1. Go to https://id.getharvest.com/developers
2. Click **Create new personal access token**, name it e.g. "MBD Studio portal".
3. Copy the token → `HARVEST_ACCESS_TOKEN`.
4. The same page shows your accounts with their IDs. Copy the numeric
   **Account ID** for your Harvest account → `HARVEST_ACCOUNT_ID`.

### 2. Client's Harvest Client ID

In Harvest, open **Manage → Clients** and click the client. The number at the
end of the URL (e.g. `.../clients/1234567`) is the client ID → `HARVEST_CLIENT_ID`.

(Or run: `curl -H "Authorization: Bearer TOKEN" -H "Harvest-Account-Id: ID" https://api.harvestapp.com/v2/clients` and find them by name.)

### 3. Client login credentials

Pick the email the client will sign in with → `CLIENT_LOGIN_EMAIL`.

Generate the password hash (the plain password is never stored):

```bash
node scripts/hash-portal-password.mjs "the-password-you-give-the-client"
```

Copy the `scrypt:...` output → `CLIENT_PASSWORD_HASH`.

### 3b. Admin login (optional)

Pick your own admin email → `ADMIN_LOGIN_EMAIL`, and hash a password the same
way → `ADMIN_PASSWORD_HASH`. Signing in with these at `/client/login` gives an
admin session with a client switcher that can view any active Harvest client.
Leave both unset to disable the admin login.

### 4. Session secret

```bash
openssl rand -hex 32
```

Copy the output → `SESSION_SECRET`.

### 5. Configure environment variables

**On Vercel (production):** Project → Settings → Environment Variables. Add all
six variables from `.env.example` for the Production environment (and Preview if
you want the portal working on preview deploys). These are plain server-side
vars — do **not** prefix them with `VITE_`, which would expose them to the browser.

**Locally:** copy `.env.example` to `.env` and fill it in (`.env` is gitignored).

### 6. Run locally

The regular `corepack pnpm run dev` serves only the frontend — the `/api`
functions won't exist, so the portal pages will show a data error. To run the
full thing locally, use the Vercel CLI, which runs both:

```bash
npx vercel dev
```

(First run will ask you to log in and link the project; `vercel dev` reads
env vars from `.env`, or pull the Vercel ones with `npx vercel env pull`.)

### 7. Deploy

Same as the rest of the site — push to `main`:

```bash
git add . && git commit -m "Add client portal" && git push
```

Vercel builds the Vite app and the `api/` functions together. Once env vars are
set and the deploy is live, send the client:

- URL: **https://mbd.studio/client**
- The email and password you configured.

## Security notes

- Harvest credentials exist only as Vercel server-side env vars — never in the
  browser bundle, HTML, API responses, or git.
- The dashboard's data endpoint (`/api/portal/uninvoiced`) returns 401 without a
  valid session cookie; the page itself redirects to `/client/login` in that case.
- Date inputs are validated server-side (format, order, and Harvest's 365-day
  report limit).
- Login attempts are lightly throttled per IP (best-effort, per serverless instance).
- To change the client's password: re-run the hash script, update
  `CLIENT_PASSWORD_HASH` on Vercel, redeploy (env changes need a redeploy).
- To revoke access instantly: rotate `SESSION_SECRET` (invalidates all sessions).

## Fixed-price-era hours

Time tracked while billing was per-project is never linked to an invoice in
Harvest, so the API reports it as "uninvoiced" forever. Set the optional
`PORTAL_EARLIEST_DATE` env var (YYYY-MM-DD, the day hourly billing started) and
the portal clamps every query to that date server-side — older entries can
never appear, regardless of the date filter.
