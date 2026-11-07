# Wahab Ahmad — Portfolio

Premium portfolio for **Wahab Ahmad, Graphic Designer & Web Builder** (Faisalabad, Punjab, Pakistan).

- **Live stack:** Next.js 14 App Router + TypeScript, Tailwind, Postgres (Neon/Vercel), Vercel Blob, bcrypt + JWT sessions.
- **Public site:** `https://your-domain.vercel.app/` — hero with reserved portrait, selected work (empty until published), about, services, skills/education (hidden until facts provided), process, direct contact (no form), footer.
- **Admin:** `/admin` — password-protected, keyboard-accessible panel to manage profile, hero, projects/galleries, services, skills, education, contact/social, branding/accent, SEO, uploads.

## Quick Start (Local)
```bash
npm install
# Set .env.local (see .env.example) — SESSION_SECRET required for auth
cp .env.example .env.local
# Generate secret: openssl rand -base64 32
npm run dev
# Visit http://localhost:3000 and /admin/setup to create password
```

## Deployment
See **DEPLOYMENT.md** for Vercel env vars and setup. Summary:
- `SESSION_SECRET` (required)
- `DATABASE_URL` (required for durable data)
- `BLOB_READ_WRITE_TOKEN` (required for durable uploads)
- `ADMIN_SETUP_TOKEN` (recommended)
- `NEXT_PUBLIC_SITE_URL` (optional)

Without DB/Blob, app runs in file fallback (warned in admin) — not suitable for production.

## Admin Content Rules
- No fake projects/testimonials — empty states until you supply work.
- Textile projects show only label “Textile” publicly, no description.
- Homepage featured-work slot reserved for your website-services graphic (upload later).
- Profile photo used exactly as supplied; only background/layout styled.
- Age is editable, optional, never guessed.
- Timelines always approximate: 2–4 weeks, scope-dependent.
- Existing work retained when adding new; exact duplicate images blocked.

## Project Structure
```
app/          → Next.js pages & API routes
components/   → Header, Footer, etc.
lib/          → db, auth, blob, validation
data/         → file fallback store (gitignored)
public/      → static assets, uploads fallback
scripts/     → schema.sql, setup-db.mjs
```

## Security
See **SECURITY.md**. No claims of “unhackable”; standard hashing, HttpOnly cookies, CSRF, rate limiting, validation, security headers.

## Contact (Public)
- Email: rjvlog332@gmail.com
- WhatsApp: +92 317-0643281
- Mobile: 03017013821
- Location: Faisalabad, Punjab, Pakistan
Social links hidden until configured in admin.

## License
Private — all rights reserved to Wahab Ahmad. No distribution.
