# Deployment Guide — Wahab Ahmad Portfolio

This is a standard Next.js App Router project configured for **Vercel**.

## 1. Push to GitHub
The project lives on branch `arena/dacaa7b7-pro-portfolio` (this session). Push already done:
```
git push origin arena/dacaa7b7-pro-portfolio
```
Vercel can import directly from GitHub.

## 2. Create Vercel Project
1. Go to https://vercel.com/new
2. Import repository `rj23565/Pro-Portfolio` → select branch `arena/dacaa7b7-pro-portfolio` (or merge to `main` first).
3. Framework preset: **Next.js** (auto-detected).
4. Project root: repository root (default).

## 3. Required Environment Variables
Set these in **Vercel Dashboard → Project → Settings → Environment Variables** (Production + Preview):

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION_SECRET` | **Yes** | Random 32+ char string for signing HttpOnly session cookies. Generate: `openssl rand -base64 32` |
| `DATABASE_URL` | **Yes** | Postgres connection string (Vercel Postgres, Neon, Supabase, etc.). Used for durable portfolio data. Without it, data falls back to `data/store.json` which is ephemeral on Vercel and will be lost on deploy. |
| `BLOB_READ_WRITE_TOKEN` | **Yes** | Vercel Blob read/write token (Storage → Create Blob Store → Connect to project). Uploads need this for durable storage; otherwise they go to `public/uploads/` (ephemeral). |
| `ADMIN_SETUP_TOKEN` | Recommended | If set, `/admin/setup` requires this token to create/rotate admin password. Prevents anyone from hijacking initial setup. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Full site URL for SEO metadata base (e.g., `https://wahabahmad.com`). Defaults to `https://wahabahmad.vercel.app`. |

After setting env vars, **Redeploy** (Deployments → Redeploy).

## 4. Database Setup
The app auto-creates the `site_store` table on first request if `DATABASE_URL` is set. You can also run manual setup:

1. Ensure `DATABASE_URL` is set locally or in Vercel env.
2. Run:
```
npm run db:setup
```
Or apply the SQL in `scripts/schema.sql` to your Postgres via `psql` or dashboard SQL editor:

```sql
create table if not exists site_store (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
insert into site_store (id, data) values ('main', '{}'::jsonb) on conflict do nothing;
```

Backup: regularly dump `site_store`:
```
pg_dump --table=site_store $DATABASE_URL > backup.sql
```
Restore: `psql $DATABASE_URL < backup.sql`

## 5. Blob Storage Setup
1. Vercel Dashboard → **Storage** → **Create → Blob**
2. Name: `wahab-portfolio`
3. Connect to your project → Vercel auto-injects `BLOB_READ_WRITE_TOKEN`.
4. Verify: upload a test image via Admin → Projects; check Blob dashboard for file.

## 6. First Admin Login
1. Visit `https://your-domain.vercel.app/admin/setup`
2. If `ADMIN_SETUP_TOKEN` is set, enter it plus a strong password (min 8 chars).
3. Then go to `/admin/login` and sign in.
4. Change password later by revisiting `/admin/setup` with the setup token.

## 7. Verify Deployment
- Homepage: `https://your-domain.vercel.app/` must load (hero, empty work state, direct contact).
- Admin: `https://your-domain.vercel.app/admin` must redirect to `/admin/login` when not authenticated, and show dashboard after login.
- Check build logs in Vercel → Deployments → View Build Logs (no errors).
- Check storage: Admin → Projects → upload image → verify file appears in Blob store.

## 8. If Credentials Not Available (Local Dev)
The app still runs without `DATABASE_URL` / `BLOB_READ_WRITE_TOKEN`:
- Data stored in `data/store.json` (ignored by Git).
- Uploads stored in `public/uploads/` (ignored by Git).
**Warning banner appears in Admin when running in this mode.** Do not rely on this for production — files are lost on Vercel redeploys.

## 9. Session Secret Rotation
1. Generate new `SESSION_SECRET`.
2. Update in Vercel env vars.
3. Redeploy — all existing sessions are invalidated; admins must log in again.
4. Old secret cannot be used to forge new sessions.

## 10. Custom Domain
Vercel → Settings → Domains → Add `wahabahmad.com` → follow DNS instructions.

## 11. Troubleshooting
- **Build fails: SESSION_SECRET missing** → set it in Vercel env (required for auth).
- **Data resets after deploy** → you are on file fallback; set `DATABASE_URL`.
- **Uploads 404** → set `BLOB_READ_WRITE_TOKEN` and redeploy.
- **Admin 403 CSRF** → ensure cookies enabled; login sets `csrf_token` and requests send `x-csrf-token` header (handled by admin UI).
