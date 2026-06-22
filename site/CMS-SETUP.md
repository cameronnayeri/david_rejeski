# David Rejeski — CMS Setup (Cloudflare)

The site is an Astro SSR app deployed on **Cloudflare Workers**. Project content
lives in **D1** (SQLite) and images in **R2**. Admins manage everything from
`/admin` — no rebuilds; changes are live instantly.

## One-time Cloudflare setup

```bash
cd site

# 1. Create the database and bucket
npx wrangler d1 create david-rejeski          # paste the database_id into wrangler.toml
npx wrangler r2 bucket create david-rejeski-images

# 2. Create the schema (remote)
npx wrangler d1 execute david-rejeski --remote --file=migrations/0001_init.sql

# 3. Import existing projects + images
node migrations/import.mjs
npx wrangler d1 execute david-rejeski --remote --file=migrations/seed.sql
bash migrations/upload-images.sh
```

## Secrets (Cloudflare dashboard → Workers → Settings → Variables)

- `SESSION_SECRET` — long random string that signs login cookies
- `RECOVERY_KEY` — separate secret used to reset a password / add an admin

Generate one with: `openssl rand -base64 32`

## Deploy

Connect the GitHub repo in the Cloudflare dashboard (Workers & Pages → Create →
import repo). Build command `npm run build`, root directory `site`. The D1 and R2
bindings from `wrangler.toml` are picked up automatically.

## Using the CMS

- **First run:** visit `/admin` → redirected to `/admin/setup` to create the first account.
- **Add David:** `/admin/recover` with the `RECOVERY_KEY` + his email + a password.
- **Forgot password:** same `/admin/recover` flow.
- Login cookie lasts 30 days.

## Local development

```bash
cd site
npx wrangler d1 execute david-rejeski --local --file=migrations/0001_init.sql
node migrations/import.mjs
npx wrangler d1 execute david-rejeski --local --file=migrations/seed.sql
npm run dev
```

Local secrets live in `site/.dev.vars` (gitignored).
