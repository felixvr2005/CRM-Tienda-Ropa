# PR — Robustness & QA: checkout E2E, webhook idempotency, newsletter unsubscribe, CI hardening

Summary
- Adds webhook idempotency guard and tests.
- Implements newsletter unsubscribe (API + UI + email link).
- Adds Playwright E2E for newsletter flow and unit tests for webhook idempotency.
- Adds runtime guards for secrets (ensureEnv) and optional Sentry integration via `SENTRY_DSN`.
- Fixes accessibility issues and removes prerender warnings by switching some routes to server-rendered.
- Updates CI: build → unit tests → preview → Playwright E2E; adds secrets-check and Lighthouse placeholder.

How to test locally
1. npm ci
2. npm run build
3. npm test (unit)
4. npx playwright install && npm run test:e2e (optional, E2E)

Checklist for QA
- [ ] Checkout checkout flow (add-to-cart → checkout → Pagar) — verify validation and redirect to Stripe (test mode).
- [ ] Simulate Stripe webhook delivery twice — confirm single order created (idempotency).
- [ ] Subscribe to newsletter → receive code (in staging) → follow unsubscribe link → confirm unsubscribed.
- [ ] Run Lighthouse on key pages (home, PDP, checkout) and fix any critical accessibility/seo issues.
- [ ] Verify secrets in deployment (STRIPE_*, SUPABASE_*, GMAIL_*) are present and rotated.

Notes for deploy
- Ensure secrets exist in the hosting provider and in GitHub Actions secrets.
- To enable Sentry set `SENTRY_DSN` in secrets.

Files changed (high level)
- src/pages/api/webhooks/stripe.ts (idempotency + logging)
- src/pages/api/newsletter/{subscribe,unsubscribe}.ts
- src/pages/unsubscribe.astro
- src/lib/{ensureEnv,logger}.ts
- tests: unit + e2e
- .github/workflows/ci.yml (E2E + secrets checks)

Recommended next PR: add Playwright E2E for checkout happy path with Stripe mock and add Lighthouse fixes from report.