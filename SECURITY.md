# Security Overview — Wahab Ahmad Portfolio

This portfolio uses Next.js App Router with server-side authorization. It is **not claimed to be unhackable**; ordinary controls are applied.

## Authentication
- Admin password is **hashed with bcrypt (cost 12)** and stored in Postgres (`site_store` → `admin.passwordHash`) or file fallback.
- No plaintext passwords are ever stored or logged.
- First-time setup via `/admin/setup`; optional `ADMIN_SETUP_TOKEN` required to create/rotate password in production.
- Login is rate-limited (5 attempts / minute per IP via in-memory sliding window).

## Sessions
- On login, a **JWT (HS256) signed with `SESSION_SECRET`** is issued, stored in an **HttpOnly, Secure (in prod), SameSite=Strict** cookie (`session`), valid 7 days.
- A non-HttpOnly `csrf_token` cookie is also set.
- Every state-changing request (POST/PUT/PATCH/DELETE) is checked for **same-origin (Origin/Referer must match Host)** and **CSRF token (header `x-csrf-token` must equal `csrf_token` cookie)** when a session exists.
- Session is verified on the server via `jose` JWT verification; middleware redirects unauthenticated `/admin` to `/admin/login`.

## Cookies
- `session`: HttpOnly, Secure in production, SameSite Strict, path `/`, 7d.
- `csrf_token`: SameSite Strict, accessible to JS for header injection.

## Rate Limiting
- In-memory per-IP sliding window (single-instance; for multi-instance Vercel concurrency, consider Upstash Redis).
- Login: 5/min, upload: 30/min, projects POST: 20/min. Returns 429 with Retry-After.

## Validation & Rendering
- All user-supplied text/URLs validated with **Zod** (max lengths, allowed protocols `https`, `http`, `mailto`, `tel`, `https://wa.me`).
- Text is **escaped on render** (React auto-escapes; no `dangerouslySetInnerHTML` with user content).
- URLs are checked with `new URL()` and protocol allowlist; frontend uses `safeUrl` helper.
- Bounded request bodies: login JSON, site POST 50KB, projects POST 100KB, uploads 5MB images / 10MB PDFs.

## Upload Handling
- Validated mime allowlist: `image/jpeg`, `png`, `webp`, `gif`, `svg+xml` (5MB max), `application/pdf` (10MB max).
- Server checks magic bytes (basic) and stores with UUID filenames (`folder/uuid-original`).
- Durable storage via **Vercel Blob** when `BLOB_READ_WRITE_TOKEN` is set; otherwise local `public/uploads/` (dev only, warned as ephemeral).
- Filenames sanitized (`[^a-zA-Z0-9._-]` → `_`), length capped.

## Headers
Set via `next.config.mjs` and middleware:
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-ancestors 'none';`.

## Storage
- Postgres via `DATABASE_URL` (Vercel Postgres / Neon). Table `site_store` with JSONB `data` column.
- No secrets in frontend bundles; env vars only server-side.
- `.env` and `data/store.json` are gitignored.

## Secrets Management
- Never commit secrets. Set them in **Vercel → Settings → Environment Variables** (encrypted at rest).
- Rotate `SESSION_SECRET` to invalidate all sessions; rotate `ADMIN_SETUP_TOKEN` similarly.
- No AI security bots or external AI integrations — only standard validation and rate limiting.

## Backup & Rotation Steps
1. Dump `site_store`: `pg_dump --table=site_store $DATABASE_URL > backup.sql`
2. Store backup encrypted offsite.
3. To rotate session secret: update Vercel env, redeploy, re-login.
4. To rotate admin password: visit `/admin/setup` with `ADMIN_SETUP_TOKEN`.

## Known Limitations
- Rate limiter is in-memory; for high-concurrency serverless, use Redis.
- No WAF beyond Vercel's edge network.
- File fallback is not durable — must configure Postgres + Blob for production.

## Reporting Issues
Email: rjvlog332@gmail.com with subject "Security — Portfolio".
