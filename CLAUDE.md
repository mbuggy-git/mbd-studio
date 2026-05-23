# CLAUDE.md — mbd.studio

Standing briefing for Claude Code sessions in this project. Read this first.

## What this is

The mbd.studio website, migrated out of Figma Make into a local Vite/React/TypeScript
project so it can be maintained directly in Claude Code (rather than edited in Figma Make).

## Stack

- **Build tool:** Vite 6.3.5
- **Framework:** React 18.3.1 + TypeScript
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) + shadcn/ui components (Radix UI primitives)
- **Other notable deps:** motion, recharts, react-router / react-router-dom, react-hook-form,
  embla-carousel, sonner. (Some Supabase/hono deps are present from the Figma export — confirm
  whether they're actually wired up before relying on them.)

## Package manager — IMPORTANT

This project uses **pnpm, pinned to version 10** via the `"packageManager": "pnpm@10.15.0"`
field in package.json. This pin is deliberate and must not be removed.

Why it matters: the Figma Make export includes a `pnpm.overrides` field (pinning vite).
pnpm v11 *ignores* that field; pnpm v10 *reads* it. Vercel builds with pnpm 10. If local and
Vercel use different pnpm versions, the lockfile and package.json disagree and Vercel fails
the build with `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`. Pinning to 10 keeps both sides in sync.

- The system's global pnpm may be v11, so the bare `pnpm` command can fail with
  `command not found` in the terminal. Use `corepack pnpm <command>` to honor the v10 pin.
- If the lockfile ever needs regenerating: `corepack use pnpm@10.15.0 && pnpm install`,
  then commit BOTH package.json and pnpm-lock.yaml together.
- The pnpm warning "Ignored build scripts: @tailwindcss/oxide, esbuild" is normal and safe;
  do NOT run `pnpm approve-builds`.

## Local dev workflow

```bash
cd ~/mbd-studio
corepack pnpm install      # if deps changed
corepack pnpm run dev      # preview locally
```

## Deploy workflow (push-to-deploy)

```bash
git add .
git commit -m "message"
git push                   # auto-triggers Vercel build + deploy
```

- **GitHub repo:** https://github.com/mbuggy-git/mbd-studio
- **Host:** Vercel (auto-deploys on push to `main`). Framework preset: Vite. Root dir: `./`.
- **Domain:** mbd.studio (connected via Vercel Domains + DNS records at the registrar).
- Vercel only builds what's pushed to GitHub — confirm a `git push` actually completed
  (`git status` → "up to date with origin/main") before expecting a new deployment.

## Figma Make export quirks to be aware of

- **Duplicate dependency aliases:** every package in package.json is listed twice — once
  normally (`"clsx": "2.1.1"`) and once as a self-referential alias
  (`"clsx@2.1.1": "npm:clsx@2.1.1"`). This is a harmless Figma artifact. Leave it alone unless
  doing a deliberate, tested cleanup — don't "tidy" it mid-task.
- **`vite-plugin-figma-assets.ts`:** Figma-specific asset handler. If a build ever breaks
  around asset/image imports, this is the first place to look.
- React is declared only in `peerDependencies` (as optional), not `dependencies` — unusual,
  but it builds and runs, so don't change it without a reason.

## Conventions

- Keep edits scoped and minimal; this is a live site.
- Don't remove the pnpm version pin or the `.gitignore` entries (node_modules, dist, .env*).
- `.env` files are gitignored — never commit secrets.
